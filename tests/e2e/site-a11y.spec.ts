import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

for (const lang of ["pt", "en"]) {
  test(`/novo sem violações sérias ou críticas do axe (${lang})`, async ({ page }) => {
    await page.addInitScript((l) => localStorage.setItem("preferred-language", l), lang);
    await page.goto("/novo");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 5) }));

    expect(serious).toEqual([]);
  });
}
