import { describe, expect, it } from 'vitest';

import { GameNumber } from './game-number';

describe('GameNumber', () => {
  it('creates equivalent values from native numbers and scientific strings', () => {
    expect(GameNumber.from(1250).equals(GameNumber.from('1.25e3'))).toBe(true);
  });

  it('performs immutable arithmetic without exposing native operators', () => {
    const start = GameNumber.from('1e1000');
    const doubled = start.multiply(2);
    const increased = doubled.add('5e999');

    expect(start.equals('1e1000')).toBe(true);
    expect(doubled.equals('2e1000')).toBe(true);
    expect(increased.equals('2.5e1000')).toBe(true);
  });

  it('supports values beyond the native JavaScript finite range', () => {
    const huge = GameNumber.from('1e1000').multiply('1e1000');

    expect(huge.equals('1e2000')).toBe(true);
    expect(huge.greaterThan(Number.MAX_VALUE)).toBe(true);
  });

  it('compares values without converting them to native numbers', () => {
    const lower = GameNumber.from('9.99e500');
    const higher = GameNumber.from('1e501');

    expect(lower.lessThan(higher)).toBe(true);
    expect(lower.lessThanOrEqual(higher)).toBe(true);
    expect(higher.greaterThan(lower)).toBe(true);
    expect(higher.greaterThanOrEqual(lower)).toBe(true);
    expect(higher.compare(lower)).toBe(1);
  });

  it('supports powers, logarithms, flooring, and absolute values', () => {
    expect(GameNumber.from(10).pow(1000).equals('1e1000')).toBe(true);
    expect(GameNumber.from('1e1000').log10().equals(1000)).toBe(true);
    expect(GameNumber.from('42.9').floor().equals(42)).toBe(true);
    expect(GameNumber.from('-7.5').abs().equals('7.5')).toBe(true);
  });

  it('round-trips serialized extreme values through the project wrapper', () => {
    const original = GameNumber.from('1e1000').pow('1e6');
    const serialized = original.serialize();
    const restored = GameNumber.deserialize(serialized);

    expect(restored.equals(original)).toBe(true);
  });

  it('rejects invalid and non-finite inputs', () => {
    expect(() => GameNumber.from(Number.NaN)).toThrow(RangeError);
    expect(() => GameNumber.from(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => GameNumber.from('')).toThrow(RangeError);
    expect(() => GameNumber.from('NaN')).toThrow(RangeError);
  });

  it('rejects operations that would produce non-finite results', () => {
    expect(() => GameNumber.from(1).divide(0)).toThrow(RangeError);
    expect(() => GameNumber.from(0).log10()).toThrow(RangeError);
  });

  it('throws instead of silently overflowing during native-number conversion', () => {
    expect(GameNumber.from('123.5').toNumber()).toBe(123.5);
    expect(() => GameNumber.from('1e1000').toNumber()).toThrow(RangeError);
  });
});
