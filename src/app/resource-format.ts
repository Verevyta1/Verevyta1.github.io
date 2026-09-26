import { GameNumber } from '../core/numbers/game-number';

const PLAIN_NUMBER_LIMIT = GameNumber.from('1e6');

export function formatResourceAmount(value: GameNumber): string {
  if (value.lessThan(PLAIN_NUMBER_LIMIT)) {
    return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value.toNumber());
  }

  return value.serialize().replace(/e\+/, 'e');
}
