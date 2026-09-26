import { expect, test } from '@playwright/test';

test('drags and throws Teemo, then earns gold from minions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Teemo: Nexus Launch' })).toBeVisible();
  await expect(page.locator('#game-canvas canvas')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Scout upgrades' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Launch Teemo' })).toHaveCount(0);

  const canvas = page.locator('#game-canvas canvas');
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) {
    return;
  }

  const teemoX = bounds.x + (220 / 960) * bounds.width;
  const teemoY = bounds.y + (410 / 540) * bounds.height;
  await page.mouse.move(teemoX, teemoY);
  await page.mouse.down();
  await page.mouse.move(teemoX - 115, teemoY + 28, { steps: 8 });
  await page.mouse.up();

  await expect(page.locator('#run-status')).toContainText(/In flight|Run complete/);
  await expect
    .poll(
      async () =>
        Number((await page.locator('#gold-total').textContent())?.replaceAll(',', '') ?? '0'),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0);
  await expect(page.locator('#minion-total')).not.toHaveText('0');
  await expect(page.locator('#run-distance')).not.toHaveText('0');
});

test('purchases and restores a scout upgrade', async ({ page }) => {
  await page.addInitScript(() => {
    const saveKey = 'teemo-nexus-launch-save-v1';
    if (window.localStorage.getItem(saveKey)) {
      return;
    }
    window.localStorage.setItem(
      saveKey,
      JSON.stringify({
        saveVersion: 2,
        savedAt: 1,
        gold: '100',
        bestDistance: 700,
        upgrades: {
          throwStrength: 0,
          rocketSlam: 0,
          bouncePower: 0,
          speed: 0,
          drag: 0,
          minionMomentum: 0,
          goldBounty: 0,
        },
      }),
    );
  });
  await page.goto('/');

  await expect(page.locator('#distance-remaining')).toHaveText('4,300 m');
  const buy = page.getByRole('button', { name: 'Buy one Bandle Sling Tension' });
  await expect(buy).toBeEnabled();
  await buy.click();
  await expect(page.locator('#upgrade-level-throwStrength')).toHaveText('1');
  await expect(page.locator('#gold-total')).toHaveText('88');
  await page.waitForFunction(
    () =>
      JSON.parse(window.localStorage.getItem('teemo-nexus-launch-save-v1') ?? '{}').upgrades
        ?.throwStrength === 1,
  );
  await page.reload();
  await expect(page.locator('#upgrade-level-throwStrength')).toHaveText('1');
  await expect(page.locator('#gold-total')).toHaveText('88');
  await expect(page.locator('#distance-remaining')).toHaveText('4,300 m');
});
