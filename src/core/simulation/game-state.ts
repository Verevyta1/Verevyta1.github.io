import {
  createInitialRunState,
  type InitialRunStateInput,
  type RunState,
} from '../economy/run-state';
import {
  createInitialUpgradeLevels,
  type UpgradeId,
  type UpgradeLevels,
} from '../economy/upgrades';

export interface GameState {
  readonly run: RunState;
  readonly upgrades: UpgradeLevels;
}

export interface InitialGameStateInput {
  readonly run?: InitialRunStateInput;
  readonly upgrades?: Partial<Record<UpgradeId, number>>;
}

/**
 * Creates the deterministic root state used by the simulation.
 * Renderer, DOM UI, and platform adapters should consume snapshots of this state.
 */
export function createInitialGameState(input: InitialGameStateInput = {}): GameState {
  return Object.freeze({
    run: createInitialRunState(input.run ?? {}),
    upgrades: createInitialUpgradeLevels(input.upgrades ?? {}),
  });
}
