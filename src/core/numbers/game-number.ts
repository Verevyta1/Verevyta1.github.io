import Decimal from 'break_eternity.js';

export type GameNumberInput = GameNumber | number | string;

/**
 * Project-owned immutable numeric value for deterministic incremental-game math.
 *
 * The rest of the codebase should depend on GameNumber rather than importing
 * break_eternity.js directly. This keeps serialization, validation, and future
 * numeric-library changes behind one boundary.
 */
export class GameNumber {
  readonly #value: Decimal;

  private constructor(value: Decimal) {
    this.#value = value;
  }

  static from(input: GameNumberInput): GameNumber {
    if (input instanceof GameNumber) {
      return input;
    }

    return GameNumber.wrap(GameNumber.toDecimal(input));
  }

  static deserialize(serialized: string): GameNumber {
    return GameNumber.from(serialized);
  }

  add(other: GameNumberInput): GameNumber {
    return GameNumber.wrap(this.#value.add(GameNumber.toDecimal(other)));
  }

  subtract(other: GameNumberInput): GameNumber {
    return GameNumber.wrap(this.#value.sub(GameNumber.toDecimal(other)));
  }

  multiply(other: GameNumberInput): GameNumber {
    return GameNumber.wrap(this.#value.mul(GameNumber.toDecimal(other)));
  }

  divide(other: GameNumberInput): GameNumber {
    return GameNumber.wrap(this.#value.div(GameNumber.toDecimal(other)));
  }

  pow(exponent: GameNumberInput): GameNumber {
    return GameNumber.wrap(this.#value.pow(GameNumber.toDecimal(exponent)));
  }

  log10(): GameNumber {
    return GameNumber.wrap(this.#value.log10());
  }

  floor(): GameNumber {
    return GameNumber.wrap(this.#value.floor());
  }

  abs(): GameNumber {
    return GameNumber.wrap(this.#value.abs());
  }

  compare(other: GameNumberInput): number {
    return this.#value.cmp(GameNumber.toDecimal(other));
  }

  equals(other: GameNumberInput): boolean {
    return this.compare(other) === 0;
  }

  lessThan(other: GameNumberInput): boolean {
    return this.compare(other) < 0;
  }

  lessThanOrEqual(other: GameNumberInput): boolean {
    return this.compare(other) <= 0;
  }

  greaterThan(other: GameNumberInput): boolean {
    return this.compare(other) > 0;
  }

  greaterThanOrEqual(other: GameNumberInput): boolean {
    return this.compare(other) >= 0;
  }

  serialize(): string {
    return this.#value.toString();
  }

  toString(): string {
    return this.serialize();
  }

  /**
   * Converts only values representable as finite native JavaScript numbers.
   * Economy code should normally keep values as GameNumber instead.
   */
  toNumber(): number {
    const nativeValue = this.#value.toNumber();

    if (!Number.isFinite(nativeValue)) {
      throw new RangeError('GameNumber cannot be represented as a finite JavaScript number.');
    }

    return nativeValue;
  }

  private static toDecimal(input: Exclude<GameNumberInput, GameNumber>): Decimal;
  private static toDecimal(input: GameNumberInput): Decimal;
  private static toDecimal(input: GameNumberInput): Decimal {
    if (input instanceof GameNumber) {
      return input.#value;
    }

    if (typeof input === 'number') {
      if (!Number.isFinite(input)) {
        throw new RangeError('GameNumber requires a finite numeric input.');
      }

      return new Decimal(input);
    }

    const normalized = input.trim();
    if (normalized.length === 0 || /^(?:[+-]?Infinity|NaN)$/i.test(normalized)) {
      throw new RangeError('GameNumber requires a finite serialized numeric value.');
    }

    return new Decimal(normalized);
  }

  private static wrap(value: Decimal): GameNumber {
    if (value.isNaN() || !value.isFinite()) {
      throw new RangeError('GameNumber operation produced a non-finite value.');
    }

    return new GameNumber(value);
  }
}
