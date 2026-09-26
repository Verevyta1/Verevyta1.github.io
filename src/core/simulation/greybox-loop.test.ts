import { describe, expect, it } from 'vitest';

import type { MatterObjectDefinition } from '../content/content-definitions';
import { createInitialGameState } from './game-state';
import {
  activateGravityPulse,
  advanceGreyboxSimulation,
  createInitialGreyboxSimulationState,
  GRAVITY_PULSE_COOLDOWN_MS,
  GRAVITY_PULSE_DURATION_MS,
  MAX_FRAME_CATCH_UP_MS,
} from './greybox-loop';

const TEST_OBJECTS: readonly MatterObjectDefinition[] = Object.freeze([
  Object.freeze({
    id: 'test-dust',
    name: 'Test Dust',
    family: 'particles',
    scaleBand: 'primordial',
    requiredMass: '0',
    massReward: '2',
    matterReward: '0.5',
    spawnWeight: 1,
    visualScale: 1,
    assetKey: 'greybox-dust',
    absorptionProfile: 'swift',
    rarity: 'common',
  }),
]);

function advanceFor(
  state: ReturnType<typeof createInitialGreyboxSimulationState>,
  durationMs: number,
  deltaMs = 250,
) {
  let current = state;
  let absorbed = 0;

  for (let elapsed = 0; elapsed < durationMs; elapsed += deltaMs) {
    const frame = advanceGreyboxSimulation(
      current,
      Math.min(deltaMs, durationMs - elapsed),
      TEST_OBJECTS,
    );
    current = frame.state;
    absorbed += frame.absorbedObjects.length;
  }

  return { state: current, absorbed };
}

describe('greybox simulation', () => {
  it('produces the same state when the same time is split into fixed-step frames', () => {
    const initial = createInitialGreyboxSimulationState();
    const singleFrame = advanceGreyboxSimulation(initial, 200, TEST_OBJECTS).state;
    let splitFrames = initial;

    for (let index = 0; index < 4; index += 1) {
      splitFrames = advanceGreyboxSimulation(splitFrames, 50, TEST_OBJECTS).state;
    }

    expect(singleFrame).toEqual(splitFrames);
  });

  it('caps catch-up time after a suspended frame', () => {
    const initial = createInitialGreyboxSimulationState();
    const longFrame = advanceGreyboxSimulation(initial, 10_000, TEST_OBJECTS).state;
    const cappedFrame = advanceGreyboxSimulation(
      initial,
      MAX_FRAME_CATCH_UP_MS,
      TEST_OBJECTS,
    ).state;

    expect(longFrame).toEqual(cappedFrame);
  });

  it('rejects invalid frame durations', () => {
    const initial = createInitialGreyboxSimulationState();

    expect(() => advanceGreyboxSimulation(initial, -1, TEST_OBJECTS)).toThrow(RangeError);
    expect(() => advanceGreyboxSimulation(initial, Number.POSITIVE_INFINITY, TEST_OBJECTS)).toThrow(
      RangeError,
    );
  });

  it('absorbs eligible matter into Mass and Matter through the domain reward function', () => {
    const initial = createInitialGreyboxSimulationState();
    const result = advanceFor(initial, 3_000);

    expect(result.absorbed).toBeGreaterThan(0);
    expect(result.state.game.run.mass.greaterThan(0)).toBe(true);
    expect(result.state.game.run.matter.greaterThan(0)).toBe(true);
    expect(result.state.totalAbsorptions).toBe(result.absorbed);
  });

  it('lets Gravity Pulse speed eligible absorption and rejects repeated activation in cooldown', () => {
    const initial = createInitialGreyboxSimulationState(
      createInitialGameState({ run: { mass: '10' } }),
    );
    const pulsed = activateGravityPulse(initial);

    expect(pulsed.gravityPulseRemainingMs).toBe(GRAVITY_PULSE_DURATION_MS);
    expect(pulsed.gravityPulseCooldownMs).toBe(GRAVITY_PULSE_COOLDOWN_MS);
    expect(activateGravityPulse(pulsed)).toBe(pulsed);

    const accelerated = advanceFor(pulsed, 2_000);
    const unassisted = advanceFor(initial, 2_000);

    expect(accelerated.absorbed).toBeGreaterThan(0);
    expect(unassisted.absorbed).toBe(0);
  });
});
