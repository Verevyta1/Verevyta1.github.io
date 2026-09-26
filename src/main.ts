import { createLauncherMarkup } from "./app/launcher";
import { formatResourceAmount } from "./app/resource-format";
import {
  activateMushroomBoost,
  advanceLaunchGame,
  buyLaunchUpgrade,
  calculateLaunchUpgradeCost,
  createInitialLaunchGameState,
  parseLaunchSave,
  serializeLaunchSave,
  startLaunchRun,
  type LaunchGameState,
} from "./core/launch/launch-game";
import { GameNumber } from "./core/numbers/game-number";
import { LAUNCH_UPGRADES } from "./data/launch-upgrades";
import { createLaunchGame } from "./game/scenes/launch-scene";
import { LocalPlatform } from "./platform/local-platform";
import "./styles.css";

const SAVE_KEY = "teemo-nexus-launch-save-v1";
const appElement = document.querySelector<HTMLDivElement>("#app");
if (!appElement) throw new Error("Application root #app was not found.");
const app: HTMLDivElement = appElement;
app.innerHTML = createLauncherMarkup();

function need<T extends Element>(selector: string): T {
  const element = app.querySelector<T>(selector);
  if (!element) throw new Error("The game interface is missing " + selector + ".");
  return element;
}

const canvasHost = need<HTMLDivElement>("#game-canvas");
const goldOutput = need<HTMLOutputElement>("#gold-total");
const bestOutput = need<HTMLOutputElement>("#best-distance");
const minionOutput = need<HTMLOutputElement>("#minion-total");
const distanceOutput = need<HTMLOutputElement>("#run-distance");
const progressFill = need<HTMLSpanElement>("#goal-progress-fill");
const statusOutput = need<HTMLParagraphElement>("#run-status");
const launchButton = need<HTMLButtonElement>("#launch-button");
const boostButton = need<HTMLButtonElement>("#boost-button");
const boostState = need<HTMLSpanElement>("#boost-state");
const controls = LAUNCH_UPGRADES.map((definition) => ({
  definition,
  level: need<HTMLOutputElement>("#upgrade-level-" + definition.id),
  cost: need<HTMLOutputElement>("#upgrade-cost-" + definition.id),
  button: need<HTMLButtonElement>("#upgrade-buy-" + definition.id),
}));

let state: LaunchGameState = createInitialLaunchGameState();
let statusMessage = "Launch Teemo to start the run.";
let saveTimer: number | undefined;
let lastHudUpdate = -100;
try {
  const saved = window.localStorage.getItem(SAVE_KEY);
  if (saved) {
    state = parseLaunchSave(saved);
    statusMessage = "Scout progress restored from this browser.";
  }
} catch {
  statusMessage = "Saved progress could not be read. This game starts fresh.";
}

function renderHud(): void {
  goldOutput.textContent = formatResourceAmount(GameNumber.from(state.gold));
  bestOutput.textContent = Math.floor(state.bestDistance).toLocaleString() + " m";
  minionOutput.textContent = String(state.run.smashedMinions);
  distanceOutput.textContent = Math.floor(state.run.distance).toLocaleString();
  progressFill.style.width = Math.min(100, state.run.distance / 50) + "%";
  const flying = state.run.phase === "flying";
  launchButton.disabled = flying || state.run.phase === "won";
  launchButton.textContent = state.run.phase === "ready" ? "Launch Teemo" :
    state.run.phase === "flying" ? "Teemo is flying…" :
      state.run.phase === "won" ? "Nexus destroyed!" : "Run it back";
  boostButton.disabled = !flying || state.run.boostCooldownMs > 0;
  boostState.textContent = state.run.boostCooldownMs > 0
    ? Math.ceil(state.run.boostCooldownMs / 1000) + "s" : "Ready";

  statusOutput.textContent = state.run.phase === "won"
    ? "Victory! Teemo reached the Nexus."
    : state.run.phase === "finished"
      ? "Run complete: " + Math.floor(state.run.distance).toLocaleString() + " m. Gold earned: " + state.run.goldEarned + ". Upgrade and launch again."
      : flying
        ? "In flight! Smash minions for gold. Tap the lane or Noxious Boost for a dash."
        : statusMessage;

  for (const control of controls) {
    const level = state.upgrades[control.definition.id];
    const cost = calculateLaunchUpgradeCost(control.definition, level);
    control.level.textContent = String(level);
    control.cost.textContent = formatResourceAmount(cost);
    control.button.disabled = flying || state.run.phase === "won" || GameNumber.from(state.gold).lessThan(cost);
  }
}

function saveProgress(): void {
  try {
    window.localStorage.setItem(SAVE_KEY, serializeLaunchSave(state));
  } catch {
    statusMessage = "Browser storage is unavailable; gold may reset when the page closes.";
  }
  renderHud();
}
function scheduleSave(): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveProgress, 450);
}
function useBoost(): void {
  state = activateMushroomBoost(state);
  statusMessage = "Noxious Boost! Teemo surges forward.";
  renderHud();
}

launchButton.addEventListener("click", () => {
  state = startLaunchRun(state);
  statusMessage = "Teemo is off!";
  renderHud();
});
boostButton.addEventListener("click", useBoost);
controls.forEach(({ definition, button }) => {
  button.addEventListener("click", () => {
    const purchase = buyLaunchUpgrade(state, definition.id, LAUNCH_UPGRADES);
    if (!purchase.purchased) {
      statusMessage = "Not enough gold for " + definition.name + ".";
      renderHud();
      return;
    }
    state = purchase.state;
    statusMessage = definition.name + " upgraded to level " + state.upgrades[definition.id] + ".";
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
    advance: (deltaMs) => {
      const frame = advanceLaunchGame(state, deltaMs);
      state = frame.state;
      if (frame.smashed.length > 0) {
        const reward = frame.smashed.reduce((sum, hit) => sum + hit.gold, 0);
        statusMessage = "Minion smashed! +" + reward + " gold.";
        scheduleSave();
      }
      if (frame.runEnded) scheduleSave();
      if (state.run.elapsedMs - lastHudUpdate >= 100 || frame.runEnded || frame.smashed.length > 0) {
        renderHud();
        lastHudUpdate = state.run.elapsedMs;
      }
      return frame;
    },
    boost: useBoost,
    state: () => state,
  });
}

window.addEventListener("pagehide", () => {
  window.clearTimeout(saveTimer);
  saveProgress();
});
void startGame().catch((error: unknown) => {
  console.error(error);
  statusOutput.textContent = "The game could not start. Check the browser console for details.";
});
