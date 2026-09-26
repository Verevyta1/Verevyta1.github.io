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
export const NEXUS_GATE_DISTANCE = 4_250;
export const FIRST_MINION_DISTANCE = 420;
export const MINION_WAVE_SPACING = 250;
const STEP_MS = 50;
const MAX_FRAME_MS = 250;
const MAX_RUN_MS = 45_000;
const GRAVITY = 0.38;
const MAX_DRAG_X = 140;
const MAX_DRAG_Y = 70;
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
  readonly blockedAtNexus: boolean;
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
    blockedAtNexus: false,
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
  if (state.run.phase === 'flying' || state.run.phase === 'won') {
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
  if (!Number.isFinite(pullX) || !Number.isFinite(pullY)) {
    throw new RangeError('Launch drag must be finite.');
  }
  if (state.run.phase !== 'aiming') {
    return state;
  }

  const dragX = clamp(pullX, 0, MAX_DRAG_X);
  const dragY = clamp(pullY, -MAX_DRAG_Y, MAX_DRAG_Y);
  const throwLevel = state.upgrades.throwStrength;
  const speed = Math.min(speedCap(state.upgrades), 4.2 + dragX * 0.105 + throwLevel * 0.65);

  return freezeState({
    ...state,
    run: {
      ...emptyRun(),
      phase: 'flying',
      horizontalSpeed: speed,
      verticalSpeed: Math.max(
        3.2,
        5.2 + dragY * 0.065 + throwLevel * 0.7 + state.upgrades.bouncePower * 0.22,
      ),
      slamCharges: 1 + state.upgrades.rocketSlam,
    },
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
      verticalSpeed: Math.max(-12, state.run.verticalSpeed - 13),
      slamCharges: state.run.slamCharges - 1,
    },
  });
}

export function masteredUpgradeCount(upgrades: LaunchUpgradeLevels): number {
  return LAUNCH_UPGRADE_IDS.filter((id) => upgrades[id] >= MAX_UPGRADE_LEVEL).length;
}

export function isNexusUnlocked(upgrades: LaunchUpgradeLevels): boolean {
  return masteredUpgradeCount(upgrades) === LAUNCH_UPGRADE_IDS.length;
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
  const nexusUnlocked = isNexusUnlocked(state.upgrades);
  const limit = nexusUnlocked ? NEXUS_DISTANCE : NEXUS_GATE_DISTANCE;
  const distance = Math.min(limit, previousDistance + run.horizontalSpeed * frames);
  let height = run.height + run.verticalSpeed * frames - 0.5 * GRAVITY * frames * frames;
  let verticalSpeed = run.verticalSpeed - GRAVITY * frames;
  let horizontalSpeed = run.horizontalSpeed * Math.pow(0.998, frames);
  let nextMinionIndex = run.nextMinionIndex;
  let gold = GameNumber.from(state.gold);
  let goldEarned = GameNumber.from(run.goldEarned);
  let smashedMinions = run.smashedMinions;
  const smashed: { index: number; gold: number; special: boolean }[] = [];

  while (distance >= FIRST_MINION_DISTANCE + nextMinionIndex * MINION_WAVE_SPACING) {
    const minionDistance = FIRST_MINION_DISTANCE + nextMinionIndex * MINION_WAVE_SPACING;
    if (minionDistance <= previousDistance) {
      break;
    }

    if (height <= 115) {
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
        horizontalSpeed * (0.88 + state.upgrades.minionMomentum * 0.02) +
          0.35 +
          state.upgrades.bouncePower * 0.32,
      );
      verticalSpeed = 8.2 + state.upgrades.bouncePower * 0.72;
      height = Math.max(4, height);
      smashed.push({ index, gold: reward, special });
    }

    nextMinionIndex += 1;
  }

  if (height <= 0 && verticalSpeed < 0) {
    height = 0;

    if (horizontalSpeed > 3.2) {
      verticalSpeed = 4.4 + state.upgrades.bouncePower * 0.72;
      horizontalSpeed = Math.min(
        speedCap(state.upgrades),
        horizontalSpeed * (0.76 + state.upgrades.drag * 0.036),
      );
    } else {
      return finishRun(state, distance, gold, goldEarned, smashedMinions, nextMinionIndex, smashed);
    }
  }

  const elapsedMs = run.elapsedMs + STEP_MS;
  if (distance >= limit) {
    return finishRun(
      state,
      distance,
      gold,
      goldEarned,
      smashedMinions,
      nextMinionIndex,
      smashed,
      !nexusUnlocked,
      nexusUnlocked,
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
  blockedAtNexus = false,
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
        blockedAtNexus,
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
  return 20 + upgrades.speed * 4;
}

function requireLevel(level: number): void {
  if (!Number.isSafeInteger(level) || level < 0 || level > MAX_UPGRADE_LEVEL) {
    throw new RangeError('Upgrade level must be a supported non-negative integer.');
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
