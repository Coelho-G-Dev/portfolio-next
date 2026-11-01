import { expect, test } from "@playwright/test";
import { siteCopy } from "../../lib/i18n/site";

const pt = siteCopy.pt;

test.beforeEach(async ({ page }) => {
  // Analytics e Speed Insights só existem na Vercel; localmente dariam 404.
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

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
  const end = page.locator("#derrube [data-derrube-end]");
  await end.evaluate((el) => el.scrollIntoView({ block: "end" }));
  await page.waitForTimeout(300);
  const endBottom = await end.evaluate((el) => el.getBoundingClientRect().bottom);
  const nextTop = await page.locator('[data-chapter="projetos"]').evaluate((el) => el.getBoundingClientRect().top);
  expect(nextTop).toBeGreaterThanOrEqual(endBottom - 1);
});

test("a âncora do menu deixa o título do destino visível e por cima", async ({ page }, info) => {
  await page.goto("/novo");
  if (info.project.name === "phone-390") await page.getByRole("button", { name: pt.nav.menu }).click();
  await page.locator("#s-nav-links").getByRole("link", { name: pt.nav.links[3].label, exact: true }).click();
  const title = page.locator("#contato h2");
  await expect(title).toBeInViewport();
  const onTop = await title.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit?.closest("#contato");
  });
  expect(onTop).toBe(true);
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
