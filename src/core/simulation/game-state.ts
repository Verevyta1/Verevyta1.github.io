import {
  createInitialRunState,
  type InitialRunStateInput,
  type RunState,
} from '../economy/run-state';

export interface GameState {
  readonly run: RunState;
}

export interface InitialGameStateInput {
  readonly run?: InitialRunStateInput;
}

/**
 * Creates the deterministic root state used by the simulation.
 * Renderer, DOM UI, and platform adapters should consume snapshots of this state.
 */
export function createInitialGameState(input: InitialGameStateInput = {}): GameState {
  return Object.freeze({
    run: createInitialRunState(input.run ?? {}),
  });
}
