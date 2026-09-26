import type { UpgradeDefinition } from '../core/economy/upgrades';

/** Early upgrade prices and effects are provisional greybox tuning. */
export const UPGRADE_DEFINITIONS: readonly UpgradeDefinition[] = Object.freeze([
  Object.freeze({
    id: 'density',
    name: 'Density',
    description: 'Matter arrives more often. Level 5 adds a second object to each arrival.',
    baseCost: '2',
    costMultiplier: '1.55',
  }),
  Object.freeze({
    id: 'gravity',
    name: 'Gravity',
    description: 'Eligible matter accelerates toward the Core more quickly.',
    baseCost: '4',
    costMultiplier: '1.6',
  }),
  Object.freeze({
    id: 'influence',
    name: 'Influence',
    description: 'The Core can draw in objects with larger Mass requirements.',
    baseCost: '8',
    costMultiplier: '1.65',
  }),
  Object.freeze({
    id: 'assimilation',
    name: 'Assimilation',
    description: 'Absorbed objects yield more temporary Matter.',
    baseCost: '10',
    costMultiplier: '1.65',
  }),
  Object.freeze({
    id: 'compression',
    name: 'Compression',
    description: 'Gravity Pulse becomes stronger and lasts longer.',
    baseCost: '10',
    costMultiplier: '1.65',
  }),
]);
