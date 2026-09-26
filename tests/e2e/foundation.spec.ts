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
    .poll(async () => Number((await mass.textContent())?.replaceAll(',', '') ?? '0'), {
      timeout: 12_000,
    })
    .toBeGreaterThan(0);
  await expect
    .poll(async () => Number((await matter.textContent())?.replaceAll(',', '') ?? '0'), {
      timeout: 2_000,
    })
    .toBeGreaterThan(0);

  await expect(page.getByText('No movement controls.')).toBeVisible();
});

test('buys and restores a Matter upgrade', async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('project-scale-save-v1')) {
      return;
    }

    window.localStorage.setItem(
      'project-scale-save-v1',
      JSON.stringify({
        saveVersion: 2,
        createdAt: 1,
        lastSavedAt: 1,
        game: {
          run: { mass: '100', matter: '20' },
          upgrades: {
            density: 0,
            gravity: 0,
            influence: 0,
            assimilation: 0,
            compression: 0,
          },
        },
      }),
    );
  });
  await page.goto('/');

  const matter = page.locator('#resource-matter');
  const densityLevel = page.locator('#upgrade-level-density');
  const densityCost = page.locator('#upgrade-cost-density');
  const buyDensity = page.getByRole('button', { name: 'Buy one Density upgrade' });

  await expect(page.getByRole('heading', { level: 2, name: 'Shape the Core' })).toBeVisible();
  await expect(densityCost).toHaveText('2');
  await expect(buyDensity).toBeEnabled();
  await buyDensity.click();
  await expect(densityLevel).toHaveText('1');
  await expect(matter).toHaveText('18');
  await expect(densityCost).toHaveText('3.1');

  await page.waitForFunction(() => {
    const serialized = window.localStorage.getItem('project-scale-save-v1');

    if (!serialized) {
      return false;
    }

    return JSON.parse(serialized).game.upgrades.density === 1;
  });
  await page.reload();
  await expect(densityLevel).toHaveText('1');
  await expect(matter).toHaveText('18');
});
