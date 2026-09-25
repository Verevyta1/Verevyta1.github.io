export const FOUNDATION_TITLE = 'Project Scale';

export function createFoundationMarkup(): string {
  return `
    <main class="foundation-shell" aria-labelledby="foundation-title">
      <section class="foundation-card">
        <p class="eyebrow">Technical foundation</p>
        <h1 id="foundation-title">${FOUNDATION_TITLE}</h1>
        <p>The browser project is running. Gameplay will be added in small, tested slices.</p>
      </section>
    </main>
  `;
}
