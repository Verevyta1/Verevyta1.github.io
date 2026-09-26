import {
  createInitialUpgradeLevels,
  MAX_UPGRADE_LEVEL,
  UPGRADE_IDS,
  type UpgradeId,
} from '../economy/upgrades';
import { createInitialGameState, type GameState } from '../simulation/game-state';

export const SAVE_VERSION = 2 as const;
const LEGACY_SAVE_VERSION = 1;

export interface SaveTimestamps {
  readonly createdAt: number;
  readonly lastSavedAt: number;
}

export interface SaveEnvelopeV2 {
  readonly saveVersion: typeof SAVE_VERSION;
  readonly createdAt: number;
  readonly lastSavedAt: number;
  readonly game: {
    readonly run: {
      readonly mass: string;
      readonly matter: string;
    };
    readonly upgrades: ReturnType<typeof createInitialUpgradeLevels>;
  };
}

export class InvalidSaveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSaveError';
  }
}

/** Builds the renderer-independent, JSON-safe v2 save envelope. */
export function createSaveEnvelope(game: GameState, timestamps: SaveTimestamps): SaveEnvelopeV2 {
  const createdAt = requireTimestamp(timestamps.createdAt, 'createdAt');
  const lastSavedAt = requireTimestamp(timestamps.lastSavedAt, 'lastSavedAt');
  const run = Object.freeze({
    mass: game.run.mass.serialize(),
    matter: game.run.matter.serialize(),
  });

  return Object.freeze({
    saveVersion: SAVE_VERSION,
    createdAt,
    lastSavedAt,
    game: Object.freeze({
      run,
      upgrades: Object.freeze({ ...game.upgrades }),
    }),
  });
}

/** Serializes a minimal v2 save using canonical GameNumber strings. */
export function serializeSave(game: GameState, timestamps: SaveTimestamps): string {
  return JSON.stringify(createSaveEnvelope(game, timestamps));
}

/** Parses v1 or v2 saved JSON and normalizes it to the current schema. */
export function parseSave(serialized: string): SaveEnvelopeV2 {
  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    throw new InvalidSaveError('Save data must be valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new InvalidSaveError('Save data must be an object.');
  }

  if (parsed.saveVersion !== LEGACY_SAVE_VERSION && parsed.saveVersion !== SAVE_VERSION) {
    throw new InvalidSaveError('Save version is unsupported.');
  }

  if (!isTimestamp(parsed.createdAt) || !isTimestamp(parsed.lastSavedAt)) {
    throw new InvalidSaveError('Save timestamps must be finite non-negative numbers.');
  }

  if (!isRecord(parsed.game) || !isRecord(parsed.game.run)) {
    throw new InvalidSaveError('Save data is missing the run state.');
  }

  const run = parsed.game.run;

  if (typeof run.mass !== 'string' || typeof run.matter !== 'string') {
    throw new InvalidSaveError('Saved Mass and Matter must be serialized strings.');
  }

  const upgrades =
    parsed.saveVersion === LEGACY_SAVE_VERSION ? {} : readUpgradeLevels(parsed.game.upgrades);

  try {
    const game = createInitialGameState({
      run: {
        mass: run.mass,
        matter: run.matter,
      },
      upgrades,
    });

    return createSaveEnvelope(game, {
      createdAt: parsed.createdAt,
      lastSavedAt: parsed.lastSavedAt,
    });
  } catch {
    throw new InvalidSaveError('Saved Mass, Matter, or upgrade levels are invalid.');
  }
}

/** Restores only deterministic game state; presentation and platform boot separately. */
export function restoreGameState(save: SaveEnvelopeV2): GameState {
  return createInitialGameState({
    run: {
      mass: save.game.run.mass,
      matter: save.game.run.matter,
    },
    upgrades: save.game.upgrades,
  });
}

function readUpgradeLevels(value: unknown): Partial<Record<UpgradeId, number>> {
  if (!isRecord(value)) {
    throw new InvalidSaveError('Saved upgrade levels are missing.');
  }

  const ids = new Set<string>(UPGRADE_IDS);

  for (const key of Object.keys(value)) {
    if (!ids.has(key)) {
      throw new InvalidSaveError('Saved upgrade levels contain an unknown upgrade.');
    }
  }

  const levels: Partial<Record<UpgradeId, number>> = {};

  for (const id of UPGRADE_IDS) {
    const level = value[id];

    if (level === undefined) {
      continue;
    }

    if (
      typeof level !== 'number' ||
      !Number.isSafeInteger(level) ||
      level < 0 ||
      level > MAX_UPGRADE_LEVEL
    ) {
      throw new InvalidSaveError('Saved upgrade levels must be supported non-negative integers.');
    }

    levels[id] = level;
  }

  return levels;
}

function requireTimestamp(timestamp: number, label: string): number {
  if (!isTimestamp(timestamp)) {
    throw new InvalidSaveError(`Save ${label} must be a finite non-negative number.`);
  }

  return timestamp;
}

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
