import { describe, expect, it } from 'vitest';

import { LocalPlatform } from './local-platform';

describe('LocalPlatform', () => {
  it('initializes without a portal SDK', async () => {
    await expect(new LocalPlatform().initialize()).resolves.toBeUndefined();
  });

  it('does not claim ads completed during local development', async () => {
    const platform = new LocalPlatform();

    await expect(platform.requestRewardedAd()).resolves.toEqual({ status: 'unavailable' });
    await expect(platform.requestMidgameAd()).resolves.toEqual({ status: 'unavailable' });
  });

  it('accepts local gameplay lifecycle notifications without side effects', () => {
    const platform = new LocalPlatform();

    expect(() => platform.gameplayStart()).not.toThrow();
    expect(() => platform.gameplayStop()).not.toThrow();
  });
});
