import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Application root #app was not found.');
}

app.innerHTML = `
  <main class="foundation-shell" aria-labelledby="foundation-title">
    <section class="foundation-card">
      <p class="eyebrow">Technical foundation</p>
      <h1 id="foundation-title">Project Scale</h1>
      <p>The browser project is running. Gameplay will be added in small, tested slices.</p>
    </section>
  </main>
`;
