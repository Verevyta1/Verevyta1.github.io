import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../simulation/game-state';
import { purchaseUpgrade } from './purchase-upgrade';

describe('purchaseUpgrade', () => {
  it('rejects a missing upgrade definition without changing the input game', () => {
    const game = createInitialGameState();

    expect(() => purchaseUpgrade(game, 'density', [])).toThrow(RangeError);
    expect(game.upgrades.density).toBe(0);
  });
});
