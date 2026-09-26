import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../simulation/game-state';
import { InvalidSaveError, parseSave, restoreGameState, serializeSave } from './save-schema';

describe('save schema v1', () => {
  it('round-trips very large run values as canonical strings', () => {
    const game = createInitialGameState({
      run: { mass: '1e1000', matter: '2e1200' },
    });

    const canonicalMass = game.run.mass.serialize();
    const canonicalMatter = game.run.matter.serialize();
    const parsed = parseSave(serializeSave(game, { createdAt: 100, lastSavedAt: 200 }));
    const restored = restoreGameState(parsed);

    expect(parsed).toMatchObject({
      saveVersion: 1,
      createdAt: 100,
      lastSavedAt: 200,
      game: {
        run: { mass: canonicalMass, matter: canonicalMatter },
      },
    });
    expect(restored.run.mass.serialize()).toBe(canonicalMass);
    expect(restored.run.matter.serialize()).toBe(canonicalMatter);
  });

  it('rejects malformed JSON and unsupported schema versions', () => {
    expect(() => parseSave('{')).toThrow(InvalidSaveError);
    expect(() => parseSave('null')).toThrow(InvalidSaveError);
    expect(() => parseSave(JSON.stringify({ saveVersion: 2 }))).toThrow(InvalidSaveError);
  });

  it('rejects invalid timestamps and malformed or negative resources', () => {
    const valid = {
      saveVersion: 1,
      createdAt: 10,
      lastSavedAt: 20,
      game: { run: { mass: '0', matter: '0' } },
    };

    expect(() =>
      parseSave(JSON.stringify({ ...valid, createdAt: Number.POSITIVE_INFINITY })),
    ).toThrow(InvalidSaveError);
    expect(() =>
      parseSave(JSON.stringify({ ...valid, game: { run: { mass: 'NaN', matter: '0' } } })),
    ).toThrow(InvalidSaveError);
    expect(() =>
      parseSave(JSON.stringify({ ...valid, game: { run: { mass: '0', matter: '-1' } } })),
    ).toThrow(InvalidSaveError);
  });

  it('does not create a save with invalid timestamps', () => {
    const game = createInitialGameState();

    expect(() => serializeSave(game, { createdAt: -1, lastSavedAt: 0 })).toThrow(InvalidSaveError);
  });
});
