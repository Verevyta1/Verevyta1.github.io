import { applyAbsorption } from '../economy/run-state';
import { GameNumber } from '../numbers/game-number';
import type { MatterObjectDefinition } from '../content/content-definitions';
import { createInitialGameState, type GameState } from './game-state';

export const SIMULATION_STEP_MS = 50;
export const MAX_FRAME_CATCH_UP_MS = 250;
export const OBJECT_SPAWN_INTERVAL_MS = 850;
export const MAX_ACTIVE_OBJECTS = 24;
export const UNCOLLECTED_OBJECT_LIFETIME_MS = 18_000;
export const ATTRACTION_DURATION_MS = 1_400;
export const GRAVITY_PULSE_DURATION_MS = 3_500;
export const GRAVITY_PULSE_COOLDOWN_MS = 10_000;
export const GRAVITY_PULSE_SPEED_MULTIPLIER = 2.25;

export type MatterObjectPhase = 'drifting' | 'attracting';

export interface MatterObjectInstance {
  readonly instanceId: number;
  readonly definitionId: string;
  readonly angleRadians: number;
  readonly orbitRadius: number;
  readonly ageMs: number;
  readonly phase: MatterObjectPhase;
  readonly attractionProgressMs: number;
}

export interface GreyboxSimulationState {
  readonly game: GameState;
  readonly objects: readonly MatterObjectInstance[];
  readonly elapsedMs: number;
  readonly spawnAccumulatorMs: number;
  readonly spawnIndex: number;
  readonly nextInstanceId: number;
  readonly frameAccumulatorMs: number;
  readonly gravityPulseRemainingMs: number;
  readonly gravityPulseCooldownMs: number;
  readonly totalAbsorptions: number;
}

export interface AbsorbedObjectEvent {
  readonly instanceId: number;
  readonly definitionId: string;
  readonly massReward: string;
  readonly matterReward: string;
}

export interface GreyboxSimulationFrame {
  readonly state: GreyboxSimulationState;
  readonly absorbedObjects: readonly AbsorbedObjectEvent[];
}

/** Creates immutable, deterministic simulation state around the authoritative run state. */
export function createInitialGreyboxSimulationState(
  game: GameState = createInitialGameState(),
): GreyboxSimulationState {
  return freezeState({
    game,
    objects: Object.freeze([]),
    elapsedMs: 0,
    spawnAccumulatorMs: 0,
    spawnIndex: 0,
    nextInstanceId: 1,
    frameAccumulatorMs: 0,
    gravityPulseRemainingMs: 0,
    gravityPulseCooldownMs: 0,
    totalAbsorptions: 0,
  });
}

/** Starts one bounded Gravity Pulse. Repeated presses during cooldown are ignored. */
export function activateGravityPulse(state: GreyboxSimulationState): GreyboxSimulationState {
  if (state.gravityPulseCooldownMs > 0) {
    return state;
  }

  return freezeState({
    ...state,
    gravityPulseRemainingMs: GRAVITY_PULSE_DURATION_MS,
    gravityPulseCooldownMs: GRAVITY_PULSE_COOLDOWN_MS,
  });
}

/**
 * Advances the economy in fixed deterministic steps. Excess frame time is capped
 * so returning from a suspended tab does not simulate a huge foreground burst.
 */
export function advanceGreyboxSimulation(
  state: GreyboxSimulationState,
  deltaMs: number,
  definitions: readonly MatterObjectDefinition[],
): GreyboxSimulationFrame {
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    throw new RangeError('Simulation delta must be a finite non-negative number.');
  }

  if (deltaMs === 0) {
    return Object.freeze({ state, absorbedObjects: Object.freeze([]) });
  }

  const byId = new Map(definitions.map((definition) => [definition.id, definition]));
  let accumulated = state.frameAccumulatorMs + Math.min(deltaMs, MAX_FRAME_CATCH_UP_MS);
  let nextState = state;
  const absorbedObjects: AbsorbedObjectEvent[] = [];

  while (accumulated >= SIMULATION_STEP_MS) {
    const step = advanceFixedStep(nextState, byId);
    nextState = step.state;
    absorbedObjects.push(...step.absorbedObjects);
    accumulated -= SIMULATION_STEP_MS;
  }

  nextState = freezeState({ ...nextState, frameAccumulatorMs: accumulated });

  return Object.freeze({
    state: nextState,
    absorbedObjects: Object.freeze(absorbedObjects),
  });
}

function advanceFixedStep(
  state: GreyboxSimulationState,
  definitions: ReadonlyMap<string, MatterObjectDefinition>,
): GreyboxSimulationFrame {
  const activePulseMs = Math.min(SIMULATION_STEP_MS, state.gravityPulseRemainingMs);
  const normalAttractionMs = SIMULATION_STEP_MS - activePulseMs;
  const pulseRemainingMs = Math.max(0, state.gravityPulseRemainingMs - SIMULATION_STEP_MS);
  const gravityPulseCooldownMs = Math.max(
    0,
    state.gravityPulseCooldownMs - SIMULATION_STEP_MS,
  );
  const objects: MatterObjectInstance[] = [];
  const absorbedObjects: AbsorbedObjectEvent[] = [];
  let game = state.game;
  let totalAbsorptions = state.totalAbsorptions;

  for (const object of state.objects) {
    const definition = definitions.get(object.definitionId);

    if (!definition) {
      throw new RangeError('An active matter object has no matching content definition.');
    }

    const ageMs = object.ageMs + SIMULATION_STEP_MS;
    let phase = object.phase;
    let attractionProgressMs = object.attractionProgressMs;

    if (phase === 'drifting') {
      const eligible = isMatterObjectEligible(game.run.mass, definition);

      if (eligible) {
        phase = 'attracting';
      } else if (ageMs >= UNCOLLECTED_OBJECT_LIFETIME_MS) {
        continue;
      }
    }

    if (phase === 'attracting') {
      attractionProgressMs +=
        normalAttractionMs + activePulseMs * GRAVITY_PULSE_SPEED_MULTIPLIER;

      if (attractionProgressMs >= ATTRACTION_DURATION_MS) {
        const nextRun = applyAbsorption(game.run, {
          mass: definition.massReward,
          matter: definition.matterReward,
        });

        game = createInitialGameState({
          run: { mass: nextRun.mass, matter: nextRun.matter },
        });
        totalAbsorptions += 1;
        absorbedObjects.push(
          Object.freeze({
            instanceId: object.instanceId,
            definitionId: object.definitionId,
            massReward: definition.massReward,
            matterReward: definition.matterReward,
          }),
        );
        continue;
      }
    }

    objects.push(
      Object.freeze({
        ...object,
        ageMs,
        phase,
        attractionProgressMs,
      }),
    );
  }

  let spawnAccumulatorMs = state.spawnAccumulatorMs + SIMULATION_STEP_MS;
  let nextInstanceId = state.nextInstanceId;
  let spawnIndex = state.spawnIndex;

  if (spawnAccumulatorMs >= OBJECT_SPAWN_INTERVAL_MS) {
    spawnAccumulatorMs -= OBJECT_SPAWN_INTERVAL_MS;

    if (objects.length < MAX_ACTIVE_OBJECTS && definitions.size > 0) {
      const definition = selectDefinition([...definitions.values()], spawnIndex);
      const seed = seededUnit(spawnIndex + 1);

      objects.push(
        Object.freeze({
          instanceId: nextInstanceId,
          definitionId: definition.id,
          angleRadians: seed * Math.PI * 2,
          orbitRadius: 145 + seededUnit(spawnIndex + 37) * 110,
          ageMs: 0,
          phase: 'drifting',
          attractionProgressMs: 0,
        }),
      );
      nextInstanceId += 1;
      spawnIndex += 1;
    }
  }

  return Object.freeze({
    state: freezeState({
      ...state,
      game,
      objects: Object.freeze(objects),
      elapsedMs: state.elapsedMs + SIMULATION_STEP_MS,
      spawnAccumulatorMs,
      spawnIndex,
      nextInstanceId,
      gravityPulseRemainingMs: pulseRemainingMs,
      gravityPulseCooldownMs,
      totalAbsorptions,
    }),
    absorbedObjects: Object.freeze(absorbedObjects),
  });
}

function selectDefinition(
  definitions: readonly MatterObjectDefinition[],
  spawnIndex: number,
): MatterObjectDefinition {
  const totalWeight = definitions.reduce((total, definition) => total + definition.spawnWeight, 0);

  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    throw new RangeError('Matter object spawn weights must have a finite positive total.');
  }

  let remainingWeight = seededUnit(spawnIndex + 91) * totalWeight;

  for (const definition of definitions) {
    remainingWeight -= definition.spawnWeight;

    if (remainingWeight < 0) {
      return definition;
    }
  }

  return definitions[definitions.length - 1];
}

/** Small integer hash gives repeatable content selection without platform RNG. */
function seededUnit(seed: number): number {
  let value = (seed + 0x9e3779b9) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad) >>> 0;
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97) >>> 0;
  value = (value ^ (value >>> 15)) >>> 0;
  return value / 0x1_0000_0000;
}

function freezeState(state: GreyboxSimulationState): GreyboxSimulationState {
  return Object.freeze(state);
}

/** Keeps eligibility checks inside the project-owned large-number boundary. */
export function isMatterObjectEligible(
  mass: GameNumber,
  definition: MatterObjectDefinition,
): boolean {
  return mass.greaterThanOrEqual(definition.requiredMass);
}
