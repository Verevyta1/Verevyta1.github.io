import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../simulation/game-state';
import {
  applyAbsorption,
  canAffordMatter,
  createInitialRunState,
  spendMatter,
} from './run-state';

describe('run economy state', () => {
  it('starts with frozen zero-valued Mass and Matter', () => {
    const state = createInitialRunState();

    expect(Object.isFrozen(state)).toBe(true);
    expect(state.mass.equals(0)).toBe(true);
    expect(state.matter.equals(0)).toBe(true);
  });

  it('accepts deterministic large-number initial values', () => {
    const state = createInitialRunState({ mass: '1e1000', matter: '7.5e900' });

    expect(state.mass.equals('1e1000')).toBe(true);
    expect(state.matter.equals('7.5e900')).toBe(true);
  });

  it('applies absorption rewards immutably', () => {
    const before = createInitialRunState({ mass: 10, matter: 20 });
    const after = applyAbsorption(before, { mass: 5, matter: 8 });

    expect(before.mass.equals(10)).toBe(true);
    expect(before.matter.equals(20)).toBe(true);
    expect(after.mass.equals(15)).toBe(true);
    expect(after.matter.equals(28)).toBe(true);
    expect(after).not.toBe(before);
    expect(Object.isFrozen(after)).toBe(true);
  });

  it('supports extreme absorption rewards without native-number conversion', () => {
    const before = createInitialRunState({ mass: '1e1000', matter: '1e1200' });
    const after = applyAbsorption(before, { mass: '1e1000', matter: '1e1200' });

    expect(after.mass.equals('2e1000')).toBe(true);
    expect(after.matter.equals('2e1200')).toBe(true);
  });

  it('checks Matter affordability at exact and insufficient boundaries', () => {
    const state = createInitialRunState({ matter: '1e500' });

    expect(canAffordMatter(state, '1e500')).toBe(true);
    expect(canAffordMatter(state, '1.01e500')).toBe(false);
  });

  it('spends Matter while preserving non-spendable Mass', () => {
    const before = createInitialRunState({ mass: 1234, matter: 100 });
    const after = spendMatter(before, 35);

    expect(after.mass).toBe(before.mass);
    expect(after.mass.equals(1234)).toBe(true);
    expect(after.matter.equals(65)).toBe(true);
    expect(before.matter.equals(100)).toBe(true);
  });

  it('rejects negative values and overspending', () => {
    expect(() => createInitialRunState({ mass: -1 })).toThrow(RangeError);
    expect(() => createInitialRunState({ matter: '-0.01' })).toThrow(RangeError);

    const state = createInitialRunState({ matter: 10 });

    expect(() => applyAbsorption(state, { mass: -1, matter: 0 })).toThrow(RangeError);
    expect(() => applyAbsorption(state, { mass: 0, matter: -1 })).toThrow(RangeError);
    expect(() => canAffordMatter(state, -1)).toThrow(RangeError);
    expect(() => spendMatter(state, -1)).toThrow(RangeError);
    expect(() => spendMatter(state, 11)).toThrow(RangeError);
  });
});

describe('root game state', () => {
  it('owns the deterministic run state without renderer concerns', () => {
    const state = createInitialGameState({ run: { mass: '5e40', matter: '9e30' } });

    expect(Object.isFrozen(state)).toBe(true);
    expect(state.run.mass.equals('5e40')).toBe(true);
    expect(state.run.matter.equals('9e30')).toBe(true);
  });
});
