import { describe, expect, it } from 'vitest';

import { createFoundationMarkup, FOUNDATION_TITLE } from './foundation';

describe('foundation app', () => {
  it('renders the product title and Matter Core playfield', () => {
    const markup = createFoundationMarkup();

    expect(FOUNDATION_TITLE).toBe('Project Scale');
    expect(markup).toContain('<h1 id="foundation-title">Project Scale</h1>');
    expect(markup).toContain('id="game-canvas"');
    expect(markup).toContain(
      'aria-label="Matter objects drift around a stationary central Matter Core and are absorbed when eligible"',
    );
  });

  it('provides Mass, Matter, and the accessible Gravity Pulse command', () => {
    const markup = createFoundationMarkup();

    expect(markup).toContain('id="resource-mass"');
    expect(markup).toContain('id="resource-matter"');
    expect(markup).toContain('id="gravity-pulse"');
    expect(markup).toContain('id="pulse-state"');
    expect(markup).toContain('No movement controls.');
  });
});
