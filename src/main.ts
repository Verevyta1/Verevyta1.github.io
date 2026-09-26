import { createFoundationMarkup } from './app/foundation';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Application root #app was not found.');
}

app.innerHTML = createFoundationMarkup();
