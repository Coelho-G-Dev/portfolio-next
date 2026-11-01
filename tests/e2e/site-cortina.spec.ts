import { expect, test } from "@playwright/test";
import { siteCopy } from "../../lib/i18n/site";

const pt = siteCopy.pt;

test.beforeEach(async ({ page }) => {
  // Analytics e Speed Insights só existem na Vercel; localmente dariam 404.
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

// A página usa rolagem suave (globals.css): espera a rolagem parar antes de medir.
async function settle(page: import("@playwright/test").Page) {
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) return;
    last = y;
    await page.waitForTimeout(100);
  }
}

test("com JavaScript, os capítulos grudam (sticky)", async ({ page }) => {
  await page.goto("/novo");
  await expect(page.locator('[data-chapter="abertura"]')).toHaveCSS("position", "sticky");
  await expect(page.locator('[data-chapter="derrube"]')).toHaveCSS("position", "sticky");
});

test("o capítulo de trás encolhe e escurece quando é coberto", async ({ page }, info) => {
  test.skip(info.project.name === "phone-390", "no celular não há escala");
  await page.goto("/novo");
  await page.locator("#derrube h2").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const scale = await page
    .locator('[data-chapter="abertura"]')
    .evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--scale")));
  expect(scale).toBeLessThan(1);
});

test("coberta a abertura, o vídeo do personagem pausa", async ({ page }) => {
  await page.goto("/novo");
  const char = page.locator(".s-char");
  await expect(char).not.toHaveAttribute("data-mode", "pending");
  test.skip((await char.getAttribute("data-mode")) === "desktop", "no desktop o Olhar não toca, é scrub");
  await expect(char.locator('video[data-clip="loop"]')).toHaveAttribute("data-active", "true", { timeout: 10_000 });
  await expect.poll(() => char.locator("video[data-active]").evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.locator("#derrube h2").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => char.locator("video[data-active]").evaluate((v: HTMLVideoElement) => v.paused), { timeout: 2000 })
    .toBe(true);
});

test("capítulo mais alto que a tela: o seguinte só cobre depois da base aparecer", async ({ page }) => {
  await page.goto("/novo");
  await page.evaluate(() => document.fonts.ready);
  // Em qualquer momento em que a última linha do Derrube está na tela, o
  // capítulo seguinte ainda não a cobre. Repete até o layout assentar.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const end = document.querySelector("#derrube [data-derrube-end]")!;
        end.scrollIntoView({ block: "end", behavior: "instant" });
        const endBottom = end.getBoundingClientRect().bottom;
        const nextTop = document.querySelector('[data-chapter="projetos"]')!.getBoundingClientRect().top;
        return nextTop >= endBottom - 1;
      }),
    )
    .toBe(true);
});

test("a âncora do menu deixa o título do destino visível e por cima", async ({ page }, info) => {
  await page.goto("/novo");
  if (info.project.name === "phone-390") await page.getByRole("button", { name: pt.nav.menu }).click();
  await page.locator("#s-nav-links").getByRole("link", { name: pt.nav.links[3].label, exact: true }).click();
  await settle(page);
  const title = page.locator("#contato h2");
  await expect(title).toBeInViewport();
  const onTop = await title.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit?.closest("#contato");
  });
  expect(onTop).toBe(true);
});

test("cobrindo a abertura, o topo da tela continua sendo a abertura (sem faixa vazia)", async ({ page }, info) => {
  test.skip(info.project.name === "phone-390", "no celular não há escala");
  await page.goto("/novo");
  await page.mouse.wheel(0, 450);
  await page.waitForTimeout(500);
  const topHit = await page.evaluate(() => !!document.elementFromPoint(innerWidth / 2, 4)?.closest('[data-chapter="abertura"]'));
  expect(topHit).toBe(true);
});

test("um capítulo só encolhe quando o seguinte já o cobre", async ({ page }) => {
  await page.goto("/novo");
  await page.locator('[data-chapter="derrube"]').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
  await page.waitForTimeout(400);
  const derrube = page.locator('[data-chapter="derrube"]');
  const { scale, nextTop, vh } = await derrube.evaluate((el) => ({
    scale: Number(getComputedStyle(el).getPropertyValue("--scale") || 1),
    nextTop: document.querySelector('[data-chapter="projetos"]')!.getBoundingClientRect().top,
    vh: innerHeight,
  }));
  // Todo capítulo ocupa ao menos a tela: com o Derrube no topo, o seguinte
  // ainda não entrou e nada encolheu.
  expect(nextTop).toBeGreaterThanOrEqual(vh - 1);
  expect(scale).toBeCloseTo(1, 3);
});

test("o rodapé fica por cima da abertura grudada", async ({ page }) => {
  await page.goto("/novo");
  // A página ainda cresce depois do load (fontes, Derrube interativo); a cada
  // tentativa, rola até o fim de verdade e só então confere o rodapé.
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() =>
      page.evaluate(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
        if (Math.round(document.documentElement.scrollHeight - innerHeight - scrollY) !== 0) return false;
        const el = document.querySelector(".s-footer")!;
        const r = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
      }),
    )
    .toBe(true);
});

test("a âncora de Projetos chega sem o destino estar coberto", async ({ page }, info) => {
  await page.goto("/novo");
  if (info.project.name === "phone-390") await page.getByRole("button", { name: pt.nav.menu }).click();
  await page.locator("#s-nav-links").getByRole("link", { name: pt.nav.links[0].label, exact: true }).click();
  await settle(page);
  const { onTop, scale } = await page.locator("#projetos h2").evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const chapter = el.closest("[data-chapter]")!;
    return { onTop: !!hit?.closest("#projetos"), scale: Number(getComputedStyle(chapter).getPropertyValue("--scale") || 1) };
  });
  expect(onTop).toBe(true);
  expect(scale).toBeCloseTo(1, 3);
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("nenhum capítulo gruda", async ({ page }) => {
    await page.goto("/novo");
    const positions = await page
      .locator("[data-chapter]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).position));
    expect(positions.length).toBeGreaterThanOrEqual(5);
    expect(positions.filter((p) => p === "sticky")).toEqual([]);
  });
});

test.describe("com movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("o capítulo de trás não escala nem escurece", async ({ page }) => {
    await page.goto("/novo");
    await page.locator("#derrube h2").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const { transform, shade } = await page.locator('[data-chapter="abertura"]').evaluate((el) => ({
      transform: getComputedStyle(el).transform,
      shade: getComputedStyle(el, "::after").opacity,
    }));
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(transform);
    expect(Number(shade)).toBe(0);
  });
});
