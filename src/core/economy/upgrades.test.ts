import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../simulation/game-state';
import { UPGRADE_DEFINITIONS } from '../../data/upgrades';
import { purchaseUpgrade } from './purchase-upgrade';
import {
  calculateUpgradeCost,
  createInitialUpgradeLevels,
  getAssimilationMatterMultiplier,
  getDensitySpawnBurst,
  getDensitySpawnIntervalMs,
  getGravityAttractionMultiplier,
  getGravityPulseDurationMs,
  getGravityPulseSpeedMultiplier,
  getInfluenceMassMultiplier,
} from './upgrades';

describe('upgrade rules', () => {
  it('grows Matter costs exponentially and applies the data-driven base price', () => {
    const density = UPGRADE_DEFINITIONS.find((definition) => definition.id === 'density');

    expect(density).toBeDefined();
    expect(calculateUpgradeCost(density!, 0).toNumber()).toBe(2);
    expect(calculateUpgradeCost(density!, 2).toNumber()).toBeCloseTo(4.805);
  });

  it('keeps one Matter purchase atomic and never spends Mass', () => {
    const game = createInitialGameState({ run: { mass: '100', matter: '10' } });
    const purchase = purchaseUpgrade(game, 'density', UPGRADE_DEFINITIONS);

    expect(purchase.purchased).toBe(true);
    expect(purchase.game.run.mass.serialize()).toBe('100');
    expect(purchase.game.run.matter.toNumber()).toBe(8);
    expect(purchase.game.upgrades.density).toBe(1);
    expect(game.run.matter.toNumber()).toBe(10);
    expect(game.upgrades.density).toBe(0);
  });

  it('leaves state unchanged when Matter cannot cover a purchase', () => {
    const game = createInitialGameState({ run: { mass: '100', matter: '1' } });
    const purchase = purchaseUpgrade(game, 'density', UPGRADE_DEFINITIONS);

    expect(purchase.purchased).toBe(false);
    expect(purchase.game).toBe(game);
    expect(purchase.game.run.matter.toNumber()).toBe(1);
    expect(purchase.game.upgrades.density).toBe(0);
  });

  it('validates saved upgrade levels and exposes the milestone behaviour', () => {
    expect(createInitialUpgradeLevels().density).toBe(0);
    expect(() => createInitialUpgradeLevels({ gravity: -1 })).toThrow(RangeError);
    expect(getDensitySpawnIntervalMs(1)).toBeLessThan(getDensitySpawnIntervalMs(0));
    expect(getDensitySpawnBurst(4)).toBe(1);
    expect(getDensitySpawnBurst(5)).toBe(2);
  });

  it('provides the other upgrade effects to the simulation boundary', () => {
    expect(getGravityAttractionMultiplier(2)).toBeCloseTo(1.3);
    expect(getInfluenceMassMultiplier(2)).toBeCloseTo(1.2);
    expect(getAssimilationMatterMultiplier(2).toNumber()).toBeCloseTo(1.2);
    expect(getGravityPulseDurationMs(1)).toBeGreaterThan(getGravityPulseDurationMs(0));
    expect(getGravityPulseSpeedMultiplier(1)).toBeGreaterThan(getGravityPulseSpeedMultiplier(0));
  });
});
