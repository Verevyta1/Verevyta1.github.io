import { expect, test } from "@playwright/test";

test("launches Teemo and earns gold by smashing minions", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Teemo: Nexus Launch" }),
  ).toBeVisible();
  await expect(page.locator("#game-canvas canvas")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Prepare the next launch" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Launch Teemo" }).click();
  await expect(
    page.getByRole("button", { name: "Teemo is flying…" }),
  ).toBeDisabled();
  await expect
    .poll(
      async () =>
        Number(
          (await page.locator("#gold-total").textContent())?.replaceAll(
            ",",
            "",
          ) ?? "0",
        ),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  await expect(page.locator("#minion-total")).not.toHaveText("0");
  await expect(page.locator("#run-distance")).not.toHaveText("0");
});

test("purchases and restores a launch upgrade", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "teemo-nexus-launch-save-v1",
      JSON.stringify({
        saveVersion: 1,
        savedAt: 1,
        gold: "100",
        bestDistance: 700,
        upgrades: {
          launchPower: 0,
          bouncePower: 0,
          goldBounty: 0,
          mushroomBoost: 0,
        },
      }),
    );
  });
  await page.goto("/");

  const buy = page.getByRole("button", { name: "Buy one Bandlewood Launcher" });
  await expect(buy).toBeEnabled();
  await buy.click();
  await expect(page.locator("#upgrade-level-launchPower")).toHaveText("1");
  await expect(page.locator("#gold-total")).toHaveText("80");
  await page.waitForFunction(
    () =>
      JSON.parse(
        window.localStorage.getItem("teemo-nexus-launch-save-v1") ?? "{}",
      ).upgrades?.launchPower === 1,
  );
  await page.reload();
  await expect(page.locator("#upgrade-level-launchPower")).toHaveText("1");
  await expect(page.locator("#gold-total")).toHaveText("80");
});
