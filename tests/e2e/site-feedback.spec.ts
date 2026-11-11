import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/kaspersky-labs\.com/, r => r.abort());
  await page.route("**/_vercel/**", r => r.fulfill({ status: 200, body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

test("o personagem retoma o olhar e esconde a fala enquanto o mouse continua se movendo", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440", "acompanhamento com mouse");
  const errors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error" && !/kaspersky|net::ERR_FAILED/.test(message.text())) errors.push(message.text());
  });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const char = page.locator(".s-char");
  await expect(char).toHaveAttribute("data-mode", "desktop");
  await page.mouse.move(20, 20);
  const olhar = char.locator('video[data-clip="olhar"]');
  await expect(olhar).toHaveAttribute("data-active", "true", { timeout: 1000 });
  await expect.poll(() => olhar.evaluate((v: HTMLVideoElement) => v.duration > 0)).toBe(true);
  await page.mouse.move(1400, 20);
  await expect.poll(() => olhar.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration)).toBeGreaterThan(0.85);
  const box = (await char.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.68, box.y + box.height * 0.5);
  await expect(page.locator(".s-char__bubble")).toBeVisible();
  // Movimento contínuo durante a fala reproduz o temporizador que nunca acabava.
  for (let i = 0; i < 45; i++) {
    await page.mouse.move(20 + i * 2, 20);
    await page.waitForTimeout(100);
  }
  await expect(page.locator(".s-char__bubble")).toHaveCount(0);
  await expect(olhar).toHaveAttribute("data-active", "true");
  expect(await page.locator("button button, button a[href]").count()).toBe(0);
  expect(errors).toEqual([]);
});

test("fechar pelo fim da sala recolhe o conteúdo só depois de chegar às portas", async ({ page }) => {
  await page.goto("/");
  const chapter = page.locator('[data-chapter="projetos"]');
  await expect(chapter).toHaveAttribute("data-stick", "");
  const scrollTo = async (selector: string) => page.locator(selector).evaluate(el => {
    const chapter = el.closest<HTMLElement>("[data-chapter]")!;
    const previous = chapter.style.position;
    chapter.style.position = "static";
    const top = el.getBoundingClientRect().top + scrollY;
    const chapterTop = chapter.getBoundingClientRect().top + scrollY;
    const stuckAt = chapterTop + Math.max(0, chapter.offsetHeight - innerHeight);
    chapter.style.position = previous;
    // Depois de grudar pela base, o botão deixa de subir e a folha seguinte
    // começa a cobri-lo. Não ultrapassar esse ponto ao preparar o clique.
    const target = top - (el.classList.contains("s-room__back--large") ? innerHeight / 2 : 0);
    window.scrollTo({ top: Math.min(target, stuckAt), behavior: "instant" });
  });
  await scrollTo(".s-stage");
  const door = page.locator('.s-door[data-door="backend"]');
  await expect.poll(() => door.evaluate(el => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
  })).toBe(true);
  await door.click();
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe("H3");
  let lastY = -1;
  await expect.poll(async () => {
    const y = await page.evaluate(() => scrollY);
    const settled = y === lastY;
    lastY = y;
    return settled;
  }, { intervals: [150] }).toBe(true);
  await expect.poll(() => chapter.evaluate(el => Math.abs(
    Number.parseFloat((el as HTMLElement).style.getPropertyValue("--stick-top")) - Math.min(0, innerHeight - (el as HTMLElement).offsetHeight),
  ))).toBeLessThan(1);
  await scrollTo('[data-door-panel="backend"] .s-room__back--large');
  await expect.poll(() => page.locator('.s-room__back--large').evaluate(el => {
    const r = el.getBoundingClientRect();
    return r.top > 0 && r.bottom < innerHeight;
  })).toBe(true);
  // Registra o primeiro quadro com a sala removida, antes da animação de volta.
  await page.evaluate(() => {
    const win = window as typeof window & { exitTop?: number };
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[data-door-panel="backend"]')) {
        win.exitTop = document.querySelector(".s-stage")!.getBoundingClientRect().top;
        observer.disconnect();
      }
    });
    observer.observe(document.querySelector(".s-portas")!, { childList: true, subtree: true });
  });
  const close = page.locator('.s-room__back--large');
  await expect.poll(() => close.evaluate(el => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
  })).toBe(true);
  const box = (await close.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(() => page.evaluate(() => (window as typeof window & { exitTop?: number }).exitTop !== undefined)).toBe(true);
  const top = await page.evaluate(() => (window as typeof window & { exitTop?: number }).exitTop!);
  expect(Math.abs(top)).toBeLessThan(2);
  await expect(door).toBeFocused();
});

test("a folha afunda para o centro do trecho visível", async ({ page }, info) => {
  test.skip(info.project.name === "phone-390", "celular não usa escala");
  await page.goto("/");
  const opening = page.locator('[data-chapter="abertura"]');
  await expect(opening).toHaveAttribute("data-stick", "");
  await page.locator('[data-chapter="derrube"]').evaluate(el => {
    const previous = (el as HTMLElement).style.position;
    (el as HTMLElement).style.position = "static";
    const top = el.getBoundingClientRect().top + scrollY - innerHeight * 0.5;
    (el as HTMLElement).style.position = previous;
    scrollTo({ top, behavior: "instant" });
  });
  await expect.poll(() => opening.evaluate(el => Number(getComputedStyle(el).getPropertyValue("--scale")))).toBeLessThan(0.99);
  const center = await opening.evaluate(el => {
    const css = getComputedStyle(el);
    const origin = Number.parseFloat(css.transformOrigin.split(" ")[1]);
    return origin + Number.parseFloat(css.getPropertyValue("--stick-top")) - innerHeight / 2;
  });
  expect(Math.abs(center)).toBeLessThan(1);
});
