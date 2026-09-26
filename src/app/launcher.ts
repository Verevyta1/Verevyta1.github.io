import { LAUNCH_UPGRADES } from '../data/launch-upgrades';

export const GAME_TITLE = 'Teemo: Nexus Launch';

export function createLauncherMarkup(): string {
  const upgrades = LAUNCH_UPGRADES.map((upgrade) =>
    [
      '<article class="upgrade-card" aria-labelledby="upgrade-title-' + upgrade.id + '">',
      '<div class="upgrade-heading"><h3 id="upgrade-title-' +
        upgrade.id +
        '">' +
        upgrade.name +
        '</h3><span>Level <output id="upgrade-level-' +
        upgrade.id +
        '\">0</output></span></div>',
      '<p>' + upgrade.description + '</p>',
      '<div class="upgrade-cost"><output id="upgrade-cost-' +
        upgrade.id +
        '">0</output><span>gold</span></div>',
      '<button class="upgrade-buy" id="upgrade-buy-' +
        upgrade.id +
        '" type="button" aria-label="Buy one ' +
        upgrade.name +
        '">Buy Upgrade</button>',
      '</article>',
    ].join('\n'),
  ).join('\n');

  return [
    '<main class="game-shell" aria-labelledby="game-title">',
    '<header class="topbar">',
    '<div class="brand"><p class="eyebrow">A Bandle Scout Launch Run</p>',
    '<h1 id="game-title">' + GAME_TITLE + '</h1>',
    '<p>Smash through the lane. Reach the enemy Nexus.</p></div>',
    '<div class="stats" aria-label="Run resources">',
    '<section class="stat"><span>Gold</span><output id="gold-total" aria-live="polite">0</output></section>',
    '<section class="stat"><span>Best distance</span><output id="best-distance" aria-live="polite">0 m</output></section>',
    '<section class="stat"><span>Minions smashed</span><output id="minion-total" aria-live="polite">0</output></section>',
    '</div></header>',
    '<section class="game-frame" aria-label="Teemo launch game">',
    '<div class="game-stage-heading"><span>SUMMONER’S RIFT · BLUE LANE</span>',
    '<span><output id="run-distance">0</output> / 5,000 m to Nexus</span></div>',
    '<div class="game-playfield">',
    '<div id="game-canvas" role="img" aria-label="Cartoon Teemo launches down a lane and smashes minions toward the Nexus"></div>',
    '<div class="goal-progress" aria-hidden="true"><span id="goal-progress-fill"></span></div>',
    '</div>',
    '<div class="game-actions">',
    '<p id="run-status" role="status" aria-live="polite">Launch Teemo and time your Noxious Boost through the minion waves.</p>',
    '<div class="action-buttons">',
    '<button id="launch-button" type="button">Launch Teemo</button>',
    '<button id="boost-button" type="button" disabled>Noxious Boost <span id="boost-state">Ready</span></button>',
    '</div></div></section>',
    '<section class="upgrade-panel" aria-labelledby="upgrade-heading">',
    '<div class="section-title"><div><p class="eyebrow">Spend gold between runs</p>',
    '<h2 id="upgrade-heading">Prepare the next launch</h2></div>',
    '<p>Every smashed minion drops gold for your next upgrade.</p></div>',
    '<div class="upgrade-grid">',
    upgrades,
    '</div></section>',
    '<p class="control-note">Launch, then tap the playfield or Noxious Boost for a mushroom-powered shove.</p>',
    '</main>',
  ].join('\n');
}
