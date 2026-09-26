import { GameNumber } from '../numbers/game-number';

export const UPGRADE_IDS = [
  'density',
  'gravity',
  'influence',
  'assimilation',
  'compression',
] as const;

export type UpgradeId = (typeof UPGRADE_IDS)[number];

export interface UpgradeDefinition {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
  readonly baseCost: string;
  readonly costMultiplier: string;
}

export type UpgradeLevels = Readonly<Record<UpgradeId, number>>;

export const MAX_UPGRADE_LEVEL = 10_000;
const BASE_SPAWN_INTERVAL_MS = 850;
const MIN_SPAWN_INTERVAL_MS = 250;
const BASE_PULSE_DURATION_MS = 3_500;
const PULSE_DURATION_PER_LEVEL_MS = 500;
const BASE_PULSE_SPEED_MULTIPLIER = 2.25;
const PULSE_SPEED_PER_LEVEL = 0.2;

export function createInitialUpgradeLevels(
  input: Partial<Record<UpgradeId, number>> = {},
): UpgradeLevels {
  const allowedIds = new Set<string>(UPGRADE_IDS);

  for (const key of Object.keys(input)) {
    if (!allowedIds.has(key)) {
      throw new RangeError('Upgrade levels contain an unknown upgrade.');
    }
  }

  const levels = {} as Record<UpgradeId, number>;

  for (const id of UPGRADE_IDS) {
    const level = input[id] ?? 0;
    requireValidLevel(level);
    levels[id] = level;
  }

  return Object.freeze(levels);
}

export function calculateUpgradeCost(
  definition: UpgradeDefinition,
  currentLevel: number,
): GameNumber {
  requireValidLevel(currentLevel);
  const baseCost = GameNumber.from(definition.baseCost);
  const costMultiplier = GameNumber.from(definition.costMultiplier);

  if (baseCost.lessThanOrEqual(0) || costMultiplier.lessThanOrEqual(1)) {
    throw new RangeError('Upgrade cost data must have a positive base and growth above one.');
  }

  return baseCost.multiply(costMultiplier.pow(currentLevel));
}

export function increaseUpgradeLevel(levels: UpgradeLevels, id: UpgradeId): UpgradeLevels {
  const currentLevel = levels[id];
  requireValidLevel(currentLevel);

  if (currentLevel >= MAX_UPGRADE_LEVEL) {
    throw new RangeError('Upgrade has reached the maximum supported level.');
  }

  return Object.freeze({ ...levels, [id]: currentLevel + 1 });
}

export function getDensitySpawnIntervalMs(level: number): number {
  requireValidLevel(level);
  return Math.max(
    MIN_SPAWN_INTERVAL_MS,
    Math.round(BASE_SPAWN_INTERVAL_MS * Math.pow(0.92, level)),
  );
}

export function getDensitySpawnBurst(level: number): number {
  requireValidLevel(level);
  return level >= 5 ? 2 : 1;
}

export function getGravityAttractionMultiplier(level: number): number {
  requireValidLevel(level);
  return 1 + level * 0.15;
}

export function getInfluenceMassMultiplier(level: number): number {
  requireValidLevel(level);
  return 1 + level * 0.1;
}

export function getAssimilationMatterMultiplier(level: number): GameNumber {
  requireValidLevel(level);
  return GameNumber.from(1).add(GameNumber.from(level).multiply('0.1'));
}

export function getGravityPulseDurationMs(level: number): number {
  requireValidLevel(level);
  return BASE_PULSE_DURATION_MS + PULSE_DURATION_PER_LEVEL_MS * level;
}

export function getGravityPulseSpeedMultiplier(level: number): number {
  requireValidLevel(level);
  return BASE_PULSE_SPEED_MULTIPLIER + PULSE_SPEED_PER_LEVEL * level;
}

function requireValidLevel(level: number): void {
  if (!Number.isSafeInteger(level) || level < 0 || level > MAX_UPGRADE_LEVEL) {
    throw new RangeError('Upgrade level must be a supported non-negative integer.');
  }
}
