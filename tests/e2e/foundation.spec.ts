import { expect, test } from '@playwright/test';

test('boots the browser foundation screen with Phaser and the DOM shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Project Scale' })).toBeVisible();
  await expect(
    page.getByText(
      'The browser project is running. Gameplay will be added in small, tested slices.',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Matter Core placeholder preview rendered with Phaser' }),
  ).toBeVisible();
  await expect(page.locator('#game-canvas canvas')).toBeVisible();
});
