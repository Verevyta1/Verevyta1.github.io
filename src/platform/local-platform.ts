import type { PlatformAdResult, PlatformApi } from './platform-api';

const UNAVAILABLE_AD_RESULT: PlatformAdResult = Object.freeze({ status: 'unavailable' });

/** Local development adapter; it never simulates ad completion or rewards. */
export class LocalPlatform implements PlatformApi {
  initialize(): Promise<void> {
    return Promise.resolve();
  }

  gameplayStart(): void {
    // Local development has no portal lifecycle to notify.
  }

  gameplayStop(): void {
    // Local development has no portal lifecycle to notify.
  }

  requestRewardedAd(): Promise<PlatformAdResult> {
    return Promise.resolve(UNAVAILABLE_AD_RESULT);
  }

  requestMidgameAd(): Promise<PlatformAdResult> {
    return Promise.resolve(UNAVAILABLE_AD_RESULT);
  }
}
