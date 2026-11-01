import { expect, test, type Page } from "@playwright/test";
import { siteCopy } from "../../lib/i18n/site";

const pt = siteCopy.pt;
// Antivírus que injetam scripts no navegador (o Kaspersky desta máquina) não são erro do site.
const FOREIGN = /kaspersky-labs\.com/;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && !FOREIGN.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test.beforeEach(async ({ page }) => {
  // Analytics e Speed Insights só existem na Vercel; localmente dariam 404.
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

test('o h1 é "Gabriel Coelho"', async ({ page }) => {
  await page.goto("/novo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Gabriel Coelho");
});

test("as pílulas de projeto e de vaga abrem o e-mail com assuntos diferentes", async ({ page }) => {
  await page.goto("/novo");
  const hero = page.locator("#inicio");
  const project = await hero.getByRole("link", { name: pt.hero.project }).getAttribute("href");
  const role = await hero.getByRole("link", { name: pt.hero.role }).getAttribute("href");
  expect(project).toMatch(/^mailto:/);
  expect(role).toMatch(/^mailto:/);
  expect(project).not.toBe(role);
});

test("não há rolagem horizontal", async ({ page }) => {
  await page.goto("/novo");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe("com movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("nenhum vídeo carrega e o poster aparece", async ({ page }) => {
    await page.goto("/novo");
    await expect(page.locator(".s-char")).toHaveAttribute("data-mode", "reduced");
    await expect(page.locator(".s-char video[src]")).toHaveCount(0);
    await expect(page.locator(".s-char__poster")).toBeVisible();
  });
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("texto completo, pílulas, poster e links do menu visíveis", async ({ page }) => {
    await page.goto("/novo");
    const hero = page.locator("#inicio");
    await expect(hero.locator(".s-typed__shown")).toHaveText(pt.hero.intro);
    for (const name of [pt.hero.seeWork, pt.hero.project, pt.hero.role]) {
      await expect(hero.getByRole("link", { name })).toBeVisible();
    }
    await expect(hero.getByRole("link", { name: /@/ })).toBeVisible();
    await expect(page.locator(".s-char__poster")).toBeVisible();
    // No celular, os links do menu não podem ficar presos atrás do botão "Menu".
    for (const link of pt.nav.links) {
      await expect(page.locator(`#s-nav-links a[href="${link.href}"]`)).toBeVisible();
    }
  });
});

test("vídeo quebrado: o poster continua e o console fica limpo", async ({ page }) => {
  const errors = collectErrors(page);
  await page.route("**/hero/*.mp4", (route) => route.abort());
  await page.goto("/novo");
  await page.waitForTimeout(2500);
  await expect(page.locator(".s-char__poster")).toBeVisible();
  await expect(page.locator(".s-char video")).toHaveCount(0);
  // O navegador registra o próprio aborto da requisição; erro do site é o resto.
  expect(errors.filter((e) => !/ERR_FAILED|net::/.test(e))).toEqual([]);
});

test("desktop: o mouse move o Olhar e dois cliques rápidos tocam uma só reação", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440", "scrub só existe com mouse");
  await page.goto("/novo");
  const char = page.locator(".s-char");
  await expect(char).toHaveAttribute("data-mode", "desktop");
  const olhar = char.locator('video[data-clip="olhar"]');
  await expect(olhar).toHaveAttribute("data-active", "true", { timeout: 10_000 });

  const time = () => olhar.evaluate((v: HTMLVideoElement) => v.currentTime);
  await page.mouse.move(2, 300);
  await page.waitForTimeout(800);
  const left = await time();
  await page.mouse.move(1430, 300);
  await page.waitForTimeout(800);
  const right = await time();
  expect(right - left).toBeGreaterThan(1);

  const box = (await char.boundingBox())!;
  const x = box.x + box.width * 0.68;
  const y = box.y + box.height * 0.5;
  await page.mouse.click(x, y);
  await page.mouse.click(x, y);
  await page.waitForTimeout(900);
  await expect(char.locator("video[data-active]")).toHaveCount(1);
  await expect(char.locator("video[data-active]")).toHaveAttribute("data-clip", /hover|clique/);
});

test("celular: um toque no personagem mostra uma reação", async ({ page }, info) => {
  test.skip(info.project.name !== "phone-390", "modo toque");
  await page.goto("/novo");
  const char = page.locator(".s-char");
  await expect(char).toHaveAttribute("data-mode", "touch");
  await expect(char.locator('video[data-clip="loop"]')).toHaveAttribute("data-active", "true", { timeout: 10_000 });
  await char.tap();
  await expect(char.locator('video[data-active][data-clip^="clique"]')).toHaveCount(1, { timeout: 6_000 });
});
