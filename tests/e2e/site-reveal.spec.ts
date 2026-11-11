import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

async function settle(page: import("@playwright/test").Page) {
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) return;
    last = y;
    await page.waitForTimeout(100);
  }
}

test("um bloco fora da tela chega desfocado e termina sem filter", async ({ page }) => {
  await page.goto("/");
  const h2 = page.locator("#sobre h2[data-reveal]");
  await expect.poll(() => h2.evaluate((el) => getComputedStyle(el).filter)).toContain("blur(");
  await h2.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await settle(page);
  await expect.poll(() => h2.evaluate((el) => getComputedStyle(el).filter)).toBe("none");
  const inline = await h2.evaluate((el) => {
    const s = (el as HTMLElement).style;
    return [s.filter, s.opacity, s.transform];
  });
  expect(inline).toEqual(["", "", ""]);
});

test("voltar a rolar para cima desfoca o bloco de novo", async ({ page }) => {
  await page.goto("/");
  const h2 = page.locator("#sobre h2[data-reveal]");
  await h2.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await settle(page);
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
  await expect.poll(() => h2.evaluate((el) => getComputedStyle(el).filter)).toContain("blur(");
});

test("o retrato revelado não tem transition em transform e ainda sobe no hover", async ({ page }) => {
  await page.goto("/");
  const fig = page.locator("figure.s-portrait[data-reveal]").first();
  await fig.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await settle(page);
  await expect.poll(() => fig.evaluate((el) => getComputedStyle(el).filter)).toBe("none");
  const props = await fig.evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(props).not.toMatch(/(transform|all)/);
  await fig.hover();
  await expect.poll(() => fig.evaluate((el) => getComputedStyle(el).translate)).toBe("0px -2px");
});

// Abrir e fechar uma porta faz a Cortina medir de novo com o Derrube grudado
// por baixo do Projetos. Na volta, cada bloco do Derrube ainda entra em foco.
test("depois de abrir e fechar uma porta, os blocos do Derrube voltam ao foco", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-chapter="projetos"]')).toHaveAttribute("data-stick", "");
  await page
    .locator('[data-chapter="projetos"]')
    .evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }));
  await settle(page);

  const door = page.locator('#projetos .s-stage .s-door[data-door="backend"]');
  const room = page.locator('#projetos .s-portas > div > [data-door-panel="backend"]');
  await door.evaluate((el) => (el as HTMLElement).click());
  await expect(room.getByRole("heading", { level: 3, name: "Back-end" })).toBeFocused({ timeout: 10_000 });
  await page.keyboard.press("Escape");
  await expect(room).toHaveCount(0);
  await expect(door).toBeFocused({ timeout: 10_000 });
  await settle(page);

  const blocks = page.locator("#derrube [data-reveal]");
  const n = await blocks.count();
  expect(n).toBeGreaterThanOrEqual(3);
  let checked = 0;
  for (let i = 0; i < n; i++) {
    const block = blocks.nth(i);
    if (!(await block.evaluate((el) => el.getClientRects().length > 0))) continue;
    // No topo nada está grudado: a caixa dá a posição em fluxo.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await block.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const h = Math.min(r.height, innerHeight);
      window.scrollTo({ top: r.top + scrollY - (innerHeight - h) / 2, behavior: "instant" });
    });
    await expect
      .poll(() =>
        block.evaluate((el) => {
          const s = getComputedStyle(el);
          return `${s.filter} ${Number(s.opacity) >= 0.99}`;
        }),
      )
      .toBe("none true");
    checked++;
  }
  expect(checked).toBeGreaterThanOrEqual(3);
});

test("nenhum ancestral de .s-stage tem data-reveal", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate(() => document.querySelector(".s-stage")?.closest("[data-reveal]") ?? null)).toBeNull();
  expect(await page.locator('[data-chapter="abertura"] [data-reveal]').count()).toBe(0);
});

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });
  test("nenhum bloco tem filter", async ({ page }) => {
    await page.goto("/");
    const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let i = 0; i <= 10; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), (height * i) / 10);
      await page.waitForTimeout(150);
      const bad = await page.evaluate(
        () => [...document.querySelectorAll("[data-reveal]")].filter((e) => getComputedStyle(e).filter !== "none").length,
      );
      expect(bad).toBe(0);
    }
  });
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("os blocos aparecem", async ({ page }) => {
    await page.goto("/");
    const blocks = page.locator("[data-reveal]");
    expect(await blocks.count()).toBeGreaterThan(0);
    const bad = await blocks.evaluateAll(
      (els) => els.filter((e) => getComputedStyle(e).opacity !== "1" || getComputedStyle(e).filter !== "none").length,
    );
    expect(bad).toBe(0);
  });
});
