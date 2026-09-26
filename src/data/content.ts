import { validateContentDefinitions } from '../core/content/content-definitions';
import { MATTER_OBJECTS } from './matter-objects';
import { SCALE_BANDS } from './scale-bands';

/** Validated renderer-independent content catalog for the simulation. */
export const CONTENT_DEFINITIONS = validateContentDefinitions({
  scaleBands: SCALE_BANDS,
  objects: MATTER_OBJECTS,
});
