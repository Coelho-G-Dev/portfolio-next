import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { siteCopy } from "../../lib/i18n/site";

const pt = siteCopy.pt;

test.beforeEach(async ({ page }) => {
  // Analytics e Speed Insights só existem na Vercel; localmente dariam 404.
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

// A página usa rolagem suave (globals.css): espera a rolagem parar antes de medir.
async function settle(page: Page) {
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) return;
    last = y;
    await page.waitForTimeout(100);
  }
}

// Posição do trecho no documento. Vale enquanto o capítulo do Sobre não
// grudou (ele só gruda pela base, bem depois do fim do trecho).
const geom = (page: Page) =>
  page.locator("[data-dia600]").evaluate((el: HTMLElement) => ({
    top: el.getBoundingClientRect().top + scrollY,
    range: el.offsetHeight - innerHeight,
  }));

// Rola até a fração f do trecho, sem rolagem suave.
async function scrollTo(page: Page, f: number) {
  const g = await geom(page);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), g.top + f * g.range);
}

const tons = (page: Page) =>
  page.locator("[data-dia600-tons]").evaluate((el) => parseInt(el.textContent ?? "", 10));
const opacities = (page: Page, selector: string) =>
  page.locator(`.s-dia600 ${selector}`).evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).opacity)));

const on = (page: Page) => expect(page.locator("[data-dia600]")).toHaveAttribute("data-dia600-on", "");
// O ScrollTrigger carregou e a Cortina mediu.
const ready = (page: Page) => expect(page.locator('[data-chapter="sobre"]')).toHaveAttribute("data-stick", "");

// O elemento está por cima no próprio centro (nada o cobre).
function onTopAtCenter(el: Element) {
  const r = el.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return !!hit && el.contains(hit);
}

test("o contador acompanha a rolagem e termina com os nomes do código", async ({ page }) => {
  await page.goto("/");
  await on(page);
  const lost = page.locator(".s-dia600__counter--lost b");

  await scrollTo(page, 0);
  await expect.poll(() => tons(page)).toBe(300);
  await expect(lost).toBeVisible();
  await expect(lost).toHaveText("0");

  await scrollTo(page, 0.4);
  await expect.poll(() => tons(page), { timeout: 5_000 }).toBeGreaterThanOrEqual(420);
  expect(await tons(page)).toBeLessThanOrEqual(480);
  await expect(lost).toBeVisible();
  await expect(lost).toHaveText("0");

  await scrollTo(page, 0.98);
  await expect.poll(() => opacities(page, ".s-dia600__code"), { timeout: 5_000 }).toEqual([1, 1, 1, 1, 1]);
  expect(await opacities(page, ".s-dia600__log")).toEqual([0, 0, 0, 0, 0]);
  await expect(page.locator('[data-stage="conferencia"] .s-dia600__code')).toHaveText(pt.derrube.nodes.queue);
  await expect(page.locator("[data-dia600-tons]")).toHaveText("600 t");
  await expect(lost).toBeVisible();
  await expect(lost).toHaveText("0");
});

test("o palco fica preso durante o trecho", async ({ page }) => {
  await page.goto("/");
  await on(page);
  const stage = page.locator(".s-dia600__stage");
  for (const f of [0.2, 0.5, 0.8]) {
    await scrollTo(page, f);
    expect(Math.abs(await stage.evaluate((el) => el.getBoundingClientRect().top))).toBeLessThan(1);
  }
});

test("Tab até o link da ponte o deixa visível e por cima", async ({ page }) => {
  await page.goto("/");
  await on(page);
  // A cena no começo, com o link ainda escondido; volta do Skills até ele.
  await scrollTo(page, 0);
  await expect(page.locator("[data-dia600]")).toHaveAttribute("data-own-focus", "");
  await page.locator(".s-stack-chip").first().evaluate((el: HTMLElement) => el.focus({ preventScroll: true }));
  await page.keyboard.press("Shift+Tab");
  const link = page.getByRole("link", { name: pt.about.dia600.bridgeLink });
  await expect(link).toBeFocused();
  await settle(page);
  await expect(link).toBeInViewport({ ratio: 1 });
  await expect.poll(() => link.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  await expect.poll(() => link.evaluate(onTopAtCenter)).toBe(true);
});

test("Enter no link da ponte leva o foco ao Derrube, e o Tab segue de lá", async ({ page }) => {
  await page.goto("/");
  await on(page);
  await scrollTo(page, 0);
  await page.locator(".s-stack-chip").first().evaluate((el: HTMLElement) => el.focus({ preventScroll: true }));
  await page.keyboard.press("Shift+Tab");
  const link = page.getByRole("link", { name: pt.about.dia600.bridgeLink });
  await expect(link).toBeFocused();
  await settle(page);

  await page.keyboard.press("Enter");
  await settle(page);
  const title = page.locator("#derrube h2");
  await expect(title).toBeFocused();
  await expect(title).toBeInViewport();
  await expect.poll(() => title.evaluate(onTopAtCenter)).toBe(true);

  await page.keyboard.press("Tab");
  await settle(page);
  const focused = page.locator(":focus");
  expect(await focused.evaluate((el) => !!el.closest("#derrube"))).toBe(true);
  await expect(focused).toBeInViewport();
  await expect.poll(() => focused.evaluate(onTopAtCenter)).toBe(true);
});

test("o link da ponte leva ao Derrube", async ({ page }) => {
  await page.goto("/");
  await on(page);
  await scrollTo(page, 0.98);
  const link = page.getByRole("link", { name: pt.about.dia600.bridgeLink });
  await expect.poll(() => link.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  await link.click();
  await settle(page);
  // O Derrube estava grudado sob as folhas: chega com o título por cima.
  const title = page.locator("#derrube h2");
  await expect(title).toBeInViewport();
  await expect.poll(() => title.evaluate(onTopAtCenter)).toBe(true);
  await expect(page).toHaveURL(/#derrube$/);
});

// Os nomes das caixas não quebram no meio da palavra (no tablet, as cinco
// colunas são estreitas): cada palavra cabe inteira na largura da caixa.
for (const lang of ["pt", "en"] as const) {
  test(`os nomes das caixas cabem sem partir palavra (${lang})`, async ({ page }) => {
    await page.addInitScript((l) => localStorage.setItem("preferred-language", l), lang);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", lang === "pt" ? /^pt/ : /^en/);
    // Ligado, cada nome é um bloco da largura da caixa.
    await on(page);
    await page.evaluate(() => document.fonts.ready);
    const overflowing = await page.locator(".s-dia600__log, .s-dia600__code").evaluateAll((els) =>
      els.flatMap((el) => {
        const box = el.getBoundingClientRect().width;
        return (el.textContent ?? "").split(/\s+/).filter((word) => {
          const probe = document.createElement("span");
          probe.textContent = word;
          probe.style.whiteSpace = "nowrap";
          el.append(probe);
          const w = probe.getBoundingClientRect().width;
          probe.remove();
          return w > box + 0.5;
        });
      }),
    );
    expect(overflowing).toEqual([]);
  });
}

for (const lang of ["pt", "en"] as const) {
  test(`axe sem violações sérias com o Sobre na tela (${lang})`, async ({ page }) => {
    await page.addInitScript((l) => localStorage.setItem("preferred-language", l), lang);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", lang === "pt" ? /^pt/ : /^en/);
    await on(page);
    await expect(page.locator(".s-dia600__title")).toHaveText(siteCopy[lang].about.dia600.title);
    // Frase ativa em cada ponto (dia600Frame): espera ela e a troca de nomes
    // assentarem, em vez de um tempo fixo. 0,55, e não 0,5: 0,5 é a própria
    // troca de frase, e o scrollY arredondado cai dos dois lados.
    for (const [f, line, code] of [
      [0.55, "2", 0],
      [0.98, "4", 1],
    ] as const) {
      // A página ainda pode crescer acima do trecho (troca para EN, fontes):
      // a cada tentativa, mede e rola de novo.
      await expect
        .poll(async () => {
          await scrollTo(page, f);
          return page.locator("[data-dia600]").getAttribute("data-line");
        })
        .toBe(line);
      await expect
        .poll(() => page.locator(`[data-dia600-line="${line}"]`).evaluate((el) => Number(getComputedStyle(el).opacity)))
        .toBe(1);
      await expect.poll(() => opacities(page, ".s-dia600__code")).toEqual([code, code, code, code, code]);
      // Fora da conta: os blocos do foco ao chegar ainda abaixo da tela (chegam
      // esmaecidos de propósito; o site-a11y e o site-reveal cuidam deles) e as
      // fichas, decorativas e aria-hidden, que entram e saem esmaecendo.
      const results = await new AxeBuilder({ page })
        .include("#sobre")
        .exclude("#sobre [data-reveal]")
        .exclude(".s-dia600__track")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 5) }));
      expect(serious, `progresso ${f}`).toEqual([]);
    }
  });
}

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });
  test("estado final, sem trecho preso", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const dia = page.locator("[data-dia600]");
    await expect(dia).not.toHaveAttribute("data-dia600-on");
    await dia.scrollIntoViewIfNeeded();
    await expect(page.locator("[data-dia600-tons]")).toHaveText("600 t");
    await expect(page.locator("[data-dia600-tons]")).toBeVisible();
    await expect(page.locator("[data-dia600-trucks]")).toHaveText("40");
    const { height, vh } = await dia.evaluate((el: HTMLElement) => ({ height: el.offsetHeight, vh: innerHeight }));
    expect(height).toBeLessThan(3.8 * vh - 1);
    await expect(page.locator(".s-dia600__stage")).not.toHaveCSS("position", "sticky");
    // Os dois nomes em cada caixa.
    await expect(page.locator('[data-stage="conferencia"] .s-dia600__name')).toHaveText(
      `${pt.about.dia600.stages.conferencia} · ${pt.derrube.nodes.queue}`,
    );
  });

  test("o link da ponte leva ao Derrube (capítulos ainda grudam)", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const link = page.getByRole("link", { name: pt.about.dia600.bridgeLink });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await settle(page);
    const title = page.locator("#derrube h2");
    await expect(title).toBeInViewport();
    await expect.poll(() => title.evaluate(onTopAtCenter)).toBe(true);
  });
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("a história inteira aparece", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-dia600]")).not.toHaveAttribute("data-dia600-on");
    for (const line of pt.about.dia600.lines) {
      const p = page.locator(".s-dia600__line", { hasText: line });
      await p.scrollIntoViewIfNeeded();
      await expect(p).toBeVisible();
      expect(await p.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    }
    await expect(page.locator("[data-dia600-tons]")).toHaveText("600 t");
    await expect(page.getByRole("link", { name: pt.about.dia600.bridgeLink })).toBeVisible();
  });
});
