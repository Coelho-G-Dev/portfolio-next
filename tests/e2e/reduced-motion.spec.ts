import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
  await page.goto("/redesign");
});

test("o marquee do nome fica parado", async ({ page }) => {
  const animations = await page
    .locator(".rd-track__run")
    .evaluateAll((runs) => runs.map((r) => getComputedStyle(r).animationName));
  expect(animations.every((a) => a === "none")).toBe(true);
});

test("todo conteúdo aparece sem precisar rolar até ele", async ({ page }) => {
  // Sem rolar: com movimento reduzido, nada pode depender da entrada animada.
  const hidden = await page
    .locator("[data-rise]")
    .evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== "1").length);
  expect(hidden).toBe(0);
});
