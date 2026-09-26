import { GameNumber } from '../numbers/game-number';

export const LAUNCH_UPGRADE_IDS = [
  'throwStrength',
  'rocketSlam',
  'bouncePower',
  'speed',
  'drag',
  'minionMomentum',
  'goldBounty',
] as const;
export type LaunchUpgradeId = (typeof LAUNCH_UPGRADE_IDS)[number];
export type LaunchPhase = 'ready' | 'aiming' | 'flying' | 'finished' | 'won';
export const MAX_UPGRADE_LEVEL = 5;
export const NEXUS_DISTANCE = 5_000;
export const BASE_SLING_PULL = 160;
export const SLING_PULL_PER_LEVEL = 10;
export const LAUNCH_GRAVITY = 0.38;
export const FIRST_MINION_DISTANCE = 420;
export const MINION_WAVE_SPACING = 330;
const STEP_MS = 1000 / 60;
const MAX_FRAME_MS = 250;
const MAX_RUN_MS = 90_000;
const MIN_SLING_PULL = 8;
const SAVE_VERSION = 2;

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
  readonly slamCharges: number;
  readonly frameAccumulatorMs: number;
}

export interface LaunchVelocity {
  readonly pullX: number;
  readonly pullY: number;
  readonly stretch: number;
  readonly maximumStretch: number;
  readonly horizontalSpeed: number;
  readonly verticalSpeed: number;
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
    readonly special: boolean;
  }[];
  readonly runEnded: boolean;
}

const EMPTY_UPGRADES: LaunchUpgradeLevels = Object.freeze({
  throwStrength: 0,
  rocketSlam: 0,
  bouncePower: 0,
  speed: 0,
  drag: 0,
  minionMomentum: 0,
  goldBounty: 0,
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
    slamCharges: 0,
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

export function beginLaunchAim(state: LaunchGameState): LaunchGameState {
  if (state.run.phase === 'flying') {
    return state;
  }

  return freezeState({
    ...state,
    run: { ...emptyRun(), phase: 'aiming' },
  });
}

export function releaseTeemo(
  state: LaunchGameState,
  pullX: number,
  pullY: number,
): LaunchGameState {
  if (state.run.phase !== 'aiming') {
    return state;
  }

  const velocity = calculateLaunchVelocity(state.upgrades, pullX, pullY);
  if (velocity.stretch < MIN_SLING_PULL) {
    return freezeState({ ...state, run: emptyRun() });
  }

  return freezeState({
    ...state,
    run: {
      ...emptyRun(),
      phase: 'flying',
      horizontalSpeed: velocity.horizontalSpeed,
      verticalSpeed: velocity.verticalSpeed,
      slamCharges: 1 + state.upgrades.rocketSlam,
    },
  });
}

export function maximumSlingPull(upgrades: LaunchUpgradeLevels): number {
  return BASE_SLING_PULL + upgrades.throwStrength * SLING_PULL_PER_LEVEL;
}

/** Pull X is backward from the sling; positive pull Y is downward. */
export function calculateLaunchVelocity(
  upgrades: LaunchUpgradeLevels,
  pullX: number,
  pullY: number,
): LaunchVelocity {
  if (!Number.isFinite(pullX) || !Number.isFinite(pullY)) {
    throw new RangeError('Launch drag must be finite.');
  }

  const backward = Math.max(0, pullX);
  const rawStretch = Math.hypot(backward, pullY);
  const maximumStretch = maximumSlingPull(upgrades);
  const scale = rawStretch > maximumStretch ? maximumStretch / rawStretch : 1;
  const x = backward * scale;
  const y = pullY * scale;
  const stretch = rawStretch * scale;
  const tension = stretch / maximumStretch;
  const throwPower = 1 + upgrades.throwStrength * 0.12;
  const speedBoost = 1 + upgrades.speed * 0.045;

  return Object.freeze({
    pullX: x,
    pullY: y,
    stretch,
    maximumStretch,
    horizontalSpeed: Math.min(
      speedCap(upgrades),
      (x * 0.09 + tension * 1.2) * throwPower * speedBoost,
    ),
    verticalSpeed: clamp(
      (3.5 * tension + y * 0.09 + x * 0.024) * (1 + upgrades.throwStrength * 0.07),
      -8,
      15,
    ),
  });
}

export function activateRocketSlam(state: LaunchGameState): LaunchGameState {
  if (state.run.phase !== 'flying' || state.run.slamCharges <= 0 || state.run.height <= 0) {
    return state;
  }

  return freezeState({
    ...state,
    run: {
      ...state.run,
      horizontalSpeed: Math.min(
        speedCap(state.upgrades),
        state.run.horizontalSpeed + 1.4 + state.upgrades.rocketSlam * 0.45,
      ),
      verticalSpeed: -Math.min(14, 8 + state.upgrades.rocketSlam * 0.9),
      slamCharges: state.run.slamCharges - 1,
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
  if (state.run.phase === 'flying' || state.run.phase === 'aiming') {
    return { state, purchased: false, cost: '0' };
  }

  const definition = definitions.find((entry) => entry.id === id);
  if (!definition) {
    throw new RangeError('Unknown upgrade.');
  }

  const level = state.upgrades[id];
  const cost = calculateLaunchUpgradeCost(definition, level);
  if (level >= MAX_UPGRADE_LEVEL) {
    return { state, purchased: false, cost: cost.serialize() };
  }

  const gold = GameNumber.from(state.gold);
  if (gold.lessThan(cost)) {
    return { state, purchased: false, cost: cost.serialize() };
  }

  return {
    state: freezeState({
      ...state,
      gold: gold.subtract(cost).serialize(),
      upgrades: { ...state.upgrades, [id]: level + 1 },
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
  const smashed: { index: number; gold: number; special: boolean }[] = [];
  let runEnded = false;

  while (accumulated + 0.000001 >= STEP_MS) {
    const frame = advanceFixedStep(next);
    next = frame.state;
    smashed.push(...frame.smashed);
    runEnded ||= frame.runEnded;
    accumulated = Math.max(0, accumulated - STEP_MS);

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
  const distance = Math.min(NEXUS_DISTANCE, previousDistance + run.horizontalSpeed * frames);
  let height = run.height + run.verticalSpeed * frames - 0.5 * LAUNCH_GRAVITY * frames * frames;
  let verticalSpeed = run.verticalSpeed - LAUNCH_GRAVITY * frames;
  let horizontalSpeed =
    run.horizontalSpeed * Math.pow(0.9975 + state.upgrades.speed * 0.0003, frames);
  let nextMinionIndex = run.nextMinionIndex;
  let gold = GameNumber.from(state.gold);
  let goldEarned = GameNumber.from(run.goldEarned);
  let smashedMinions = run.smashedMinions;
  const smashed: { index: number; gold: number; special: boolean }[] = [];

  while (distance >= FIRST_MINION_DISTANCE + nextMinionIndex * MINION_WAVE_SPACING - 38) {
    const minionDistance = FIRST_MINION_DISTANCE + nextMinionIndex * MINION_WAVE_SPACING;
    if (Math.abs(distance - minionDistance) <= 38 && height <= 115) {
      const index = nextMinionIndex;
      const special = index % 5 === 4;
      const baseReward = special ? 18 : 8;
      const bountyMultiplier = 1 + state.upgrades.goldBounty * 0.2;
      const reward = Math.floor(baseReward * bountyMultiplier);
      gold = gold.add(reward);
      goldEarned = goldEarned.add(reward);
      smashedMinions += 1;
      horizontalSpeed = Math.min(
        speedCap(state.upgrades),
        horizontalSpeed * (0.7 + state.upgrades.minionMomentum * 0.055) +
          0.4 +
          state.upgrades.bouncePower * 0.3,
      );
      verticalSpeed = 6.5 + state.upgrades.bouncePower * 0.65;
      height = Math.max(20, height);
      smashed.push({ index, gold: reward, special });
      nextMinionIndex += 1;
      continue;
    }

    if (distance > minionDistance + 38) {
      nextMinionIndex += 1;
      continue;
    }
    break;
  }

  if (height <= 0 && verticalSpeed < 0) {
    height = 0;

    if (horizontalSpeed > 2.8) {
      verticalSpeed = Math.min(
        12,
        2.8 + Math.abs(verticalSpeed) * 0.25 + state.upgrades.bouncePower * 0.7,
      );
      horizontalSpeed = Math.min(
        speedCap(state.upgrades),
        horizontalSpeed * (0.58 + state.upgrades.drag * 0.065),
      );
    } else {
      return finishRun(state, distance, gold, goldEarned, smashedMinions, nextMinionIndex, smashed);
    }
  }

  const elapsedMs = run.elapsedMs + STEP_MS;
  if (distance >= NEXUS_DISTANCE) {
    return finishRun(
      state,
      distance,
      gold,
      goldEarned,
      smashedMinions,
      nextMinionIndex,
      smashed,
      true,
    );
  }
  if (elapsedMs >= MAX_RUN_MS) {
    return finishRun(state, distance, gold, goldEarned, smashedMinions, nextMinionIndex, smashed);
  }

  const nextState = freezeState({
    ...state,
    gold: gold.serialize(),
    bestDistance: Math.max(state.bestDistance, distance),
    run: {
      ...run,
      phase: 'flying',
      distance,
      height: Math.max(0, height),
      horizontalSpeed,
      verticalSpeed,
      elapsedMs,
      nextMinionIndex,
      smashedMinions,
      goldEarned: goldEarned.serialize(),
    },
  });

  return { state: nextState, smashed, runEnded: false };
}

function finishRun(
  state: LaunchGameState,
  distance: number,
  gold: GameNumber,
  goldEarned: GameNumber,
  smashedMinions: number,
  nextMinionIndex: number,
  smashed: readonly { index: number; gold: number; special: boolean }[],
  won = false,
): LaunchFrame {
  return {
    state: freezeState({
      ...state,
      gold: gold.serialize(),
      bestDistance: Math.max(state.bestDistance, distance),
      run: {
        ...state.run,
        phase: won ? 'won' : 'finished',
        distance,
        height: 0,
        horizontalSpeed: 0,
        verticalSpeed: 0,
        elapsedMs: state.run.elapsedMs + STEP_MS,
        nextMinionIndex,
        smashedMinions,
        goldEarned: goldEarned.serialize(),
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
  if (
    (save.saveVersion !== 1 && save.saveVersion !== SAVE_VERSION) ||
    typeof save.gold !== 'string'
  ) {
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
  const sourceIds: readonly string[] =
    save.saveVersion === 1
      ? ['launchPower', 'bouncePower', 'goldBounty', 'mushroomBoost']
      : LAUNCH_UPGRADE_IDS;
  for (const key of Object.keys(raw)) {
    if (!sourceIds.includes(key)) {
      throw new RangeError('Unknown saved upgrade.');
    }
  }

  const upgrades: Partial<Record<LaunchUpgradeId, number>> = {};
  for (const id of sourceIds) {
    const level = raw[id] ?? 0;
    if (typeof level !== 'number' || !Number.isSafeInteger(level) || level < 0) {
      throw new RangeError('Saved upgrade level is invalid.');
    }

    const targetId: LaunchUpgradeId =
      id === 'launchPower'
        ? 'throwStrength'
        : id === 'mushroomBoost'
          ? 'rocketSlam'
          : (id as LaunchUpgradeId);
    upgrades[targetId] = Math.min(level, MAX_UPGRADE_LEVEL);
  }

  return createInitialLaunchGameState({
    gold: save.gold,
    bestDistance: save.bestDistance,
    upgrades,
  });
}

function speedCap(upgrades: LaunchUpgradeLevels): number {
  return 16 + upgrades.speed * 3;
}

function requireLevel(level: number): void {
  if (!Number.isSafeInteger(level) || level < 0 || level > MAX_UPGRADE_LEVEL) {
    throw new RangeError('Upgrade level must be a supported non-negative integer.');
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
