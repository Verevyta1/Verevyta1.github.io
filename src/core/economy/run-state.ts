import { GameNumber, type GameNumberInput } from '../numbers/game-number';

const ZERO = GameNumber.from(0);

export interface RunState {
  readonly mass: GameNumber;
  readonly matter: GameNumber;
}

export interface InitialRunStateInput {
  readonly mass?: GameNumberInput;
  readonly matter?: GameNumberInput;
}

export interface AbsorptionReward {
  readonly mass: GameNumberInput;
  readonly matter: GameNumberInput;
}

/** Creates the authoritative per-run resource state. */
export function createInitialRunState(input: InitialRunStateInput = {}): RunState {
  return freezeRunState({
    mass: requireNonNegative(input.mass ?? 0, 'Mass'),
    matter: requireNonNegative(input.matter ?? 0, 'Matter'),
  });
}

/**
 * Applies one deterministic economic absorption result.
 * Rendering and animation must react to this result rather than decide it.
 */
export function applyAbsorption(state: RunState, reward: AbsorptionReward): RunState {
  const massReward = requireNonNegative(reward.mass, 'Mass reward');
  const matterReward = requireNonNegative(reward.matter, 'Matter reward');

  return freezeRunState({
    mass: state.mass.add(massReward),
    matter: state.matter.add(matterReward),
  });
}

export function canAffordMatter(state: RunState, cost: GameNumberInput): boolean {
  const normalizedCost = requireNonNegative(cost, 'Matter cost');
  return state.matter.greaterThanOrEqual(normalizedCost);
}

/** Spends temporary Matter without changing non-spendable Mass. */
export function spendMatter(state: RunState, cost: GameNumberInput): RunState {
  const normalizedCost = requireNonNegative(cost, 'Matter cost');

  if (state.matter.lessThan(normalizedCost)) {
    throw new RangeError('Insufficient Matter.');
  }

  return freezeRunState({
    mass: state.mass,
    matter: state.matter.subtract(normalizedCost),
  });
}

function requireNonNegative(input: GameNumberInput, label: string): GameNumber {
  const value = GameNumber.from(input);

  if (value.lessThan(ZERO)) {
    throw new RangeError(`${label} cannot be negative.`);
  }

  return value;
}

function freezeRunState(state: RunState): RunState {
  return Object.freeze(state);
}
