import { expect, test, type Page } from "@playwright/test";
import { redesignCopy } from "../../lib/i18n/redesign";

const b = redesignCopy.pt.breakService;

// Avança com Tab até o elemento focado ter o nome procurado.
async function tabTo(page: Page, name: string, limit = 80) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el?.getAttribute("aria-label") ?? el?.textContent?.trim() ?? "";
    });
    if (focused === name) return;
  }
  throw new Error(`"${name}" não foi alcançado com Tab`);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
  await page.goto("/redesign");
});

test("a interação principal funciona só com teclado", async ({ page }) => {
  const section = page.locator("#derrube");
  const log = section.locator("ol[aria-live]");
  const dbToggle = section.getByRole("button", { name: b.toggleAria(b.services.db, true) });

  // Derruba o banco: Tab até o botão e Espaço.
  await tabTo(page, b.toggleAria(b.services.db, true));
  await page.keyboard.press("Space");
  await expect(section.getByRole("button", { name: b.toggleAria(b.services.db, false) })).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  // Volta até "Enviar" com Shift+Tab e envia com Enter.
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Shift+Tab");
    if ((await page.evaluate(() => document.activeElement?.textContent?.trim())) === b.send) break;
  }
  await page.keyboard.press("Enter");

  // O log anuncia a entrada, as tentativas e a DLQ.
  await expect(log).toHaveAttribute("aria-live", "polite");
  await expect(log.locator("li").first()).toHaveText(b.event({ kind: "toDlq", id: 1 }), { timeout: 15_000 });
  await expect(section.locator(".rd-dlq__token")).toHaveText("#1");

  // Religa o banco e reprocessa: a mensagem chega e nada se perde.
  await section.getByRole("button", { name: b.toggleAria(b.services.db, false) }).focus();
  await page.keyboard.press("Space");
  await expect(dbToggle).toHaveAttribute("aria-pressed", "true");
  await section.getByRole("button", { name: b.replay }).focus();
  await page.keyboard.press("Enter");
  await expect(log.locator("li").first()).toHaveText(b.event({ kind: "delivered", id: 1 }), { timeout: 10_000 });

  const score = section.locator(".rd-score dd");
  await expect(score).toHaveText(["1", "1", "0"]);
});

test("o foco é sempre visível", async ({ page }) => {
  await tabTo(page, b.send);
  const outline = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement as Element);
    return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
  });
  expect(outline.style).not.toBe("none");
  expect(outline.width).toBeGreaterThanOrEqual(2);
});
