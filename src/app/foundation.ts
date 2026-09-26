export const FOUNDATION_TITLE = 'Project Scale';

export function createFoundationMarkup(): string {
  return [
    '<main class="foundation-shell" aria-labelledby="foundation-title">',
    '  <section class="foundation-card">',
    '    <p class="eyebrow">Technical foundation</p>',
    '    <h1 id="foundation-title">' + FOUNDATION_TITLE + '</h1>',
    '    <p>The browser project is running. Gameplay will be added in small, tested slices.</p>',
    '    <div class="foundation-playfield" role="img" aria-label="Matter Core placeholder preview rendered with Phaser">',
    '      <div class="foundation-canvas" id="game-canvas" aria-hidden="true"></div>',
    '      <span class="foundation-playfield-caption" aria-hidden="true">Phaser 4 placeholder view</span>',
    '    </div>',
    '  </section>',
    '</main>',
  ].join('\n');
}
