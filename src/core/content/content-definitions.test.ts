import { describe, expect, it } from 'vitest';

import {
  ContentValidationError,
  validateContentDefinitions,
} from './content-definitions';

const starterDefinitions = {
  scaleBands: [
    { id: 'primordial', name: 'Primordial', order: 1 },
    { id: 'cellular', name: 'Cellular', order: 2 },
  ],
  objects: [
    {
      id: 'primordial_mote_01',
      name: 'Mote',
      family: 'strange-particle',
      scaleBand: 'primordial',
      requiredMass: '0',
      massReward: '1e1000',
      matterReward: '12.5',
      spawnWeight: 1.2,
      visualScale: 0.5,
      assetKey: 'mote-01',
      absorptionProfile: 'light',
      rarity: 'common',
    },
  ],
};

describe('content definition validation', () => {
  it('accepts documented scale-band and object fields with extreme economic values', () => {
    const definitions = validateContentDefinitions(starterDefinitions, {
      availableAssetKeys: new Set(['mote-01']),
    });

    expect(definitions.scaleBands).toHaveLength(2);
    expect(definitions.objects[0]?.requiredMass).toBe('0');
    expect(definitions.objects[0]?.massReward).toBe('1e1000');
    expect(Object.isFrozen(definitions)).toBe(true);
    expect(Object.isFrozen(definitions.scaleBands)).toBe(true);
    expect(Object.isFrozen(definitions.objects[0])).toBe(true);
  });

  it('rejects duplicate IDs, duplicate orders, and non-increasing band order', () => {
    const invalid = {
      scaleBands: [
        { id: 'primordial', name: 'Primordial', order: 1 },
        { id: 'primordial', name: 'Second', order: 1 },
        { id: 'cellular', name: 'Cellular', order: 0 },
      ],
      objects: [],
    };

    expect(() => validateContentDefinitions(invalid)).toThrow(ContentValidationError);

    try {
      validateContentDefinitions(invalid);
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      expect((error as ContentValidationError).issues.map((issue) => issue.code)).toEqual(
        expect.arrayContaining([
          'duplicate_scale_band_id',
          'duplicate_scale_band_order',
          'invalid_order',
          'non_increasing_scale_band_order',
        ]),
      );
    }
  });

  it('rejects duplicate object IDs and unknown scale-band references', () => {
    const invalid = {
      ...starterDefinitions,
      objects: [
        starterDefinitions.objects[0],
        { ...starterDefinitions.objects[0], scaleBand: 'unknown-band' },
      ],
    };

    expect(() => validateContentDefinitions(invalid)).toThrow(ContentValidationError);

    try {
      validateContentDefinitions(invalid);
    } catch (error) {
      expect((error as ContentValidationError).issues.map((issue) => issue.code)).toEqual(
        expect.arrayContaining(['duplicate_object_id', 'unknown_scale_band']),
      );
    }
  });

  it('rejects negative or malformed GameNumber strings', () => {
    const invalid = {
      ...starterDefinitions,
      objects: [
        { ...starterDefinitions.objects[0], massReward: '-1' },
        { ...starterDefinitions.objects[0], id: 'mote_02', matterReward: 'not-a-number' },
      ],
    };

    try {
      validateContentDefinitions(invalid);
      throw new Error('Expected content validation to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      expect((error as ContentValidationError).issues.map((issue) => issue.code)).toEqual(
        expect.arrayContaining(['negative_game_number', 'invalid_game_number']),
      );
    }
  });

  it('rejects invalid spawn weights, visual scales, and unresolved asset keys', () => {
    const invalid = {
      ...starterDefinitions,
      objects: [
        {
          ...starterDefinitions.objects[0],
          spawnWeight: 0,
          visualScale: Number.POSITIVE_INFINITY,
          assetKey: 'missing-asset',
        },
      ],
    };

    try {
      validateContentDefinitions(invalid, { availableAssetKeys: new Set(['mote-01']) });
      throw new Error('Expected content validation to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      expect((error as ContentValidationError).issues.map((issue) => issue.code)).toEqual(
        expect.arrayContaining(['invalid_positive_number', 'missing_asset_reference']),
      );
    }
  });

  it('rejects a missing scale-band list and non-object entries', () => {
    expect(() => validateContentDefinitions({ scaleBands: [], objects: [] })).toThrow(
      ContentValidationError,
    );
    expect(() =>
      validateContentDefinitions({
        scaleBands: [{ id: 'primordial', name: 'Primordial', order: 1 }],
        objects: [null],
      }),
    ).toThrow(ContentValidationError);
  });
});
