import { describe, expect, it } from 'vitest';

import {
  activateRocketSlam,
  advanceLaunchGame,
  beginLaunchAim,
  FIRST_MINION_DISTANCE,
  buyLaunchUpgrade,
  calculateLaunchUpgradeCost,
  createInitialLaunchGameState,
  isNexusUnlocked,
  masteredUpgradeCount,
  MAX_UPGRADE_LEVEL,
  NEXUS_DISTANCE,
  NEXUS_GATE_DISTANCE,
  parseLaunchSave,
  releaseTeemo,
  serializeLaunchSave,
  type LaunchGameState,
} from './launch-game';
import { LAUNCH_UPGRADES } from '../../data/launch-upgrades';

function throwTeemo(state = createInitialLaunchGameState()): LaunchGameState {
  return releaseTeemo(beginLaunchAim(state), 110, 25);
}

describe('Teemo launch simulation', () => {
  it('uses drag-and-release to start a deterministic run', () => {
    let first = throwTeemo();
    let second = throwTeemo();
    let earned = false;

    expect(first.run.phase).toBe('flying');
    expect(first.run.horizontalSpeed).toBeGreaterThan(0);
    for (let tick = 0; tick < 60; tick += 1) {
      const a = advanceLaunchGame(first, 50);
      const b = advanceLaunchGame(second, 50);
      first = a.state;
      second = b.state;
      earned ||= a.smashed.length > 0;
      expect(first.run.distance).toBe(second.run.distance);
      expect(first.gold).toBe(second.gold);
      if (first.run.phase !== 'flying') {
        break;
      }
    }

    expect(earned).toBe(true);
    expect(Number(first.gold)).toBeGreaterThan(0);
  });

  it('gives throw-strength upgrades a visible launch effect', () => {
    const basic = throwTeemo();
    const upgraded = throwTeemo(
      createInitialLaunchGameState({
        upgrades: { throwStrength: 1 },
      }),
    );

    expect(upgraded.run.horizontalSpeed).toBeGreaterThan(basic.run.horizontalSpeed);
    expect(upgraded.run.verticalSpeed).toBeGreaterThan(basic.run.verticalSpeed);
  });

  it('raises the speed cap for stronger throws', () => {
    const strongestThrow = { throwStrength: MAX_UPGRADE_LEVEL };
    const capped = throwTeemo(createInitialLaunchGameState({ upgrades: strongestThrow }));
    const faster = throwTeemo(
      createInitialLaunchGameState({
        upgrades: { ...strongestThrow, speed: MAX_UPGRADE_LEVEL },
      }),
    );

    expect(faster.run.horizontalSpeed).toBeGreaterThan(capped.run.horizontalSpeed);
  });

  it('reduces ground speed loss and improves minion bounce momentum', () => {
    const groundBounceSpeed = (drag: number): number => {
      const launched = throwTeemo(createInitialLaunchGameState({ upgrades: { drag } }));
      const landing: LaunchGameState = {
        ...launched,
        run: { ...launched.run, height: 1, verticalSpeed: -4, horizontalSpeed: 10 },
      };
      return advanceLaunchGame(landing, 50).state.run.horizontalSpeed;
    };
    const minionImpact = (minionMomentum: number, bouncePower = 0, goldBounty = 0) => {
      const launched = throwTeemo(
        createInitialLaunchGameState({
          upgrades: { minionMomentum, bouncePower, goldBounty },
        }),
      );
      const approaching: LaunchGameState = {
        ...launched,
        run: {
          ...launched.run,
          distance: FIRST_MINION_DISTANCE - 20,
          height: 10,
          horizontalSpeed: 10,
          verticalSpeed: 0,
        },
      };
      return advanceLaunchGame(approaching, 50);
    };

    expect(groundBounceSpeed(5)).toBeGreaterThan(groundBounceSpeed(0));
    expect(minionImpact(5).state.run.horizontalSpeed).toBeGreaterThan(
      minionImpact(0).state.run.horizontalSpeed,
    );
    expect(minionImpact(0, 5).state.run.verticalSpeed).toBeGreaterThan(
      minionImpact(0, 0).state.run.verticalSpeed,
    );
    expect(minionImpact(0).smashed[0]?.gold).toBe(8);
    expect(minionImpact(0, 0, MAX_UPGRADE_LEVEL).smashed[0]?.gold).toBe(16);
  });

  it('spends rocket-slam charges to drive Teemo downward', () => {
    const launched = throwTeemo(createInitialLaunchGameState({ upgrades: { rocketSlam: 2 } }));
    const airborne: LaunchGameState = {
      ...launched,
      run: { ...launched.run, height: 100, verticalSpeed: 8 },
    };
    const slammed = activateRocketSlam(airborne);

    expect(slammed.run.slamCharges).toBe(2);
    expect(slammed.run.verticalSpeed).toBeLessThan(0);
    expect(slammed.run.horizontalSpeed).toBeGreaterThan(airborne.run.horizontalSpeed);
    expect(activateRocketSlam(slammed)).toBe(slammed);
  });

  it('allows another drag launch after a run finishes and blocks upgrades mid-run', () => {
    const launched = throwTeemo();
    const purchase = buyLaunchUpgrade(launched, 'speed', LAUNCH_UPGRADES);

    expect(purchase.purchased).toBe(false);
    const prepared = beginLaunchAim({
      ...launched,
      run: { ...launched.run, phase: 'finished' },
    });
    expect(prepared.run.phase).toBe('aiming');
    expect(prepared.run.distance).toBe(0);
  });

  it('ends a normal run short of the Nexus and never grants a one-run victory', () => {
    let state = throwTeemo();

    for (let tick = 0; tick < 900 && state.run.phase === 'flying'; tick += 1) {
      state = advanceLaunchGame(state, 50).state;
    }

    expect(state.run.phase).toBe('finished');
    expect(state.run.distance).toBeLessThan(NEXUS_DISTANCE);
    expect(isNexusUnlocked(state.upgrades)).toBe(false);
  });

  it('stops an unmastered run at the Nexus shield', () => {
    const launched = throwTeemo();
    const nearGate: LaunchGameState = {
      ...launched,
      run: {
        ...launched.run,
        phase: 'flying',
        distance: NEXUS_GATE_DISTANCE - 1,
        height: 25,
        horizontalSpeed: 8,
        verticalSpeed: 2,
      },
    };

    const frame = advanceLaunchGame(nearGate, 50);

    expect(frame.runEnded).toBe(true);
    expect(frame.state.run.phase).toBe('finished');
    expect(frame.state.run.blockedAtNexus).toBe(true);
    expect(frame.state.run.distance).toBe(NEXUS_GATE_DISTANCE);
  });

  it('only opens the Nexus shield after every upgrade track is mastered', () => {
    const upgrades = {
      throwStrength: MAX_UPGRADE_LEVEL,
      rocketSlam: MAX_UPGRADE_LEVEL,
      bouncePower: MAX_UPGRADE_LEVEL,
      speed: MAX_UPGRADE_LEVEL,
      drag: MAX_UPGRADE_LEVEL,
      minionMomentum: MAX_UPGRADE_LEVEL,
      goldBounty: MAX_UPGRADE_LEVEL,
    };
    const mastered = createInitialLaunchGameState({ upgrades });
    const missingTrack = createInitialLaunchGameState({
      upgrades: { ...upgrades, drag: MAX_UPGRADE_LEVEL - 1 },
    });

    expect(masteredUpgradeCount(mastered.upgrades)).toBe(7);
    expect(isNexusUnlocked(mastered.upgrades)).toBe(true);
    expect(isNexusUnlocked(missingTrack.upgrades)).toBe(false);
  });

  it('allows the Nexus win only after every upgrade track is mastered', () => {
    const upgrades = {
      throwStrength: MAX_UPGRADE_LEVEL,
      rocketSlam: MAX_UPGRADE_LEVEL,
      bouncePower: MAX_UPGRADE_LEVEL,
      speed: MAX_UPGRADE_LEVEL,
      drag: MAX_UPGRADE_LEVEL,
      minionMomentum: MAX_UPGRADE_LEVEL,
      goldBounty: MAX_UPGRADE_LEVEL,
    };
    const launched = throwTeemo(createInitialLaunchGameState({ upgrades }));
    const nearNexus: LaunchGameState = {
      ...launched,
      run: {
        ...launched.run,
        phase: 'flying',
        distance: NEXUS_DISTANCE - 1,
        height: 25,
        horizontalSpeed: 8,
        verticalSpeed: 2,
      },
    };

    const frame = advanceLaunchGame(nearNexus, 50);

    expect(frame.runEnded).toBe(true);
    expect(frame.state.run.phase).toBe('won');
    expect(frame.state.run.blockedAtNexus).toBe(false);
    expect(frame.state.run.distance).toBe(NEXUS_DISTANCE);
  });

  it('caps upgrade levels and rejects unaffordable purchases', () => {
    const poor = createInitialLaunchGameState();
    expect(buyLaunchUpgrade(poor, 'throwStrength', LAUNCH_UPGRADES).state).toBe(poor);

    const definition = LAUNCH_UPGRADES.find((entry) => entry.id === 'throwStrength');
    expect(definition).toBeDefined();
    if (!definition) {
      throw new Error('Expected the throw-strength upgrade definition.');
    }
    const cost = calculateLaunchUpgradeCost(definition, MAX_UPGRADE_LEVEL - 1);
    const mastered = createInitialLaunchGameState({
      gold: cost.serialize(),
      upgrades: { throwStrength: MAX_UPGRADE_LEVEL },
    });
    expect(buyLaunchUpgrade(mastered, 'throwStrength', LAUNCH_UPGRADES).purchased).toBe(false);
  });

  it('persists progress and migrates existing saves', () => {
    const state = createInitialLaunchGameState({
      gold: '1234',
      bestDistance: 987,
      upgrades: { goldBounty: 2, drag: 1 },
    });
    expect(parseLaunchSave(serializeLaunchSave(state, 10))).toMatchObject({
      gold: '1234',
      bestDistance: 987,
      upgrades: { goldBounty: 2, drag: 1 },
      run: { phase: 'ready' },
    });

    expect(
      parseLaunchSave(
        JSON.stringify({
          saveVersion: 1,
          savedAt: 10,
          gold: '300',
          bestDistance: 700,
          upgrades: {
            launchPower: 9,
            bouncePower: 2,
            goldBounty: 1,
            mushroomBoost: 3,
          },
        }),
      ),
    ).toMatchObject({
      gold: '300',
      bestDistance: 700,
      upgrades: {
        throwStrength: MAX_UPGRADE_LEVEL,
        bouncePower: 2,
        goldBounty: 1,
        rocketSlam: 3,
      },
    });
  });

  it('rejects invalid time and drag input', () => {
    expect(() => advanceLaunchGame(throwTeemo(), -1)).toThrow();
    expect(() => releaseTeemo(beginLaunchAim(createInitialLaunchGameState()), Infinity, 0)).toThrow();
  });
});
