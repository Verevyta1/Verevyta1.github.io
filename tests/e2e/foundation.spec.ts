import { expect, test } from '@playwright/test';

test('plays the Matter Core greybox loop in the browser', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Project Scale' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Gravity Pulse' })).toBeVisible();
  await expect(page.locator('#game-canvas canvas')).toBeVisible();

  const mass = page.locator('#resource-mass');
  const matter = page.locator('#resource-matter');
  const pulse = page.locator('#gravity-pulse');

  await expect(pulse).toBeEnabled();
  await pulse.click();
  await expect(pulse).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#pulse-state')).toHaveText('Active');

  await expect
    .poll(
      async () => Number((await mass.textContent())?.replaceAll(',', '') ?? '0'),
      { timeout: 12_000 },
    )
    .toBeGreaterThan(0);
  await expect
    .poll(
      async () => Number((await matter.textContent())?.replaceAll(',', '') ?? '0'),
      { timeout: 2_000 },
    )
    .toBeGreaterThan(0);

  await expect(page.getByText('No movement controls.')).toBeVisible();
});
