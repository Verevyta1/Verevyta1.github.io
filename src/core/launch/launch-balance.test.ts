import { describe, expect, it } from 'vitest';

import {
  activateRocketSlam,
  advanceLaunchGame,
  beginLaunchAim,
  createInitialLaunchGameState,
  FIRST_MINION_DISTANCE,
  MINION_WAVE_SPACING,
  releaseTeemo,
  type LaunchUpgradeId,
} from './launch-game';

type Levels = Partial<Record<LaunchUpgradeId, number>>;

function run(upgrades: Levels, useSlams = false) {
  let state = releaseTeemo(beginLaunchAim(createInitialLaunchGameState({ upgrades })), 150, 26);
  for (let tick = 0; tick < 5_400 && state.run.phase === 'flying'; tick += 1) {
    const upcoming = FIRST_MINION_DISTANCE + state.run.nextMinionIndex * MINION_WAVE_SPACING;
    if (
      useSlams &&
      state.run.slamCharges > 0 &&
      state.run.height > 120 &&
      upcoming - state.run.distance > 45 &&
      upcoming - state.run.distance < 115
    ) {
      state = activateRocketSlam(state);
    }
    state = advanceLaunchGame(state, 1000 / 60).state;
  }
  return state;
}

describe('launch progression balance', () => {
  it('rewards each early movement upgrade with more distance', () => {
    const baseline = run({});
    expect(baseline.run.phase).toBe('finished');
    expect(baseline.run.distance).toBeGreaterThan(750);
    expect(baseline.run.distance).toBeLessThan(2_000);
    for (const upgrade of [
      'throwStrength',
      'speed',
      'bouncePower',
      'drag',
      'minionMomentum',
    ] as const) {
      expect(run({ [upgrade]: 1 }).run.distance).toBeGreaterThan(baseline.run.distance);
    }
    expect(Number(run({ goldBounty: 1 }).gold)).toBeGreaterThan(Number(baseline.gold));
  });

  it('makes the Nexus reachable before all tracks are maxed', () => {
    const twoLevels = run({
      throwStrength: 2,
      speed: 2,
      bouncePower: 2,
      drag: 2,
      minionMomentum: 2,
    });
    const threeLevels = run({
      throwStrength: 3,
      speed: 3,
      bouncePower: 3,
      drag: 3,
      minionMomentum: 3,
    });
    expect(twoLevels.run.phase).toBe('finished');
    expect(threeLevels.run.phase).toBe('won');
    expect(threeLevels.run.distance).toBe(5_000);
  });

  it('lets a timed Rocket Slam improve an early run', () => {
    expect(run({ speed: 1 }, true).run.distance).toBeGreaterThan(run({ speed: 1 }).run.distance);
  });
});
