import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { siteCopy } from "../../lib/i18n/site";

const pt = siteCopy.pt;
const p = pt.projetos;

test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
  await page.route(/kaspersky-labs\.com/, (r) => r.abort());
  await page.addInitScript(() =>
    localStorage.getItem("preferred-language") ||
    localStorage.setItem("preferred-language", "pt"),
  );
});

async function focusedName(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return el?.getAttribute("aria-label") ?? el?.textContent?.trim() ?? "";
  });
}

async function tabTo(page: Page, name: string, back = false, limit = 100) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press(back ? "Shift+Tab" : "Tab");
    if ((await focusedName(page)) === name) return;
  }
  throw new Error(`"${name}" não foi alcançado com ${back ? "Shift+Tab" : "Tab"}`);
}

async function openProjetos(page: Page) {
  await page.goto("/novo");
  await page
    .locator('[data-chapter="projetos"]')
    .evaluate((el) =>
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
  await page.locator("#projetos h2").evaluate((el) => {
    el.setAttribute("tabindex", "-1");
    (el as HTMLElement).focus();
  });
}

test('"Ver projetos" leva ao h2 e o destaque do Cidade Energia está visível sem abrir porta', async ({
  page,
}) => {
  await page.goto("/novo");
  const cta = page.locator("#inicio").getByRole("link", { name: pt.hero.seeWork });
  await expect
    .poll(() =>
      cta.evaluate((el) => {
        const opening = document.querySelector<HTMLElement>('[data-chapter="abertura"]')!;
        window.scrollTo({
          top: Math.max(0, opening.offsetHeight - window.innerHeight),
          behavior: "instant",
        });
        const r = el.getBoundingClientRect();
        return (
          r.bottom <= innerHeight &&
          el.contains(
            document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2),
          )
        );
      }),
    )
    .toBe(true);
  await cta.evaluate((el) => (el as HTMLElement).click());

  const h2 = page.locator("#projetos h2").first();
  await expect(h2).toBeInViewport();
  const featured = page.locator("#projetos [data-featured-project]");
  await expect(featured.getByRole("heading", { level: 3, name: "Cidade Energia" })).toBeVisible();
  await expect(page.locator("#projetos [data-door-panel]")).toHaveCount(0);
});

test("teclado: abre IA (3 h4) e fecha com Esc; abre Back-end, abre Tela cheia (dialog) e fecha com Esc", async ({
  page,
}) => {
  await openProjetos(page);
  const s = page.locator("#projetos");

  const iaBtnName = p.open(p.doors.ia.name);
  await tabTo(page, iaBtnName);
  await page.keyboard.press("Enter");

  const iaHeading = s.locator('[data-door-panel="ia"]').getByRole("heading", { level: 3, name: "IA" });
  await expect(iaHeading).toBeVisible();
  await expect.poll(() => focusedName(page)).toBe("IA");
  await expect(s.locator('[data-door-panel="ia"] h4')).toHaveCount(3);

  await page.keyboard.press("Escape");
  await expect(s.locator('[data-door-panel="ia"]')).toHaveCount(0);
  await expect.poll(() => focusedName(page)).toBe(iaBtnName);

  // Abre Back-end e aciona "Tela cheia" por teclado.
  const backBtnName = p.open(p.doors.backend.name);
  await tabTo(page, backBtnName, true);
  await page.keyboard.press("Enter");

  const backPanel = s.locator('[data-door-panel="backend"]');
  await expect(backPanel).toBeVisible();
  await tabTo(page, p.board.fullscreen);
  await page.keyboard.press("Enter");

  const dialog = backPanel.locator("dialog.s-board__dialog").first();
  await expect(dialog).toHaveAttribute("open", "");

  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect.poll(() => focusedName(page)).toBe(p.board.fullscreen);
  // A porta Back-end continua aberta depois de fechar o dialog.
  await expect(backPanel).toBeVisible();
});

test("Front-end: painel com um projeto tem métricas e pelo menos dois links", async ({
  page,
}) => {
  await openProjetos(page);
  const s = page.locator("#projetos");
  await s
    .getByRole("button", { name: p.open(p.doors.frontend.name) })
    .evaluate((el) => (el as HTMLElement).click());

  const panel = s.locator('[data-door-panel="frontend"]');
  await expect(panel).toBeVisible();
  await expect(panel.locator("h4")).toHaveCount(2);
  const metricsCount = await panel.locator(".s-project-card__metric").count();
  expect(metricsCount).toBeGreaterThanOrEqual(1);
  const linksCount = await panel.locator(".s-project-card__links a").count();
  expect(linksCount).toBeGreaterThanOrEqual(2);
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("os três painéis estão visíveis e nenhum botão de porta existe", async ({
    page,
  }) => {
    await page.goto("/novo");
    const s = page.locator("#projetos");
    await expect(s.locator('[data-door-panel="backend"]')).toBeVisible();
    await expect(s.locator('[data-door-panel="frontend"]')).toBeVisible();
    await expect(s.locator('[data-door-panel="ia"]')).toBeVisible();
    await expect(s.locator(".s-door")).toHaveCount(0);
  });
});

test.describe("com movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("o portal não tem rotação 3D depois de abrir", async ({
    page,
  }) => {
    await openProjetos(page);
    const s = page.locator("#projetos");
    const doorBtn = s.locator('[data-door="backend"]');
    await doorBtn.evaluate((el) => (el as HTMLElement).click());

    const transform = await doorBtn
      .locator(".s-door__frame")
      .evaluate((el) => getComputedStyle(el).transform);
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(transform);
  });
});

for (const lang of ["pt", "en"] as const) {
  test(`axe: sem violações sérias com a porta Back-end aberta (${lang})`, async ({
    page,
  }) => {
    await page.addInitScript(
      (l) => localStorage.setItem("preferred-language", l),
      lang,
    );
    await openProjetos(page);
    const s = page.locator("#projetos");
    const openLabel = siteCopy[lang].projetos.open(
      siteCopy[lang].projetos.doors.backend.name,
    );
    await s
      .getByRole("button", { name: openLabel })
      .evaluate((el) => (el as HTMLElement).click());
    await expect(s.locator('[data-door-panel="backend"]')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include("#projetos")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 5),
      }));
    expect(serious).toEqual([]);
  });
}
