import { describe, expect, it } from 'vitest';

import { createFoundationMarkup, FOUNDATION_TITLE } from './foundation';

describe('foundation app', () => {
  it('exposes the project title in the initial markup', () => {
    const markup = createFoundationMarkup();

    expect(FOUNDATION_TITLE).toBe('Project Scale');
    expect(markup).toContain(`<h1 id="foundation-title">${FOUNDATION_TITLE}</h1>`);
  });

  it('keeps the initial screen explicitly non-gameplay', () => {
    expect(createFoundationMarkup()).toContain('Gameplay will be added in small, tested slices.');
  });

  it('provides an accessible mount for the Phaser foundation view', () => {
    const markup = createFoundationMarkup();

    expect(markup).toContain('id="game-canvas"');
    expect(markup).toContain('aria-label="Matter Core placeholder preview rendered with Phaser"');
  });
});
