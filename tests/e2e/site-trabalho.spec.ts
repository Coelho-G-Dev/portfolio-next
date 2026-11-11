import { expect, test, type Page } from "@playwright/test";
import { deckLayout, deckProgressFor } from "../../lib/deck";
import { siteCopy } from "../../lib/i18n/site";

const pt = siteCopy.pt;
const N = 4;

test.beforeEach(async ({ page }) => {
  await page.route(/kaspersky-labs\.com/, (r) => r.abort());
  // Analytics e Speed Insights só existem na Vercel; localmente dariam 404.
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

for (const [width, height] of [[360, 640], [390, 667], [390, 844], [768, 1024]]) {
  for (const lang of ["pt", "en"]) {
    test(`cartas inteiras em ${width}x${height} ${lang}`, async ({ page }, info) => {
      test.skip(info.project.name !== "phone-390", "matriz compacta serial no projeto celular");
      await page.setViewportSize({ width, height });
      await page.addInitScript((l) => localStorage.setItem("preferred-language", l), lang);
      await page.goto("/");
      await ready(page);
      const deck = page.locator("[data-deck]");
      await expect(deck).toHaveAttribute("data-deck-on", "");
      const g = await deckGeom(page);
      for (let j = 0; j < N; j++) {
        await scrollInstant(page, g.top + deckProgressFor(j, N) * (g.height - g.vh));
        await expect.poll(async () => Math.abs(await cardVar(page, j, "--cy"))).toBeLessThan(0.5);
        const card = page.locator(`[data-deck-card="${j}"]`);
        const metrics = await card.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const pre = el.querySelector("pre");
          const link = el.querySelector("a");
          return { top: r.top, bottom: r.bottom, vh: innerHeight,
            overflow: el.scrollHeight - el.clientHeight,
            text: parseFloat(getComputedStyle(el.querySelector(".s-how__text")!).fontSize),
            code: pre ? parseFloat(getComputedStyle(pre).fontSize) : 12,
            smallText: [...el.querySelectorAll(".s-evidence-caption, .s-evidence-metric__label")]
              .map((small) => parseFloat(getComputedStyle(small).fontSize)),
            link: link ? link.getBoundingClientRect().height : 44 };
        });
        expect(metrics.top).toBeGreaterThanOrEqual(-1);
        expect(metrics.bottom).toBeLessThanOrEqual(metrics.vh + 1);
        expect(metrics.overflow).toBeLessThanOrEqual(1);
        expect(metrics.text).toBeGreaterThanOrEqual(15);
        expect(metrics.code).toBeGreaterThanOrEqual(12);
        for (const size of metrics.smallText) expect(size).toBeGreaterThanOrEqual(12);
        expect(metrics.link).toBeGreaterThanOrEqual(44);
      }
    });
  }
}

test("fonte 200% em 360x640 mantém o conteúdo em lista", async ({ page }, info) => {
  test.skip(info.project.name !== "phone-390");
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  await ready(page);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; dispatchEvent(new Event("resize")); });
  await expect(page.locator("[data-deck]")).not.toHaveAttribute("data-deck-on");
  await expect(page.locator('[data-deck-card="0"]')).not.toHaveCSS("position", "absolute");
});

test("trocar PT por EN na carta 02 em 390x667 mantém o baralho", async ({ page }, info) => {
  test.skip(info.project.name !== "phone-390");
  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto("/");
  await ready(page);
  const g = await deckGeom(page);
  await scrollInstant(page, g.top + deckProgressFor(1, N) * (g.height - g.vh));
  await expect.poll(async () => Math.abs(await cardVar(page, 1, "--cy"))).toBeLessThan(0.5);
  await page.getByRole("button", { name: pt.nav.langSwitchAria }).evaluate((el: HTMLElement) => el.click());
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("[data-deck]")).toHaveAttribute("data-deck-on", "");
  // O texto acima muda de altura em EN; mantém a rolagem e recalcula o progresso.
  // A carta deve seguir a geometria atual e continuar descoberta.
  await expect.poll(() => deckDeviation(page)).toBeLessThan(2);
  await expect.poll(() => page.locator('[data-deck-card="1"]').evaluate(onTopAtCenter)).toBe(true);
});

test("desktop mantém as dimensões aprovadas", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440");
  await page.goto("/");
  await ready(page);
  await expect(page.locator("[data-deck]")).not.toHaveAttribute("data-deck-compact");
  await expect(page.locator('[data-deck-card="0"]')).toHaveCSS("padding-top", "32px");
  await expect(page.locator('[data-deck-card="0"]')).toHaveCSS("width", "760px");
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

const scrollInstant = (page: Page, top: number) =>
  page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);

// Posição do baralho no documento. Vale enquanto o capítulo dele não grudou
// (o capítulo só gruda depois do fim do baralho).
const deckGeom = (page: Page) =>
  page.locator("[data-deck]").evaluate((el: HTMLElement) => ({
    top: el.getBoundingClientRect().top + scrollY,
    height: el.offsetHeight,
    vh: innerHeight,
  }));

const cardVar = (page: Page, j: number, name: string) =>
  page
    .locator(`[data-deck-card="${j}"]`)
    .evaluate((el: HTMLElement, n) => parseFloat(el.style.getPropertyValue(n)), name);

// O ScrollTrigger carregou e a Cortina mediu: o baralho já decidiu se liga.
const ready = (page: Page) => expect(page.locator('[data-chapter="trabalho"]')).toHaveAttribute("data-stick", "");

test("o baralho fica preso e as cartas entram uma sobre a outra", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-deck]")).toHaveAttribute("data-deck-on", "");
  const g = await deckGeom(page);
  const range = g.height - g.vh;
  const stage = page.locator(".s-deck__stage");

  await scrollInstant(page, g.top);
  await expect.poll(() => cardVar(page, 0, "--cy")).toBe(0);

  // O palco fica com top 0 durante todo o trecho.
  for (const f of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    await scrollInstant(page, g.top + f * range);
    expect(Math.abs(await stage.evaluate((el) => el.getBoundingClientRect().top))).toBeLessThan(1);
  }

  await scrollInstant(page, g.top + deckProgressFor(3, N) * range);
  await expect.poll(async () => Math.abs(await cardVar(page, 3, "--cy")), { timeout: 5_000 }).toBeLessThan(0.5);
  expect(await cardVar(page, 0, "--cs")).toBeLessThan(1);
  expect(Math.abs(await stage.evaluate((el) => el.getBoundingClientRect().top))).toBeLessThan(1);
});

test("Tab até o link do Swagger traz a carta 04 para a frente", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-deck]")).toHaveAttribute("data-deck-on", "");
  const g = await deckGeom(page);
  await scrollInstant(page, g.top);
  // Parte da carta 01 (já na frente) e anda só com o teclado: 02, depois 04.
  await page.locator('[data-deck-card="0"] pre').evaluate((el: HTMLElement) => el.focus({ preventScroll: true }));
  await page.keyboard.press("Tab");
  await expect(page.locator('[data-deck-card="1"] pre')).toBeFocused();
  await settle(page);
  await page.keyboard.press("Tab");
  const link = page.getByRole("link", { name: pt.how.docsLink });
  await expect(link).toBeFocused();
  await settle(page);
  await expect(link).toBeInViewport({ ratio: 1 });
  await expect.poll(() => link.evaluate(onTopAtCenter)).toBe(true);
});

// O elemento está por cima no próprio centro (nenhuma carta o cobre).
function onTopAtCenter(el: Element) {
  const r = el.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return !!hit && el.contains(hit);
}

// Maior distância entre o --cy de cada carta e o que o deckLayout manda para o
// progresso de agora, medido na página.
async function deckDeviation(page: Page) {
  const s = await page.evaluate(() => {
    const deck = document.querySelector<HTMLElement>("[data-deck]")!;
    const top = deck.getBoundingClientRect().top + scrollY;
    const p = (scrollY - top) / (deck.offsetHeight - innerHeight);
    const cys = [...deck.querySelectorAll<HTMLElement>("[data-deck-card]")].map((c) =>
      parseFloat(c.style.getPropertyValue("--cy")),
    );
    return { p, vh: innerHeight, cys };
  });
  const L = deckLayout(Math.min(1, Math.max(0, s.p)), N, s.vh);
  return Math.max(...L.map((c, j) => Math.abs(c.y - s.cys[j])));
}

test("trocar o idioma no meio do baralho não solta as cartas", async ({ page }) => {
  await page.goto("/");
  const deck = page.locator("[data-deck]");
  await expect(deck).toHaveAttribute("data-deck-on", "");
  const g = await deckGeom(page);
  // A carta 03 na frente: a 01 está enterrada sob a 02 e a 03.
  await scrollInstant(page, g.top + deckProgressFor(2, N) * (g.height - g.vh));
  await expect.poll(() => deckDeviation(page)).toBeLessThan(2);

  // O botão de idioma fica na abertura, coberta pelas folhas: clica pelo DOM.
  await page.getByRole("button", { name: pt.nav.langSwitchAria }).evaluate((el: HTMLElement) => el.click());
  await expect(page.locator("html")).toHaveAttribute("lang", /^en/);
  await expect(page.locator('[data-deck-card="3"]')).toContainText(siteCopy.en.how.docsLink);
  await expect(deck).toHaveAttribute("data-deck-on", "");
  await expect.poll(() => deckDeviation(page), { timeout: 5_000 }).toBeLessThan(2);

  // Tab até a carta 01 (Shift+Tab a partir da 02) a traz para a frente.
  await page.locator('[data-deck-card="1"] pre').evaluate((el: HTMLElement) => el.focus({ preventScroll: true }));
  await page.keyboard.press("Shift+Tab");
  const pre = page.locator('[data-deck-card="0"] pre');
  await expect(pre).toBeFocused();
  await settle(page);
  await expect(pre).toBeInViewport({ ratio: 1 });
  await expect.poll(() => pre.evaluate(onTopAtCenter), { timeout: 5_000 }).toBe(true);
});

test("abrir já em inglês: o baralho segue as cartas", async ({ page }) => {
  // Roda depois do beforeEach: o provedor troca para EN num efeito, depois
  // da primeira renderização em PT.
  await page.addInitScript(() => localStorage.setItem("preferred-language", "en"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("[data-deck]")).toHaveAttribute("data-deck-on", "");
  const g = await deckGeom(page);
  await scrollInstant(page, g.top + deckProgressFor(2, N) * (g.height - g.vh));
  await expect.poll(() => deckDeviation(page), { timeout: 5_000 }).toBeLessThan(2);
  await expect.poll(() => page.locator('[data-deck-card="2"]').evaluate(onTopAtCenter)).toBe(true);
});

// O Projetos está grudado por baixo do Trabalho: a âncora do navegador mediria
// o destino onde ele está grudado e pararia no meio do caminho.
test("o link de prova do O que eu resolvo leva ao título do Projetos, com foco", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  // No topo nada está grudado: a caixa dá a posição em fluxo.
  await page
    .locator("#o-que-resolvo")
    .evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }));
  await settle(page);
  const link = page.locator("#o-que-resolvo .s-services__proof-link:visible").first();
  await expect(link).toBeInViewport();
  await link.click();
  await settle(page);

  const title = page.locator("#projetos h2");
  await expect(title).toBeFocused();
  await expect(title).toBeInViewport();
  await expect.poll(() => title.evaluate(onTopAtCenter)).toBe(true);
  await expect(page).toHaveURL(/#projetos$/);
});

test.describe("tela baixa", () => {
  test.use({ viewport: { width: 1024, height: 420 } });

  test("carta que não cabe: lista normal, e liga numa tela alta", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const deck = page.locator("[data-deck]");
    await expect(deck).not.toHaveAttribute("data-deck-on");
    await expect(deck).not.toHaveAttribute("data-own-focus");
    const positions = await page.locator("[data-deck-card]").evaluateAll((els) => els.map((e) => getComputedStyle(e).position));
    expect(positions).toHaveLength(N);
    expect(positions.filter((p) => p === "absolute")).toEqual([]);

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(deck).toHaveAttribute("data-deck-on", "");
    // Ligado, o baralho cuida da rolagem do foco (a guarda da Cortina o pula).
    await expect(deck).toHaveAttribute("data-own-focus", "");
    await expect(page.locator('[data-deck-card="0"]')).toHaveCSS("position", "absolute");

    // E desliga de novo quando a tela volta a ser baixa.
    await page.setViewportSize({ width: 1024, height: 420 });
    await expect(deck).not.toHaveAttribute("data-deck-on");
    await expect(deck).not.toHaveAttribute("data-own-focus");
    await expect(page.locator('[data-deck-card="0"]')).not.toHaveCSS("position", "absolute");
  });
});

test("redimensionar no meio do baralho", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-deck]")).toHaveAttribute("data-deck-on", "");
  const g = await deckGeom(page);
  await scrollInstant(page, g.top + 0.5 * (g.height - g.vh));
  await page.waitForTimeout(500);
  await page.setViewportSize({ width: 1280, height: 800 });
  await settle(page);

  // Onde quer que a nova largura tenha deixado a rolagem, as cartas seguem o
  // progresso de agora (nada parado num ponto velho).
  await expect.poll(() => deckDeviation(page), { timeout: 10_000 }).toBeLessThan(2);

  // E no meio do trecho novo, com o gatilho medido para a janela nova.
  const h = await deckGeom(page);
  await scrollInstant(page, h.top + 0.5 * (h.height - h.vh));
  await expect.poll(() => deckDeviation(page), { timeout: 10_000 }).toBeLessThan(2);
  const p = await page.evaluate(() => {
    const deck = document.querySelector<HTMLElement>("[data-deck]")!;
    return (scrollY - (deck.getBoundingClientRect().top + scrollY)) / (deck.offsetHeight - innerHeight);
  });
  expect(p).toBeGreaterThan(0.4);
  expect(p).toBeLessThan(0.6);
});

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });
  test("lista normal", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await expect(page.locator("[data-deck]")).not.toHaveAttribute("data-deck-on");
    const positions = await page.locator("[data-deck-card]").evaluateAll((els) => els.map((e) => getComputedStyle(e).position));
    expect(positions).toHaveLength(N);
    expect(positions.filter((p) => p === "absolute")).toEqual([]);
  });
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("lista normal", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-deck]")).not.toHaveAttribute("data-deck-on");
    const positions = await page.locator("[data-deck-card]").evaluateAll((els) => els.map((e) => getComputedStyle(e).position));
    expect(positions).toHaveLength(N);
    expect(positions.filter((p) => p === "absolute")).toEqual([]);
  });
});
