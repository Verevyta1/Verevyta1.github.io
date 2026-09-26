import type { ScaleBandDefinition } from '../core/content/content-definitions';

/** Approved scale-band names and order from the game design roadmap. */
export const SCALE_BANDS: readonly ScaleBandDefinition[] = Object.freeze([
  Object.freeze({ id: 'primordial', name: 'Primordial', order: 1 }),
  Object.freeze({ id: 'cellular', name: 'Cellular', order: 2 }),
  Object.freeze({ id: 'tiny', name: 'Tiny', order: 3 }),
  Object.freeze({ id: 'familiar', name: 'Familiar', order: 4 }),
  Object.freeze({ id: 'human', name: 'Human', order: 5 }),
  Object.freeze({ id: 'massive', name: 'Massive', order: 6 }),
  Object.freeze({ id: 'planetary', name: 'Planetary', order: 7 }),
  Object.freeze({ id: 'stellar', name: 'Stellar', order: 8 }),
  Object.freeze({ id: 'galactic', name: 'Galactic', order: 9 }),
  Object.freeze({ id: 'cosmic', name: 'Cosmic', order: 10 }),
  Object.freeze({ id: 'reality', name: 'Reality', order: 11 }),
  Object.freeze({ id: 'beyond', name: 'Beyond', order: 12 }),
]);
