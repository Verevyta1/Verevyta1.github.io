import { createFoundationMarkup } from './app/foundation';
import { formatResourceAmount } from './app/resource-format';
import { purchaseUpgrade } from './core/economy/purchase-upgrade';
import { calculateUpgradeCost } from './core/economy/upgrades';
import type { UpgradeId } from './core/economy/upgrades';
import {
  activateGravityPulse,
  advanceGreyboxSimulation,
  createInitialGreyboxSimulationState,
} from './core/simulation/greybox-loop';
import { parseSave, restoreGameState, serializeSave } from './core/save/save-schema';
import { CONTENT_DEFINITIONS } from './data/content';
import { UPGRADE_DEFINITIONS } from './data/upgrades';
import { createMatterCoreGame } from './game/scenes/foundation-scene';
import { LocalPlatform } from './platform/local-platform';
import './styles.css';

const SAVE_KEY = 'project-scale-save-v1';
const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Application root #app was not found.');
}

app.innerHTML = createFoundationMarkup();

function requireElement<T extends Element>(root: Element, selector: string): T {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error('The Matter Core interface is missing ' + selector + '.');
  }

  return element;
}

const canvasHost = requireElement<HTMLDivElement>(app, '#game-canvas');
const massOutput = requireElement<HTMLOutputElement>(app, '#resource-mass');
const matterOutput = requireElement<HTMLOutputElement>(app, '#resource-matter');
const pulseButton = requireElement<HTMLButtonElement>(app, '#gravity-pulse');
const pulseState = requireElement<HTMLSpanElement>(app, '#pulse-state');
const saveStatus = requireElement<HTMLParagraphElement>(app, '#save-status');
const upgradeStatus = requireElement<HTMLParagraphElement>(app, '#upgrade-status');
const upgradeControls = UPGRADE_DEFINITIONS.map((definition) => ({
  definition,
  level: requireElement<HTMLOutputElement>(app, '#upgrade-level-' + definition.id),
  cost: requireElement<HTMLOutputElement>(app, '#upgrade-cost-' + definition.id),
  button: requireElement<HTMLButtonElement>(app, '#upgrade-buy-' + definition.id),
}));

let simulation = createInitialGreyboxSimulationState();
let createdAt = Date.now();
let saveMessage = 'Progress saves in this browser.';
let upgradeMessage = 'Matter upgrades improve the current run.';

try {
  const serialized = window.localStorage.getItem(SAVE_KEY);

  if (serialized) {
    const save = parseSave(serialized);
    simulation = createInitialGreyboxSimulationState(restoreGameState(save));
    createdAt = save.createdAt;
    saveMessage = 'Local Mass and Matter restored.';
  }
} catch {
  saveMessage = 'Saved progress could not be read. This browser session starts fresh.';
}

let saveTimer: number | undefined;
let lastHudUpdateMs = -100;

function renderHud(): void {
  massOutput.textContent = formatResourceAmount(simulation.game.run.mass);
  matterOutput.textContent = formatResourceAmount(simulation.game.run.matter);

  const active = simulation.gravityPulseRemainingMs > 0;
  const cooldown = simulation.gravityPulseCooldownMs;
  pulseButton.disabled = cooldown > 0;
  pulseButton.setAttribute('aria-pressed', String(active));
  pulseState.textContent = active
    ? 'Active'
    : cooldown > 0
      ? Math.ceil(cooldown / 1000) + 's'
      : 'Ready';

  for (const control of upgradeControls) {
    const level = simulation.game.upgrades[control.definition.id];
    const cost = calculateUpgradeCost(control.definition, level);
    control.level.textContent = String(level);
    control.cost.textContent = formatResourceAmount(cost);
    control.button.disabled = simulation.game.run.matter.lessThan(cost);
  }

  upgradeStatus.textContent = upgradeMessage;
  saveStatus.textContent = saveMessage;
}

function persistProgress(): void {
  try {
    window.localStorage.setItem(
      SAVE_KEY,
      serializeSave(simulation.game, { createdAt, lastSavedAt: Date.now() }),
    );
  } catch {
    saveMessage = 'Browser storage is unavailable; this run will reset when the page closes.';
    saveStatus.textContent = saveMessage;
  }
}

function scheduleSave(): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(persistProgress, 700);
}

function advanceSimulation(deltaMs: number) {
  const frame = advanceGreyboxSimulation(simulation, deltaMs, CONTENT_DEFINITIONS.objects);
  simulation = frame.state;

  if (frame.absorbedObjects.length > 0) {
    for (const absorption of frame.absorbedObjects) {
      saveMessage =
        'Absorbed ' + absorption.definitionId.replaceAll('-', ' ') + '. Progress saved locally.';
    }
    scheduleSave();
  }

  if (simulation.elapsedMs - lastHudUpdateMs >= 100 || frame.absorbedObjects.length > 0) {
    renderHud();
    lastHudUpdateMs = simulation.elapsedMs;
  }

  return frame;
}

function activatePulse(): void {
  const next = activateGravityPulse(simulation);

  if (next === simulation) {
    return;
  }

  simulation = next;
  saveMessage = 'Gravity Pulse is accelerating eligible matter.';
  renderHud();
}

function buyUpgrade(id: UpgradeId): void {
  const purchase = purchaseUpgrade(simulation.game, id, UPGRADE_DEFINITIONS);

  if (!purchase.purchased) {
    const definition = UPGRADE_DEFINITIONS.find((candidate) => candidate.id === id);
    upgradeMessage = 'Not enough Matter for ' + (definition?.name ?? 'this upgrade') + '.';
    renderHud();
    return;
  }

  simulation = Object.freeze({ ...simulation, game: purchase.game });
  const definition = UPGRADE_DEFINITIONS.find((candidate) => candidate.id === id);
  upgradeMessage =
    (definition?.name ?? 'Upgrade') + ' raised to level ' + simulation.game.upgrades[id] + '.';
  saveMessage = 'Upgrade purchase saved locally.';
  renderHud();
  scheduleSave();
}

upgradeControls.forEach(({ definition, button }) => {
  button.addEventListener('click', () => buyUpgrade(definition.id));
});

pulseButton.addEventListener('click', activatePulse);
window.addEventListener('pagehide', () => {
  window.clearTimeout(saveTimer);
  persistProgress();
});

async function startGame(): Promise<void> {
  const platform = new LocalPlatform();
  await platform.initialize();
  platform.gameplayStart();
  renderHud();

  createMatterCoreGame(canvasHost, { advance: advanceSimulation }, CONTENT_DEFINITIONS.objects);
}

void startGame().catch((error: unknown) => {
  console.error(error);
  saveMessage = 'The local game could not start. Check the browser console for details.';
  saveStatus.textContent = saveMessage;
});
