import { canAffordMatter, spendMatter } from './run-state';
import {
  calculateUpgradeCost,
  increaseUpgradeLevel,
  type UpgradeDefinition,
  type UpgradeId,
} from './upgrades';
import type { GameState } from '../simulation/game-state';

export interface UpgradePurchaseResult {
  readonly game: GameState;
  readonly cost: ReturnType<typeof calculateUpgradeCost>;
  readonly purchased: boolean;
}

/** Applies one atomic Matter purchase, leaving the input state untouched on failure. */
export function purchaseUpgrade(
  game: GameState,
  id: UpgradeId,
  definitions: readonly UpgradeDefinition[],
): UpgradePurchaseResult {
  const definition = definitions.find((candidate) => candidate.id === id);

  if (!definition) {
    throw new RangeError('Upgrade has no matching definition.');
  }

  const currentLevel = game.upgrades[id];
  const cost = calculateUpgradeCost(definition, currentLevel);

  if (!canAffordMatter(game.run, cost)) {
    return Object.freeze({ game, cost, purchased: false });
  }

  const nextRun = spendMatter(game.run, cost);
  const nextUpgrades = increaseUpgradeLevel(game.upgrades, id);
  const nextGame = Object.freeze({ run: nextRun, upgrades: nextUpgrades });

  return Object.freeze({ game: nextGame, cost, purchased: true });
}
