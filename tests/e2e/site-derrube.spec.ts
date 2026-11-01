import { expect, test, type Page } from "@playwright/test";
import { siteCopy } from "../../lib/i18n/site";

const d = siteCopy.pt.derrube;
const AMBER = "rgb(245, 165, 36)";
const EBANO = "rgb(14, 15, 19)";

test.beforeEach(async ({ page }) => {
  // Analytics e Speed Insights só existem na Vercel; localmente dariam 404.
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

async function focusedName(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return el?.getAttribute("aria-label") ?? el?.textContent?.trim() ?? "";
  });
}

// Avança com Tab (ou Shift+Tab) até o elemento focado ter o nome procurado.
async function tabTo(page: Page, name: string, back = false, limit = 80) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press(back ? "Shift+Tab" : "Tab");
    if ((await focusedName(page)) === name) return;
  }
  throw new Error(`"${name}" não foi alcançado com ${back ? "Shift+Tab" : "Tab"}`);
}

async function openDerrube(page: Page) {
  await page.goto("/novo");
  await page.locator('[data-chapter="derrube"]').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
  // Começa a tabulação dentro do capítulo.
  await page.locator("#derrube h2").evaluate((el) => {
    el.setAttribute("tabindex", "-1");
    (el as HTMLElement).focus();
  });
}

test("com fila, só com teclado: derruba o banco, vai para a DLQ, reprocessa e entrega", async ({ page }) => {
  await openDerrube(page);
  const s = page.locator("#derrube");
  const log = s.locator("ol[aria-live]");

  await tabTo(page, d.toggleAria(d.nodes.db, true));
  await page.keyboard.press("Space");
  await expect(s.getByRole("button", { name: d.toggleAria(d.nodes.db, false) })).toHaveAttribute("aria-pressed", "false");

  await tabTo(page, d.send);
  await page.keyboard.press("Enter");
  await expect(s.locator(".s-app__status")).toHaveText(d.app.status.processing, { timeout: 5_000 });

  await expect(log.locator("li").first()).toHaveText(d.event({ kind: "toDlq", id: 1 }), { timeout: 20_000 });
  await expect(s.locator(".s-flow__chip--dlq")).toHaveText("#1");

  await tabTo(page, d.toggleAria(d.nodes.db, false), true);
  await page.keyboard.press("Space");
  await tabTo(page, d.replay);
  await page.keyboard.press("Enter");
  await expect(log.locator("li").first()).toHaveText(d.event({ kind: "delivered", id: 1 }), { timeout: 10_000 });
  await expect(s.locator(".s-app__status")).toHaveText(d.app.status.delivered);
  await expect(s.locator(".s-derrube__score dd")).toHaveText(["1", "1", "0"]);
});

test("sem fila, só com teclado: a mesma queda vira erro e o e-mail se perde", async ({ page }) => {
  await openDerrube(page);
  const s = page.locator("#derrube");

  await tabTo(page, d.modes.direct);
  await page.keyboard.press("Enter");
  await expect(s.getByRole("button", { name: d.modes.direct })).toHaveAttribute("aria-pressed", "true");

  await tabTo(page, d.toggleAria(d.nodes.worker, true));
  await page.keyboard.press("Space");
  await tabTo(page, d.send);
  await page.keyboard.press("Enter");
  await expect(s.locator(".s-app__status")).toHaveText(d.app.status.error, { timeout: 8_000 });
  await expect(s.locator(".s-derrube__score dd")).toHaveText(["1", "0", "1"]);
});

test("o foco é visível e contrasta com o fundo", async ({ page }) => {
  await openDerrube(page);
  const ring = () =>
    page.evaluate(() => {
      const st = getComputedStyle(document.activeElement as Element);
      return { style: st.outlineStyle, width: parseFloat(st.outlineWidth), color: st.outlineColor };
    });

  await tabTo(page, d.modes.queue);
  const mode = await ring();
  expect(mode.style).not.toBe("none");
  expect(mode.width).toBeGreaterThanOrEqual(2);
  expect(mode.color).toBe(AMBER);

  await tabTo(page, d.send);
  const send = await ring();
  expect(send.width).toBeGreaterThanOrEqual(2);
  expect(send.color).toBe(EBANO);
});

test.describe("com movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("as fichas mudam de lugar sem transição", async ({ page }) => {
    await openDerrube(page);
    const s = page.locator("#derrube");
    await s.getByRole("button", { name: d.toggleAria(d.nodes.db, true) }).click();
    await s.getByRole("button", { name: d.send }).click();
    const token = s.locator(".s-flow__token").first();
    await expect(token).toBeAttached();
    // A regra global de movimento reduzido usa 0,01 ms: na prática, zero.
    const seconds = await token.evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
    expect(seconds).toBeLessThan(0.001);
  });
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("mostra a explicação em texto e nenhum botão", async ({ page }) => {
    await page.goto("/novo");
    const s = page.locator("#derrube");
    await expect(s.getByText(d.noJs)).toBeVisible();
    await expect(s.getByRole("button")).toHaveCount(0);
  });
});
