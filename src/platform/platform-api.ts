export type PlatformAdResult =
  | { readonly status: 'completed' }
  | { readonly status: 'cancelled' }
  | { readonly status: 'unavailable' }
  | { readonly status: 'error' };

/** Project-owned boundary for portal lifecycle and ad results. */
export interface PlatformApi {
  initialize(): Promise<void>;
  gameplayStart(): void;
  gameplayStop(): void;
  requestRewardedAd(): Promise<PlatformAdResult>;
  requestMidgameAd(): Promise<PlatformAdResult>;
}
