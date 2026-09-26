import { GameNumber } from '../numbers/game-number';

export const LAUNCH_UPGRADE_IDS = [
  'launchPower',
  'bouncePower',
  'goldBounty',
  'mushroomBoost',
] as const;
export type LaunchUpgradeId = (typeof LAUNCH_UPGRADE_IDS)[number];
export type LaunchPhase = 'ready' | 'flying' | 'finished' | 'won';
export const NEXUS_DISTANCE = 5_000;
export const FIRST_MINION_DISTANCE = 560;
export const MINION_WAVE_SPACING = 270;
const STEP_MS = 50;
const MAX_FRAME_MS = 250;
const GRAVITY = 0.38;
const MAX_LEVEL = 10_000;
const SAVE_VERSION = 1;

export type LaunchUpgradeLevels = Readonly<Record<LaunchUpgradeId, number>>;

export interface LaunchUpgradeDefinition {
  readonly id: LaunchUpgradeId;
  readonly name: string;
  readonly description: string;
  readonly baseCost: string;
  readonly costMultiplier: string;
}

export interface LaunchRunState {
  readonly phase: LaunchPhase;
  readonly distance: number;
  readonly height: number;
  readonly horizontalSpeed: number;
  readonly verticalSpeed: number;
  readonly elapsedMs: number;
  readonly nextMinionIndex: number;
  readonly smashedMinions: number;
  readonly goldEarned: string;
  readonly boostCooldownMs: number;
  readonly frameAccumulatorMs: number;
}

export interface LaunchGameState {
  readonly gold: string;
  readonly bestDistance: number;
  readonly upgrades: LaunchUpgradeLevels;
  readonly run: LaunchRunState;
}

export interface LaunchFrame {
  readonly state: LaunchGameState;
  readonly smashed: readonly {
    readonly index: number;
    readonly gold: number;
  }[];
  readonly runEnded: boolean;
}

const EMPTY_UPGRADES: LaunchUpgradeLevels = Object.freeze({
  launchPower: 0,
  bouncePower: 0,
  goldBounty: 0,
  mushroomBoost: 0,
});

function emptyRun(): LaunchRunState {
  return Object.freeze({
    phase: 'ready',
    distance: 0,
    height: 0,
    horizontalSpeed: 0,
    verticalSpeed: 0,
    elapsedMs: 0,
    nextMinionIndex: 0,
    smashedMinions: 0,
    goldEarned: '0',
    boostCooldownMs: 0,
    frameAccumulatorMs: 0,
  });
}

function freezeState(state: LaunchGameState): LaunchGameState {
  return Object.freeze({
    ...state,
    upgrades: Object.freeze({ ...state.upgrades }),
    run: Object.freeze({ ...state.run }),
  });
}

export function createInitialLaunchGameState(
  input: {
    readonly gold?: string;
    readonly bestDistance?: number;
    readonly upgrades?: Partial<Record<LaunchUpgradeId, number>>;
  } = {},
): LaunchGameState {
  const gold = GameNumber.from(input.gold ?? '0');
  const bestDistance = input.bestDistance ?? 0;

  if (gold.lessThan(0) || !Number.isFinite(bestDistance) || bestDistance < 0) {
    throw new RangeError('Launch progress must be finite and non-negative.');
  }

  const upgrades = { ...EMPTY_UPGRADES };
  for (const id of LAUNCH_UPGRADE_IDS) {
    const level = input.upgrades?.[id] ?? 0;
    requireLevel(level);
    upgrades[id] = level;
  }

  return freezeState({
    gold: gold.serialize(),
    bestDistance,
    upgrades,
    run: emptyRun(),
  });
}

export function startLaunchRun(state: LaunchGameState): LaunchGameState {
  if (state.run.phase === 'flying' || state.run.phase === 'won') {
    return state;
  }

  const level = state.upgrades.launchPower;
  return freezeState({
    ...state,
    run: {
      ...emptyRun(),
      phase: 'flying',
      horizontalSpeed: 8 + level * 1.25,
      verticalSpeed: 12 + level * 0.6,
    },
  });
}

export function activateMushroomBoost(state: LaunchGameState): LaunchGameState {
  if (state.run.phase !== 'flying' || state.run.boostCooldownMs > 0) {
    return state;
  }

  const level = state.upgrades.mushroomBoost;
  return freezeState({
    ...state,
    run: {
      ...state.run,
      horizontalSpeed: state.run.horizontalSpeed + 3.5 + level * 0.9,
      verticalSpeed: state.run.verticalSpeed + 4.5 + level * 0.55,
      boostCooldownMs: Math.max(2_500, 5_000 - level * 250),
    },
  });
}

export function calculateLaunchUpgradeCost(
  definition: LaunchUpgradeDefinition,
  level: number,
): GameNumber {
  requireLevel(level);
  const base = GameNumber.from(definition.baseCost);
  const multiplier = GameNumber.from(definition.costMultiplier);

  if (base.lessThanOrEqual(0) || multiplier.lessThanOrEqual(1)) {
    throw new RangeError('Upgrade cost data must have positive growth.');
  }

  return base.multiply(multiplier.pow(level)).floor();
}

export function buyLaunchUpgrade(
  state: LaunchGameState,
  id: LaunchUpgradeId,
  definitions: readonly LaunchUpgradeDefinition[],
): {
  readonly state: LaunchGameState;
  readonly purchased: boolean;
  readonly cost: string;
} {
  if (state.run.phase === 'flying') {
    return { state, purchased: false, cost: '0' };
  }

  const definition = definitions.find((entry) => entry.id === id);
  if (!definition) {
    throw new RangeError('Unknown upgrade.');
  }

  const cost = calculateLaunchUpgradeCost(definition, state.upgrades[id]);
  const gold = GameNumber.from(state.gold);
  if (gold.lessThan(cost)) {
    return { state, purchased: false, cost: cost.serialize() };
  }

  return {
    state: freezeState({
      ...state,
      gold: gold.subtract(cost).serialize(),
      upgrades: { ...state.upgrades, [id]: state.upgrades[id] + 1 },
    }),
    purchased: true,
    cost: cost.serialize(),
  };
}

export function advanceLaunchGame(state: LaunchGameState, deltaMs: number): LaunchFrame {
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    throw new RangeError('Delta must be finite and non-negative.');
  }

  if (state.run.phase !== 'flying' || deltaMs === 0) {
    return Object.freeze({
      state,
      smashed: Object.freeze([]),
      runEnded: false,
    });
  }

  let accumulated = state.run.frameAccumulatorMs + Math.min(deltaMs, MAX_FRAME_MS);
  let next = state;
  const smashed: { index: number; gold: number }[] = [];
  let runEnded = false;

  while (accumulated >= STEP_MS) {
    const frame = advanceFixedStep(next);
    next = frame.state;
    smashed.push(...frame.smashed);
    runEnded ||= frame.runEnded;
    accumulated -= STEP_MS;

    if (next.run.phase !== 'flying') {
      accumulated = 0;
      break;
    }
  }

  next = freezeState({
    ...next,
    run: { ...next.run, frameAccumulatorMs: accumulated },
  });

  return Object.freeze({
    state: next,
    smashed: Object.freeze(smashed),
    runEnded,
  });
}

function advanceFixedStep(state: LaunchGameState): LaunchFrame {
  const run = state.run;
  const frames = STEP_MS / (1000 / 60);
  const previousDistance = run.distance;
  const distance = previousDistance + run.horizontalSpeed * frames;
  let height = run.height + run.verticalSpeed * frames - 0.5 * GRAVITY * frames * frames;
  let verticalSpeed = run.verticalSpeed - GRAVITY * frames;
  let horizontalSpeed = run.horizontalSpeed * Math.pow(0.998, frames);
  let nextMinionIndex = run.nextMinionIndex;
  let gold = GameNumber.from(state.gold);
  let goldEarned = GameNumber.from(run.goldEarned);
  let smashedMinions = run.smashedMinions;
  const cooldown = Math.max(0, run.boostCooldownMs - STEP_MS);
  const smashed: { index: number; gold: number }[] = [];

  while (distance >= FIRST_MINION_DISTANCE + nextMinionIndex * MINION_WAVE_SPACING) {
    const minionDistance = FIRST_MINION_DISTANCE + nextMinionIndex * MINION_WAVE_SPACING;
    if (minionDistance <= previousDistance) {
      break;
    }

    if (height <= 100) {
      const index = nextMinionIndex;
      const baseReward = index % 5 === 4 ? 15 : index % 3 === 2 ? 7 : 5;
      const reward = Math.floor(baseReward * (1 + state.upgrades.goldBounty * 0.25));
      gold = gold.add(reward);
      goldEarned = goldEarned.add(reward);
      smashedMinions += 1;
      horizontalSpeed += 1.1 + state.upgrades.bouncePower * 0.35;
      verticalSpeed = 10 + state.upgrades.bouncePower * 0.65;
      height = Math.max(4, height);
      smashed.push({ index, gold: reward });
    }

    nextMinionIndex += 1;
  }

  if (height <= 0 && verticalSpeed < 0) {
    height = 0;

    if (horizontalSpeed > 3.2) {
      verticalSpeed = 4.6 + state.upgrades.bouncePower * 0.4;
      horizontalSpeed *= 0.86;
    } else {
      return finishRun(state, distance, gold, goldEarned, smashedMinions, nextMinionIndex, smashed);
    }
  }

  const phase = distance >= NEXUS_DISTANCE ? 'won' : 'flying';
  const nextState = freezeState({
    ...state,
    gold: gold.serialize(),
    bestDistance: Math.max(state.bestDistance, distance),
    run: {
      ...run,
      phase,
      distance,
      height,
      horizontalSpeed,
      verticalSpeed,
      elapsedMs: run.elapsedMs + STEP_MS,
      nextMinionIndex,
      smashedMinions,
      goldEarned: goldEarned.serialize(),
      boostCooldownMs: cooldown,
    },
  });

  return { state: nextState, smashed, runEnded: phase === 'won' };
}

function finishRun(
  state: LaunchGameState,
  distance: number,
  gold: GameNumber,
  goldEarned: GameNumber,
  smashedMinions: number,
  nextMinionIndex: number,
  smashed: readonly { index: number; gold: number }[],
): LaunchFrame {
  return {
    state: freezeState({
      ...state,
      gold: gold.serialize(),
      bestDistance: Math.max(state.bestDistance, distance),
      run: {
        ...state.run,
        phase: distance >= NEXUS_DISTANCE ? 'won' : 'finished',
        distance,
        height: 0,
        horizontalSpeed: 0,
        verticalSpeed: 0,
        elapsedMs: state.run.elapsedMs + STEP_MS,
        nextMinionIndex,
        smashedMinions,
        goldEarned: goldEarned.serialize(),
        boostCooldownMs: Math.max(0, state.run.boostCooldownMs - STEP_MS),
      },
    }),
    smashed,
    runEnded: true,
  };
}

export function serializeLaunchSave(state: LaunchGameState, savedAt = Date.now()): string {
  if (!Number.isFinite(savedAt) || savedAt < 0) {
    throw new RangeError('Save timestamp is invalid.');
  }

  return JSON.stringify({
    saveVersion: SAVE_VERSION,
    savedAt,
    gold: GameNumber.from(state.gold).serialize(),
    bestDistance: state.bestDistance,
    upgrades: state.upgrades,
  });
}

export function parseLaunchSave(serialized: string): LaunchGameState {
  let value: unknown;

  try {
    value = JSON.parse(serialized) as unknown;
  } catch {
    throw new RangeError('Saved progress is not valid JSON.');
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new RangeError('Saved progress must be an object.');
  }

  const save = value as Record<string, unknown>;
  if (save.saveVersion !== SAVE_VERSION || typeof save.gold !== 'string') {
    throw new RangeError('Save version is unsupported.');
  }
  if (typeof save.savedAt !== 'number' || !Number.isFinite(save.savedAt) || save.savedAt < 0) {
    throw new RangeError('Save timestamp is invalid.');
  }
  if (
    typeof save.bestDistance !== 'number' ||
    !Number.isFinite(save.bestDistance) ||
    save.bestDistance < 0
  ) {
    throw new RangeError('Best distance is invalid.');
  }
  if (typeof save.upgrades !== 'object' || save.upgrades === null || Array.isArray(save.upgrades)) {
    throw new RangeError('Saved upgrades are invalid.');
  }

  const raw = save.upgrades as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (!(LAUNCH_UPGRADE_IDS as readonly string[]).includes(key)) {
      throw new RangeError('Unknown saved upgrade.');
    }
  }

  const upgrades: Partial<Record<LaunchUpgradeId, number>> = {};
  for (const id of LAUNCH_UPGRADE_IDS) {
    const level = raw[id] ?? 0;
    if (typeof level !== 'number') {
      throw new RangeError('Saved upgrade level is invalid.');
    }
    upgrades[id] = level;
  }

  return createInitialLaunchGameState({
    gold: save.gold,
    bestDistance: save.bestDistance,
    upgrades,
  });
}

function requireLevel(level: number): void {
  if (!Number.isSafeInteger(level) || level < 0 || level > MAX_LEVEL) {
    throw new RangeError('Upgrade level must be a supported non-negative integer.');
  }
}
