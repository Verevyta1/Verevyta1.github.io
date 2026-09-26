import type { LaunchUpgradeDefinition } from '../core/launch/launch-game';

export const LAUNCH_UPGRADES: readonly LaunchUpgradeDefinition[] = Object.freeze([
  Object.freeze({
    id: 'throwStrength',
    name: 'Bandle Sling Tension',
    description: 'Pull back farther and launch Teemo with more force and lift.',
    baseCost: '12',
    costMultiplier: '1.38',
  }),
  Object.freeze({
    id: 'rocketSlam',
    name: 'Noxious Dive Charges',
    description: 'Carry more midair rocket slams to dive into minions.',
    baseCost: '12',
    costMultiplier: '1.38',
  }),
  Object.freeze({
    id: 'bouncePower',
    name: 'Blast Cone Bounce',
    description: 'Gain more height and forward momentum from every impact.',
    baseCost: '10',
    costMultiplier: '1.38',
  }),
  Object.freeze({
    id: 'speed',
    name: 'Swift Scout Speedometer',
    description: 'Raise Teemo’s top speed and keep momentum longer in flight.',
    baseCost: '14',
    costMultiplier: '1.38',
  }),
  Object.freeze({
    id: 'drag',
    name: 'Soft Landing',
    description: 'Lose less forward speed when Teemo hits the ground.',
    baseCost: '10',
    costMultiplier: '1.38',
  }),
  Object.freeze({
    id: 'minionMomentum',
    name: 'Minion Momentum',
    description: 'Keep more forward speed when Teemo bounces off a minion.',
    baseCost: '12',
    costMultiplier: '1.38',
  }),
  Object.freeze({
    id: 'goldBounty',
    name: 'Lane Plunder',
    description: 'Collect more gold each time a red, blue, or siege minion is smashed.',
    baseCost: '15',
    costMultiplier: '1.38',
  }),
]);
