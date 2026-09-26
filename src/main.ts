import { createFoundationMarkup } from './app/foundation';
import { createFoundationGame } from './game/scenes/foundation-scene';
import { LocalPlatform } from './platform/local-platform';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Application root #app was not found.');
}

app.innerHTML = createFoundationMarkup();

async function startFoundation(): Promise<void> {
  const platform = new LocalPlatform();
  await platform.initialize();

  const canvasHost = app.querySelector<HTMLDivElement>('#game-canvas');

  if (!canvasHost) {
    throw new Error('Phaser mount #game-canvas was not found.');
  }

  createFoundationGame(canvasHost);
}

void startFoundation();
