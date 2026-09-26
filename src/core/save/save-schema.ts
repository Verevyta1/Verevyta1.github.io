import { createInitialGameState, type GameState } from '../simulation/game-state';

export const SAVE_VERSION = 1 as const;

export interface SaveTimestamps {
  readonly createdAt: number;
  readonly lastSavedAt: number;
}

export interface SaveEnvelopeV1 {
  readonly saveVersion: typeof SAVE_VERSION;
  readonly createdAt: number;
  readonly lastSavedAt: number;
  readonly game: {
    readonly run: {
      readonly mass: string;
      readonly matter: string;
    };
  };
}

export class InvalidSaveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSaveError';
  }
}

/** Builds the renderer-independent, JSON-safe v1 save envelope. */
export function createSaveEnvelope(game: GameState, timestamps: SaveTimestamps): SaveEnvelopeV1 {
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
    game: Object.freeze({ run }),
  });
}

/** Serializes a minimal v1 save using canonical GameNumber strings. */
export function serializeSave(game: GameState, timestamps: SaveTimestamps): string {
  return JSON.stringify(createSaveEnvelope(game, timestamps));
}

/** Parses and validates saved JSON without hydrating renderer or platform state. */
export function parseSave(serialized: string): SaveEnvelopeV1 {
  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    throw new InvalidSaveError('Save data must be valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new InvalidSaveError('Save data must be an object.');
  }

  if (parsed.saveVersion !== SAVE_VERSION) {
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

  try {
    const game = createInitialGameState({
      run: {
        mass: run.mass,
        matter: run.matter,
      },
    });

    return createSaveEnvelope(game, {
      createdAt: parsed.createdAt,
      lastSavedAt: parsed.lastSavedAt,
    });
  } catch {
    throw new InvalidSaveError('Saved Mass or Matter is invalid.');
  }
}

/** Restores only deterministic game state; presentation and platform boot separately. */
export function restoreGameState(save: SaveEnvelopeV1): GameState {
  return createInitialGameState({
    run: {
      mass: save.game.run.mass,
      matter: save.game.run.matter,
    },
  });
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
