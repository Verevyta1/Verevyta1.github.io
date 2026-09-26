import { describe, expect, it } from 'vitest';

import { GameNumber } from '../core/numbers/game-number';
import { formatResourceAmount } from './resource-format';

describe('formatResourceAmount', () => {
  it('formats ordinary resource values with a compact grouped number', () => {
    expect(formatResourceAmount(GameNumber.from('1234.5'))).toBe('1,234.5');
    expect(formatResourceAmount(GameNumber.from('0.125'))).toBe('0.13');
  });

  it('keeps extreme values readable without converting them to native numbers', () => {
    expect(formatResourceAmount(GameNumber.from('1e1000'))).toMatch(/^1e1000$/);
  });
});
