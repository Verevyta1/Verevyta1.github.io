import { createLauncherMarkup } from './app/launcher';
import { formatResourceAmount } from './app/resource-format';
import {
  activateRocketSlam,
  advanceLaunchGame,
  beginLaunchAim,
  buyLaunchUpgrade,
  calculateLaunchUpgradeCost,
  createInitialLaunchGameState,
  MAX_UPGRADE_LEVEL,
  NEXUS_DISTANCE,
  parseLaunchSave,
  releaseTeemo,
  serializeLaunchSave,
  type LaunchGameState,
} from './core/launch/launch-game';
import { GameNumber } from './core/numbers/game-number';
import { LAUNCH_UPGRADES } from './data/launch-upgrades';
import { createLaunchGame } from './game/scenes/launch-scene';
import { LocalPlatform } from './platform/local-platform';
import './styles.css';

const SAVE_KEY = 'teemo-nexus-launch-save-v1';
const appElement = document.querySelector<HTMLDivElement>('#app');
if (!appElement) {
  throw new Error('Application root #app was not found.');
}
const app: HTMLDivElement = appElement;
app.innerHTML = createLauncherMarkup();

function need<T extends Element>(selector: string): T {
  const element = app.querySelector<T>(selector);
  if (!element) {
    throw new Error('The game interface is missing ' + selector + '.');
  }
  return element;
}

const canvasHost = need<HTMLDivElement>('#game-canvas');
const goldOutput = need<HTMLOutputElement>('#gold-total');
const bestOutput = need<HTMLOutputElement>('#best-distance');
const minionOutput = need<HTMLOutputElement>('#minion-total');
const distanceOutput = need<HTMLOutputElement>('#run-distance');
const progressFill = need<HTMLSpanElement>('#goal-progress-fill');
const statusOutput = need<HTMLParagraphElement>('#run-status');
const remainingOutput = need<HTMLOutputElement>('#distance-remaining');
const slamButton = need<HTMLButtonElement>('#slam-button');
const slamState = need<HTMLSpanElement>('#slam-state');
const controls = LAUNCH_UPGRADES.map((definition) => ({
  definition,
  level: need<HTMLOutputElement>('#upgrade-level-' + definition.id),
  cost: need<HTMLOutputElement>('#upgrade-cost-' + definition.id),
  button: need<HTMLButtonElement>('#upgrade-buy-' + definition.id),
}));

let state: LaunchGameState = createInitialLaunchGameState();
let statusMessage = 'Pull Teemo back at any angle, then release to throw.';
let saveTimer: number | undefined;
let lastHudUpdate = -100;

try {
  const saved = window.localStorage.getItem(SAVE_KEY);
  if (saved) {
    state = parseLaunchSave(saved);
    statusMessage = 'Scout progress restored from this browser.';
  }
} catch {
  statusMessage = 'Saved progress could not be read. This game starts fresh.';
}

function renderHud(): void {
  goldOutput.textContent = formatResourceAmount(GameNumber.from(state.gold));
  bestOutput.textContent = Math.floor(state.bestDistance).toLocaleString() + ' m';
  minionOutput.textContent = String(state.run.smashedMinions);
  distanceOutput.textContent = Math.floor(state.run.distance).toLocaleString();
  progressFill.style.width = Math.min(100, (state.run.distance / 5_000) * 100) + '%';
  remainingOutput.textContent =
    Math.max(0, NEXUS_DISTANCE - Math.floor(state.bestDistance)).toLocaleString() + ' m';

  const flying = state.run.phase === 'flying';
  slamButton.disabled = !flying || state.run.slamCharges <= 0 || state.run.height <= 0;
  slamState.textContent = state.run.slamCharges + ' left';

  statusOutput.textContent =
    state.run.phase === 'won'
      ? 'Victory! Teemo reached the Nexus. Drag him back to launch again.'
      : state.run.phase === 'finished'
        ? 'Run complete: ' +
          Math.floor(state.run.distance).toLocaleString() +
          ' m. Gold earned: ' +
          state.run.goldEarned +
          '. Drag Teemo back to the sling for another attempt.'
        : state.run.phase === 'aiming'
          ? 'Pull farther for power; drag up or down to change the launch angle.'
          : flying
            ? 'In flight! Smash minions for gold. Click or tap the lane to Rocket Slam.'
            : statusMessage;

  for (const control of controls) {
    const level = state.upgrades[control.definition.id];
    const masteredTrack = level >= MAX_UPGRADE_LEVEL;
    const cost = calculateLaunchUpgradeCost(control.definition, level);
    control.level.textContent = String(level);
    control.cost.textContent = masteredTrack ? 'MAXED' : formatResourceAmount(cost);
    control.button.textContent = masteredTrack ? 'Mastered' : 'Buy upgrade';
    control.button.disabled =
      flying ||
      state.run.phase === 'aiming' ||
      masteredTrack ||
      GameNumber.from(state.gold).lessThan(cost);
  }
}

function saveProgress(): void {
  try {
    window.localStorage.setItem(SAVE_KEY, serializeLaunchSave(state));
  } catch {
    statusMessage = 'Browser storage is unavailable; gold may reset when the page closes.';
  }
  renderHud();
}

function scheduleSave(): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveProgress, 450);
}

function useRocketSlam(): void {
  const next = activateRocketSlam(state);
  if (next === state) {
    return;
  }
  state = next;
  statusMessage = 'Rocket Slam! Dive into the next minion wave.';
  renderHud();
}

slamButton.addEventListener('click', useRocketSlam);

controls.forEach(({ definition, button }) => {
  button.addEventListener('click', () => {
    const purchase = buyLaunchUpgrade(state, definition.id, LAUNCH_UPGRADES);
    if (!purchase.purchased) {
      statusMessage = 'Not enough gold for ' + definition.name + '.';
      renderHud();
      return;
    }

    state = purchase.state;
    statusMessage = definition.name + ' upgraded to level ' + state.upgrades[definition.id] + '.';
    renderHud();
    scheduleSave();
  });
});

async function startGame(): Promise<void> {
  const platform = new LocalPlatform();
  await platform.initialize();
  platform.gameplayStart();
  renderHud();

  createLaunchGame(canvasHost, {
    beginAim: () => {
      const next = beginLaunchAim(state);
      if (next === state) {
        return false;
      }
      state = next;
      renderHud();
      return state.run.phase === 'aiming';
    },
    throw: (pullX, pullY) => {
      state = releaseTeemo(state, pullX, pullY);
      statusMessage =
        state.run.phase === 'flying'
          ? 'Teemo is off! Smash the lane minions for gold.'
          : 'Pull Teemo a little farther before releasing.';
      renderHud();
    },
    slam: useRocketSlam,
    advance: (deltaMs) => {
      const frame = advanceLaunchGame(state, deltaMs);
      state = frame.state;

      if (frame.smashed.length > 0) {
        const reward = frame.smashed.reduce((sum, hit) => sum + hit.gold, 0);
        statusMessage = 'Minion smashed! +' + reward + ' gold.';
        scheduleSave();
      }
      if (frame.runEnded) {
        scheduleSave();
      }
      if (
        state.run.elapsedMs - lastHudUpdate >= 100 ||
        frame.runEnded ||
        frame.smashed.length > 0
      ) {
        renderHud();
        lastHudUpdate = state.run.elapsedMs;
      }
      return frame;
    },
    state: () => state,
  });
}

window.addEventListener('pagehide', () => {
  window.clearTimeout(saveTimer);
  saveProgress();
});

void startGame().catch((error: unknown) => {
  console.error(error);
  statusOutput.textContent = 'The game could not start. Check the browser console for details.';
});
