import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../simulation/game-state';
import { InvalidSaveError, parseSave, restoreGameState, serializeSave } from './save-schema';

describe('save schema v2', () => {
  it('round-trips very large run values as canonical strings', () => {
    const game = createInitialGameState({
      run: { mass: '1e1000', matter: '2e1200' },
      upgrades: { gravity: 3, assimilation: 1 },
    });

    const canonicalMass = game.run.mass.serialize();
    const canonicalMatter = game.run.matter.serialize();
    const parsed = parseSave(serializeSave(game, { createdAt: 100, lastSavedAt: 200 }));
    const restored = restoreGameState(parsed);

    expect(parsed).toMatchObject({
      saveVersion: 2,
      game: { upgrades: { density: 0, gravity: 3, influence: 0, assimilation: 1, compression: 0 } },
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
    expect(() => parseSave(JSON.stringify({ saveVersion: 99 }))).toThrow(InvalidSaveError);
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

  it('migrates v1 saves without dropping Mass or Matter', () => {
    const legacy = {
      saveVersion: 1,
      createdAt: 10,
      lastSavedAt: 20,
      game: { run: { mass: '123', matter: '4.5' } },
    };
    const parsed = parseSave(JSON.stringify(legacy));
    const restored = restoreGameState(parsed);

    expect(parsed.saveVersion).toBe(2);
    expect(parsed.game.run).toEqual({ mass: '123', matter: '4.5' });
    expect(restored.run.mass.toNumber()).toBe(123);
    expect(restored.run.matter.toNumber()).toBe(4.5);
    expect(restored.upgrades.density).toBe(0);
  });

  it('rejects malformed upgrade levels in v2 saves', () => {
    const save = {
      saveVersion: 2,
      createdAt: 1,
      lastSavedAt: 2,
      game: {
        run: { mass: '0', matter: '0' },
        upgrades: { density: -1 },
      },
    };

    expect(() => parseSave(JSON.stringify(save))).toThrow(InvalidSaveError);
  });
});
