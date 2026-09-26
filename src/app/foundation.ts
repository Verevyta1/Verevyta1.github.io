import { UPGRADE_DEFINITIONS } from '../data/upgrades';

export const FOUNDATION_TITLE = 'Project Scale';

export function createFoundationMarkup(): string {
  const upgradeCards = UPGRADE_DEFINITIONS.map((upgrade) =>
    [
      '      <article class="upgrade-card" aria-labelledby="upgrade-title-' + upgrade.id + '>',
      '        <div class="upgrade-card-heading"><h3 id="upgrade-title-' +
        upgrade.id +
        '">' +
        upgrade.name +
        '</h3><span class="upgrade-level">Level <output id="upgrade-level-' +
        upgrade.id +
        '">0</output></span></div>',
      '        <p>' + upgrade.description + '</p>',
      '        <div class="upgrade-cost"><span>Next cost</span><output id="upgrade-cost-' +
        upgrade.id +
        '">0</output><span>Matter</span></div>',
      '        <button class="upgrade-buy" id="upgrade-buy-' +
        upgrade.id +
        '" data-upgrade-buy="' +
        upgrade.id +
        '" type="button" aria-label="Buy one ' +
        upgrade.name +
        ' upgrade">Buy 1</button>',
      '      </article>',
    ].join('\n'),
  ).join('\n');

  return [
    '<main class="foundation-shell" aria-labelledby="foundation-title">',
    '  <header class="game-header">',
    '    <div class="game-brand">',
    '      <p class="eyebrow">Project Scale · playable greybox</p>',
    '      <h1 id="foundation-title">' + FOUNDATION_TITLE + '</h1>',
    '      <p class="game-subtitle">A Matter Core growth experiment</p>',
    '    </div>',
    '    <div class="resource-grid" aria-label="Run resources">',
    '      <section class="resource-card" aria-labelledby="mass-label">',
    '        <div class="resource-heading"><span class="resource-mark mass-mark" aria-hidden="true"></span><h2 id="mass-label">Mass</h2></div>',
    '        <output id="resource-mass" aria-live="polite">0</output>',
    '        <p>Physical progression · never spent</p>',
    '      </section>',
    '      <section class="resource-card" aria-labelledby="matter-label">',
    '        <div class="resource-heading"><span class="resource-mark matter-mark" aria-hidden="true"></span><h2 id="matter-label">Matter</h2></div>',
    '        <output id="resource-matter" aria-live="polite">0</output>',
    '        <p>Temporary run currency</p>',
    '      </section>',
    '    </div>',
    '  </header>',
    '  <section class="game-panel" aria-label="Matter Core playfield">',
    '    <div class="playfield-heading">',
    '      <span class="field-tag">PRIMORDIAL FIELD</span>',
    '      <span class="field-hint">The Core stays fixed. Matter comes to it.</span>',
    '    </div>',
    '    <div class="foundation-playfield" role="img" aria-label="Matter objects drift around a stationary central Matter Core and are absorbed when eligible">',
    '      <div class="foundation-canvas" id="game-canvas" aria-hidden="true"></div>',
    '      <span class="core-caption" aria-hidden="true">MATTER CORE</span>',
    '      <span class="foundation-playfield-caption" aria-hidden="true">GREYBOX · TUNING VALUES ARE PROVISIONAL</span>',
    '    </div>',
    '    <div class="playfield-footer">',
    '      <div class="instruction-block"><strong>Automatic absorption</strong><span>Objects that meet the Core’s Mass requirement are drawn in without clicking.</span></div>',
    '      <p id="save-status" class="save-status" role="status" aria-live="polite">Progress saves in this browser.</p>',
    '    </div>',
    '  </section>',
    '  <section class="upgrade-panel" aria-labelledby="upgrade-heading">',
    '    <div class="upgrade-panel-heading"><div><p class="eyebrow">Temporary upgrades</p><h2 id="upgrade-heading">Shape the Core</h2></div><p>Spend Matter to change how the Core gathers and compresses matter.</p></div>',
    '    <div class="upgrade-grid">',
    upgradeCards,
    '    </div>',
    '    <p class="upgrade-status" id="upgrade-status" role="status" aria-live="polite">Matter upgrades improve the current run.</p>',
    '  </section>',
    '  <section class="command-panel" aria-label="Active ability">',
    '    <div class="command-copy"><p class="eyebrow">Active ability</p><h2>Gravity Pulse</h2><p id="pulse-description">Accelerates eligible matter attraction for a short burst. It does not unlock ineligible objects.</p></div>',
    '    <div class="command-action"><button id="gravity-pulse" type="button" aria-describedby="pulse-description pulse-state" aria-pressed="false"><span>Gravity Pulse</span><span class="button-state" id="pulse-state">Ready</span></button><span class="key-hint">One measured burst · cooldown between pulses</span></div>',
    '  </section>',
    '  <p class="control-note">No movement controls. Watch the world orbit and contract around the stationary Core.</p>',
    '</main>',
  ].join('\n');
}
