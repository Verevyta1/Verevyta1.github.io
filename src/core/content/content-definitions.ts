import { GameNumber } from '../numbers/game-number';

export interface ScaleBandDefinition {
  readonly id: string;
  readonly name: string;
  /** One-based position in the scale progression. */
  readonly order: number;
}

export interface MatterObjectDefinition {
  readonly id: string;
  readonly name: string;
  readonly family: string;
  readonly scaleBand: string;
  readonly requiredMass: string;
  readonly massReward: string;
  readonly matterReward: string;
  readonly spawnWeight: number;
  readonly visualScale: number;
  readonly assetKey: string;
  readonly absorptionProfile: string;
  readonly rarity: string;
}

export interface ContentDefinitions {
  readonly scaleBands: readonly ScaleBandDefinition[];
  readonly objects: readonly MatterObjectDefinition[];
}

export interface ContentValidationOptions {
  /** When available, checks each object asset key against the shipped asset catalog. */
  readonly availableAssetKeys?: ReadonlySet<string>;
}

export interface ContentValidationIssue {
  readonly path: string;
  readonly code: string;
  readonly message: string;
}

export class ContentValidationError extends Error {
  readonly issues: readonly ContentValidationIssue[];

  constructor(issues: readonly ContentValidationIssue[]) {
    super(
      issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'),
    );
    this.name = 'ContentValidationError';
    this.issues = Object.freeze([...issues]);
  }
}

/**
 * Validates renderer-independent content definitions and returns frozen copies.
 * Economic magnitudes stay serialized as strings until simulation code needs them.
 */
export function validateContentDefinitions(
  input: unknown,
  options: ContentValidationOptions = {},
): ContentDefinitions {
  const issues: ContentValidationIssue[] = [];

  if (!isRecord(input)) {
    throw new ContentValidationError([
      { path: '$', code: 'invalid_root', message: 'Expected an object containing scaleBands and objects.' },
    ]);
  }

  const rawScaleBands = input.scaleBands;
  const rawObjects = input.objects;

  if (!Array.isArray(rawScaleBands)) {
    issues.push({ path: 'scaleBands', code: 'expected_array', message: 'Expected an array of scale bands.' });
  } else if (rawScaleBands.length === 0) {
    issues.push({ path: 'scaleBands', code: 'empty_scale_bands', message: 'At least one scale band is required.' });
  }

  if (!Array.isArray(rawObjects)) {
    issues.push({ path: 'objects', code: 'expected_array', message: 'Expected an array of matter objects.' });
  }

  const scaleBands: ScaleBandDefinition[] = [];
  const bandIds = new Set<string>();
  const bandOrders = new Set<number>();
  let previousBandOrder = 0;

  if (Array.isArray(rawScaleBands)) {
    rawScaleBands.forEach((rawBand: unknown, index: number) => {
      const path = `scaleBands[${index}]`;

      if (!isRecord(rawBand)) {
        issues.push({ path, code: 'expected_object', message: 'Expected a scale-band object.' });
        return;
      }

      const id = readIdentifier(rawBand.id, `${path}.id`, issues);
      const name = readText(rawBand.name, `${path}.name`, issues);
      const order = readPositiveInteger(rawBand.order, `${path}.order`, issues);

      if (id !== undefined && bandIds.has(id)) {
        issues.push({ path: `${path}.id`, code: 'duplicate_scale_band_id', message: `Scale-band ID "${id}" is duplicated.` });
      }

      if (id !== undefined) bandIds.add(id);

      if (order !== undefined) {
        if (bandOrders.has(order)) {
          issues.push({ path: `${path}.order`, code: 'duplicate_scale_band_order', message: `Scale-band order ${order} is duplicated.` });
        }
        if (order <= previousBandOrder) {
          issues.push({ path: `${path}.order`, code: 'non_increasing_scale_band_order', message: 'Scale bands must be listed in strictly increasing order.' });
        }
        bandOrders.add(order);
        previousBandOrder = order;
      }

      if (id !== undefined && name !== undefined && order !== undefined) {
        scaleBands.push(Object.freeze({ id, name, order }));
      }
    });
  }

  const objects: MatterObjectDefinition[] = [];
  const objectIds = new Set<string>();

  if (Array.isArray(rawObjects)) {
    rawObjects.forEach((rawObject: unknown, index: number) => {
      const path = `objects[${index}]`;

      if (!isRecord(rawObject)) {
        issues.push({ path, code: 'expected_object', message: 'Expected a matter-object definition.' });
        return;
      }

      const id = readIdentifier(rawObject.id, `${path}.id`, issues);
      const name = readText(rawObject.name, `${path}.name`, issues);
      const family = readIdentifier(rawObject.family, `${path}.family`, issues);
      const scaleBand = readIdentifier(rawObject.scaleBand, `${path}.scaleBand`, issues);
      const requiredMass = readGameNumber(rawObject.requiredMass, `${path}.requiredMass`, issues);
      const massReward = readGameNumber(rawObject.massReward, `${path}.massReward`, issues);
      const matterReward = readGameNumber(rawObject.matterReward, `${path}.matterReward`, issues);
      const spawnWeight = readPositiveFiniteNumber(rawObject.spawnWeight, `${path}.spawnWeight`, issues);
      const visualScale = readPositiveFiniteNumber(rawObject.visualScale, `${path}.visualScale`, issues);
      const assetKey = readIdentifier(rawObject.assetKey, `${path}.assetKey`, issues);
      const absorptionProfile = readIdentifier(rawObject.absorptionProfile, `${path}.absorptionProfile`, issues);
      const rarity = readIdentifier(rawObject.rarity, `${path}.rarity`, issues);

      if (id !== undefined && objectIds.has(id)) {
        issues.push({ path: `${path}.id`, code: 'duplicate_object_id', message: `Object ID "${id}" is duplicated.` });
      }

      if (id !== undefined) objectIds.add(id);

      if (scaleBand !== undefined && !bandIds.has(scaleBand)) {
        issues.push({ path: `${path}.scaleBand`, code: 'unknown_scale_band', message: `Scale band "${scaleBand}" is not defined.` });
      }

      if (assetKey !== undefined && options.availableAssetKeys !== undefined && !options.availableAssetKeys.has(assetKey)) {
        issues.push({ path: `${path}.assetKey`, code: 'missing_asset_reference', message: `Asset key "${assetKey}" is not present in the supplied asset catalog.` });
      }

      if (
        id !== undefined &&
        name !== undefined &&
        family !== undefined &&
        scaleBand !== undefined &&
        requiredMass !== undefined &&
        massReward !== undefined &&
        matterReward !== undefined &&
        spawnWeight !== undefined &&
        visualScale !== undefined &&
        assetKey !== undefined &&
        absorptionProfile !== undefined &&
        rarity !== undefined
      ) {
        objects.push(
          Object.freeze({
            id,
            name,
            family,
            scaleBand,
            requiredMass,
            massReward,
            matterReward,
            spawnWeight,
            visualScale,
            assetKey,
            absorptionProfile,
            rarity,
          }),
        );
      }
    });
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  return Object.freeze({
    scaleBands: Object.freeze(scaleBands),
    objects: Object.freeze(objects),
  });
}

function readIdentifier(
  value: unknown,
  path: string,
  issues: ContentValidationIssue[],
): string | undefined {
  if (typeof value !== 'string' || !/^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/.test(value)) {
    issues.push({
      path,
      code: 'invalid_identifier',
      message: 'Expected a lowercase identifier using letters, numbers, hyphens, or underscores.',
    });
    return undefined;
  }

  return value;
}

function readText(
  value: unknown,
  path: string,
  issues: ContentValidationIssue[],
): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push({ path, code: 'required_text', message: 'Expected a non-empty string.' });
    return undefined;
  }

  return value;
}

function readPositiveInteger(
  value: unknown,
  path: string,
  issues: ContentValidationIssue[],
): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    issues.push({ path, code: 'invalid_order', message: 'Expected a positive one-based integer.' });
    return undefined;
  }

  return value;
}

function readPositiveFiniteNumber(
  value: unknown,
  path: string,
  issues: ContentValidationIssue[],
): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    issues.push({ path, code: 'invalid_positive_number', message: 'Expected a finite number greater than zero.' });
    return undefined;
  }

  return value;
}

function readGameNumber(
  value: unknown,
  path: string,
  issues: ContentValidationIssue[],
): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push({ path, code: 'invalid_game_number', message: 'Expected a serialized GameNumber string.' });
    return undefined;
  }

  try {
    const parsed = GameNumber.from(value);
    if (parsed.lessThan(0)) {
      issues.push({ path, code: 'negative_game_number', message: 'Economic values cannot be negative.' });
      return undefined;
    }
  } catch {
    issues.push({ path, code: 'invalid_game_number', message: 'Value is not a finite GameNumber.' });
    return undefined;
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
