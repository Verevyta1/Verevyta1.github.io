import { describe, expect, it } from 'vitest';

import {
  activateMushroomBoost,
  advanceLaunchGame,
  buyLaunchUpgrade,
  createInitialLaunchGameState,
  parseLaunchSave,
  serializeLaunchSave,
  startLaunchRun,
} from './launch-game';
import { LAUNCH_UPGRADES } from '../../data/launch-upgrades';

describe('Nexus launch simulation', () => {
  it('launches deterministically and awards gold for smashed minions', () => {
    let first = startLaunchRun(createInitialLaunchGameState());
    let second = startLaunchRun(createInitialLaunchGameState());
    let earned = false;

    for (let tick = 0; tick < 60; tick += 1) {
      const a = advanceLaunchGame(first, 50);
      const b = advanceLaunchGame(second, 50);
      first = a.state;
      second = b.state;
      earned ||= a.smashed.length > 0;
    }

    expect(earned).toBe(true);
    expect(Number(first.gold)).toBeGreaterThan(0);
    expect(first.run.distance).toBe(second.run.distance);
    expect(first.gold).toBe(second.gold);
  });

  it('boosts a live run and blocks repeated use during cooldown', () => {
    const launched = startLaunchRun(createInitialLaunchGameState());
    const boosted = activateMushroomBoost(launched);

    expect(boosted.run.horizontalSpeed).toBeGreaterThan(launched.run.horizontalSpeed);
    expect(activateMushroomBoost(boosted)).toBe(boosted);
  });

  it('buys upgrades atomically and rejects unaffordable purchases', () => {
    const poor = createInitialLaunchGameState();
    expect(buyLaunchUpgrade(poor, 'launchPower', LAUNCH_UPGRADES).state).toBe(poor);

    const bought = buyLaunchUpgrade(
      createInitialLaunchGameState({ gold: '100' }),
      'launchPower',
      LAUNCH_UPGRADES,
    );

    expect(bought.purchased).toBe(true);
    expect(bought.state.gold).toBe('80');
    expect(bought.state.upgrades.launchPower).toBe(1);
  });

  it('persists gold, best distance, and upgrade levels', () => {
    const state = createInitialLaunchGameState({
      gold: '1234',
      bestDistance: 987,
      upgrades: { goldBounty: 2 },
    });

    expect(parseLaunchSave(serializeLaunchSave(state, 10))).toMatchObject({
      gold: '1234',
      bestDistance: 987,
      upgrades: { goldBounty: 2 },
      run: { phase: 'ready' },
    });
  });

  it('rejects invalid time', () => {
    expect(() => advanceLaunchGame(startLaunchRun(createInitialLaunchGameState()), -1)).toThrow();
  });
});
