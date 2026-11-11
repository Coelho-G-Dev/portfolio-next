import { expect, test, type Page } from "@playwright/test";
import { siteCopy } from "../../lib/i18n/site";
import { frameForPos } from "../../lib/gazeCurve";
import { aimFrom, eyesOnScreen } from "../../lib/character";
import hero from "../../public/hero/manifest.json";

const pt = siteCopy.pt;
// Antivírus que injetam scripts no navegador (o Kaspersky desta máquina) não são erro do site.
const FOREIGN = /kaspersky-labs\.com/;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && !FOREIGN.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

// Onde os olhos do personagem estão na tela: o olhar é medido a partir deles.
async function eyesOf(page: Page) {
  const { box, pos } = await page.locator(".s-char").evaluate(el => {
    const r = el.getBoundingClientRect();
    const v = el.querySelector<HTMLVideoElement>('video[data-clip="olhar"]')!;
    return { box: { left: r.left, top: r.top, width: r.width, height: r.height }, pos: getComputedStyle(v).objectPosition };
  });
  const [x, y] = pos.split(" ").map(v => parseFloat(v) / 100);
  return eyesOnScreen(box, hero, { x, y });
}

// Movimento sem passar pela caixa do personagem (que dispara o hover): só o
// olhar recebe o evento, como um cursor vindo de fora.
const pointerAt = (page: Page, x: number, y: number) =>
  page.evaluate(([x, y]) => window.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y })), [x, y]);

test.beforeEach(async ({ page }) => {
  await page.route(/kaspersky-labs\.com/, r => r.abort());
  // Analytics e Speed Insights só existem na Vercel; localmente dariam 404.
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

test("desktop: curva apresentada e G5 sem seeks redundantes", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440", "scrub com mouse");
  await page.goto("/");
  const char = page.locator(".s-char"), vertical = char.locator('video[data-clip="olhar-v"]');
  await expect(char).toHaveAttribute("data-mode", "desktop");
  const eyes = await eyesOf(page);
  const view = page.viewportSize()!;
  // Na faixa do menu, logo acima dos olhos: fora da caixa, olha para cima.
  await page.mouse.move(eyes.x, 20);
  await expect(vertical).toHaveAttribute("data-active", "true");
  await expect.poll(() => vertical.evaluate((v: HTMLVideoElement) => v.seeking)).toBe(false);
  await page.evaluate(() => {
    const v = document.querySelector<HTMLVideoElement>('video[data-clip="olhar-v"]')!;
    const audit = { seeks: [] as number[], times: [] as number[], presented: -1 };
    (window as typeof window & { gazeAudit: typeof audit }).gazeAudit = audit;
    v.addEventListener("seeking", () => { audit.times.push(v.currentTime); audit.seeks.push(Math.floor(v.currentTime * 24)); });
    const cb: VideoFrameRequestCallback = (_now, meta) => { audit.presented = Math.round(meta.mediaTime * 24); v.requestVideoFrameCallback(cb); };
    v.requestVideoFrameCallback(cb);
  });
  // Varredura na vertical dos olhos: mede o scrub, a reação tem teste próprio.
  for (let i = 0; i < 60; i++) {
    await pointerAt(page, eyes.x, 20 + i / 59 * (view.height - 40));
    await page.waitForTimeout(24);
  }
  // Na vertical dos olhos, x não induz o eixo H; o alvo sai de y medido a partir deles.
  for (const y of [0.05, 0.25, 0.5, 0.75, 0.95]) {
    await pointerAt(page, eyes.x, y * view.height);
    const target = aimFrom(eyes.x, y * view.height, eyes, view).y;
    const expected = frameForPos(target, hero.olharVFrames, hero.olharVNeutral, hero.olharVCurve);
    await expect(vertical).toHaveAttribute("data-active", "true");
    await expect.poll(async () => Math.abs(await page.evaluate(() => (window as typeof window & { gazeAudit: { presented: number } }).gazeAudit.presented) - expected), { timeout: 5000 }).toBeLessThanOrEqual(1);
    await expect.poll(() => vertical.evaluate((v: HTMLVideoElement) => Math.floor(v.currentTime * 24))).toBe(expected);
  }
  const count = () => page.evaluate(() => (window as typeof window & { gazeAudit: { seeks: number[] } }).gazeAudit.seeks.length);
  const before = await count();
  await page.waitForTimeout(500);
  expect(await count()).toBe(before);
  const audit = await page.evaluate(() => (window as typeof window & { gazeAudit: { seeks: number[]; times: number[]; presented: number } }).gazeAudit);
  expect(audit.seeks.length).toBeGreaterThan(20);
  expect(audit.seeks.slice(1).filter((k, i) => k === audit.seeks[i])).toEqual([]);
  for (const time of audit.times) expect(Math.abs(time - (Math.floor(time * 24) + 0.5) / 24)).toBeLessThan(0.001);
  await info.attach("gaze-audit", { body: JSON.stringify(audit), contentType: "application/json" });
});

test("desktop: a cabeça olha para cima e para baixo sem girar o plano", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440", "scrub com mouse");
  await page.goto("/");
  const char = page.locator(".s-char");
  await expect(char).toHaveAttribute("data-mode", "desktop");
  const vertical = char.locator('video[data-clip="olhar-v"]');
  const eyes = await eyesOf(page);
  await page.mouse.move(eyes.x, 20);
  await expect(vertical).toHaveAttribute("data-active", "true");
  await expect.poll(() => vertical.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration)).toBeLessThan(0.15);
  await expect(vertical).toHaveCSS("transform", "none");
  // Abaixo dos olhos é a caixa do personagem: o evento evita o hover.
  await pointerAt(page, eyes.x, page.viewportSize()!.height - 5);
  await expect.poll(async () => vertical.getAttribute("data-active")).toBe("true");
  await expect.poll(() => vertical.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration)).toBeGreaterThan(0.85);
  await expect(vertical).toHaveCSS("transform", "none");
  await pointerAt(page, page.viewportSize()!.width - 5, eyes.y);
  const horizontal = char.locator('video[data-clip="olhar"]');
  await expect(horizontal).toHaveAttribute("data-active", "true");
  await expect(horizontal).toHaveCSS("transform", "none");
});

// Retorno do Gabriel (09/11): com o cursor ao lado do personagem, ele olhava
// para cima ou para baixo, porque o olhar era medido do centro da janela.
test("desktop: cursor ao lado do rosto ou do peito olha para o lado", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440", "scrub com mouse");
  await page.goto("/");
  const char = page.locator(".s-char");
  await expect(char).toHaveAttribute("data-mode", "desktop");
  const horizontal = char.locator('video[data-clip="olhar"]');
  const vertical = char.locator('video[data-clip="olhar-v"]');
  const eyes = await eyesOf(page);
  await page.mouse.move(eyes.x, 20);
  await expect(vertical).toHaveAttribute("data-active", "true");
  for (const [x, y] of [[eyes.x - 330, eyes.y], [eyes.x - 330, eyes.y + 360], [300, 120], [300, 700]]) {
    await pointerAt(page, x, y);
    await expect(horizontal, `${x},${y}`).toHaveAttribute("data-active", "true");
    await expect(vertical, `${x},${y}`).not.toHaveAttribute("data-active");
    await expect.poll(() => horizontal.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration), { message: `${x},${y}` }).toBeLessThan(0.45);
  }
  // Nos olhos, a pose do meio.
  await pointerAt(page, eyes.x, eyes.y);
  await expect.poll(() => horizontal.evaluate((v: HTMLVideoElement) => Math.abs(v.currentTime / v.duration - 0.5))).toBeLessThan(0.03);
});

test("desktop: erro do clipe vertical mantém o personagem horizontal", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440", "scrub com mouse");
  await page.route("**/hero/olhar-v.mp4", route => route.abort());
  await page.goto("/");
  const char = page.locator(".s-char");
  await expect(char).toHaveAttribute("data-mode", "desktop");
  await page.mouse.move(720, 40);
  const horizontal = char.locator('video[data-clip="olhar"]');
  await expect(horizontal).toHaveAttribute("data-active", "true");
  await expect(char.locator("video")).not.toHaveCount(0);
  await page.mouse.move(1400, 450);
  await expect.poll(() => horizontal.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration)).toBeGreaterThan(0.85);
});

test("desktop: hover e olhar vertical nunca sobrepõem vídeos", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440");
  await page.goto("/");
  const char = page.locator(".s-char");
  const box = (await char.boundingBox())!;
  const eyes = await eyesOf(page);
  const vertical = char.locator('video[data-clip="olhar-v"]');
  await page.mouse.move(eyes.x, 20);
  await expect(vertical).toHaveAttribute("data-active", "true");
  await expect.poll(() => vertical.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration)).toBeLessThan(0.15);
  await page.evaluate(() => {
    const win = window as typeof window & { charOverlap?: number; stopCharAudit?: boolean };
    win.charOverlap = 0;
    const tick = () => {
      const visible = [...document.querySelectorAll(".s-char video")].filter(v => Number(getComputedStyle(v).opacity) > 0.01);
      if (visible.length > 1) win.charOverlap!++;
      if (!win.stopCharAudit) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(box.x + box.width * 0.68, box.y + box.height * 0.45);
    if (i === 0) {
      const hover = char.locator('video[data-clip="hover"]');
      await expect(hover).toHaveAttribute("data-active", "true");
      const time = await hover.evaluate((v: HTMLVideoElement) => v.currentTime);
      await page.mouse.move(box.x + box.width * 0.70, box.y + box.height * 0.40);
      await expect(hover).toHaveAttribute("data-active", "true");
      await expect.poll(() => hover.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(time + 0.15);
    }
    await page.waitForTimeout(150);
    // Sai pela faixa do menu (olha para cima) ou pela esquerda (olha para o lado).
    if (i % 2) await page.mouse.move(eyes.x, 20);
    else await page.mouse.move(box.x - 20, eyes.y);
    await page.waitForTimeout(150);
  }
  await page.mouse.move(eyes.x, 20);
  await expect(vertical).toHaveAttribute("data-active", "true");
  await expect.poll(() => vertical.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration)).toBeLessThan(0.15);
  const overlap = await page.evaluate(() => {
    const win = window as typeof window & { charOverlap?: number; stopCharAudit?: boolean };
    win.stopCharAudit = true;
    return win.charOverlap;
  });
  expect(overlap).toBe(0);
});

test('o h1 é "Gabriel Coelho"', async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Gabriel Coelho");
});

test("as pílulas de projeto e de vaga abrem o e-mail com assuntos diferentes", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("#inicio");
  const project = await hero.getByRole("link", { name: pt.hero.project }).getAttribute("href");
  const role = await hero.getByRole("link", { name: pt.hero.role }).getAttribute("href");
  expect(project).toMatch(/^mailto:/);
  expect(role).toMatch(/^mailto:/);
  expect(project).not.toBe(role);
});

test("não há rolagem horizontal", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe("com movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("nenhum vídeo carrega e o poster aparece", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".s-char")).toHaveAttribute("data-mode", "reduced");
    await expect(page.locator(".s-char video[src]")).toHaveCount(0);
    await expect(page.locator(".s-char__poster")).toBeVisible();
  });
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("texto completo, pílulas, poster e links do menu visíveis", async ({ page }) => {
    await page.goto("/");
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
  await page.goto("/");
  await page.waitForTimeout(2500);
  await expect(page.locator(".s-char__poster")).toBeVisible();
  await expect(page.locator(".s-char video")).toHaveCount(0);
  // O navegador registra o próprio aborto da requisição; erro do site é o resto.
  expect(errors.filter((e) => !/ERR_FAILED|net::/.test(e))).toEqual([]);
});

test("desktop: o mouse move o Olhar e dois cliques rápidos tocam uma só reação", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440", "scrub só existe com mouse");
  await page.goto("/");
  const char = page.locator(".s-char");
  await expect(char).toHaveAttribute("data-mode", "desktop");
  const olhar = char.locator('video[data-clip="olhar"]');
  await expect(olhar).toHaveAttribute("data-active", "true", { timeout: 10_000 });

  // O scrub é medido com o cursor na faixa do menu (y = 20), fora do
  // personagem, para não disparar o hover. A pose neutra fica na metade.
  const time = () => olhar.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration);
  await page.mouse.move(2, 20);
  await page.waitForTimeout(800);
  expect(await time()).toBeLessThan(0.15);
  await page.mouse.move(1430, 20);
  await page.waitForTimeout(800);
  expect(await time()).toBeGreaterThan(0.85);

  // Entrar no personagem toca o hover; depois de ele voltar ao Olhar, dois
  // cliques seguidos tocam exatamente uma reação de clique.
  const box = (await char.boundingBox())!;
  const x = box.x + box.width * 0.68;
  const y = box.y + box.height * 0.5;
  await page.mouse.move(x, y);
  await expect(char.locator('video[data-active][data-clip="hover"]')).toHaveCount(1, { timeout: 5_000 });
  // O cursor parou no peito, logo abaixo do rosto: de volta ao Olhar, olha para baixo.
  await expect(char.locator('video[data-clip="olhar-v"]')).toHaveAttribute("data-active", "true", { timeout: 8_000 });
  await page.mouse.click(x, y);
  await page.mouse.click(x, y);
  await page.waitForTimeout(900);
  await expect(char.locator("video[data-active]")).toHaveCount(1);
  await expect(char.locator("video[data-active]")).toHaveAttribute("data-clip", /^clique/);
});

test("celular: um toque no personagem mostra uma reação", async ({ page }, info) => {
  test.skip(info.project.name !== "phone-390", "modo toque");
  await page.goto("/");
  const char = page.locator(".s-char");
  await expect(char).toHaveAttribute("data-mode", "touch");
  await expect(char.locator('video[data-clip="loop"]')).toHaveAttribute("data-active", "true", { timeout: 10_000 });
  await char.tap();
  await expect(char.locator('video[data-active][data-clip^="clique"]')).toHaveCount(1, { timeout: 6_000 });
});
