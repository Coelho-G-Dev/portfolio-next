import { expect, test } from "@playwright/test";
import { chapterEffect } from "../../lib/cortina";
import { siteCopy } from "../../lib/i18n/site";

const pt = siteCopy.pt;

test.beforeEach(async ({ page }) => {
  await page.route(/kaspersky-labs\.com/, route => route.abort());
  // Analytics e Speed Insights só existem na Vercel; localmente dariam 404.
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => localStorage.setItem("preferred-language", "pt"));
});

for (const id of ["contato", "sobre"]) {
  test(`link direto /#${id} chega ao título por cima`, async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("portfolio:lastScrollY", "900"));
    await page.goto(`/#${id}`);
    await expect(page.locator(`[data-chapter="sobre"]`)).toHaveAttribute("data-stick", "");
    await settle(page);
    const title = page.locator(`#${id} h2`).first();
    await expect(title).toBeInViewport();
    await expect.poll(() => title.evaluate(el => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    })).toBe(true);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await expect(title).toBeFocused();
    await page.reload();
    await expect(title).toBeInViewport();
  });
}

test("sem hash a visita começa no topo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-chapter="sobre"]')).toHaveAttribute("data-stick", "");
  await settle(page);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

// Depois do load o navegador ainda faz a própria rolagem até a âncora, e o
// ponto onde ela para muda com a largura (no celular, abaixo do topo em fluxo).
// Por isso o teste confere o que é nosso: a chegada ao hash não roda depois
// da ação da pessoa. Ela não leva a página ao topo em fluxo nem foca o título.
// Os scripts do Next chegam 1,5 s depois: a rolagem cai sempre antes da
// hidratação, como numa rede lenta (sem isso, o build local hidrata antes).
test("rolar antes de assentar não é desfeito pela chegada ao hash", async ({ page }) => {
  await page.route(/\/_next\/static\/chunks\/.+\.js$/, async route => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto("/#contato", { waitUntil: "domcontentloaded" });
  await page.mouse.wheel(0, -600);
  await page.waitForLoadState("load");
  await page.waitForTimeout(2200);
  await settle(page);
  const { y, arrival, focused } = await page.locator("#contato").evaluate(el => {
    const chapter = el.closest<HTMLElement>("[data-chapter]")!;
    const previous = chapter.style.position;
    chapter.style.position = "static";
    const top = el.getBoundingClientRect().top + scrollY;
    chapter.style.position = previous;
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    return { y: scrollY, arrival: Math.max(0, top - margin), focused: document.activeElement === el.querySelector("h2") };
  });
  expect(focused).toBe(false);
  expect(Math.abs(y - arrival), `y=${y} chegada=${arrival}`).toBeGreaterThan(2);
});

test("o rodapé tem os cantos de cima iguais aos das folhas", async ({ page }) => {
  await page.goto("/");
  const corners = await page.locator(".s-footer").evaluate(el => {
    const css = getComputedStyle(el);
    const chapter = getComputedStyle(document.querySelector('main > [data-chapter="derrube"]')!);
    return [css.borderTopLeftRadius, css.borderTopRightRadius, css.borderBottomLeftRadius, css.borderBottomRightRadius, chapter.borderTopLeftRadius];
  });
  expect(corners).toEqual(["32px", "32px", "0px", "0px", "32px"]);
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
  await page.goto("/");
  await expect(page.locator('[data-chapter="abertura"]')).toHaveCSS("position", "sticky");
  await expect(page.locator('[data-chapter="derrube"]')).toHaveCSS("position", "sticky");
});

test("o capítulo de trás encolhe e escurece quando é coberto", async ({ page }, info) => {
  test.skip(info.project.name === "phone-390", "no celular não há escala");
  await page.goto("/");
  await page.locator("#derrube h2").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const { scale, shade, top, stickTop } = await page.locator('[data-chapter="abertura"]').evaluate((el) => ({
    scale: Number(getComputedStyle(el).getPropertyValue("--scale") || 1),
    shade: Number(getComputedStyle(el).getPropertyValue("--shade") || 0),
    top: el.getBoundingClientRect().top,
    stickTop: parseFloat(getComputedStyle(el).getPropertyValue("--stick-top")),
  }));
  expect(scale).toBeLessThan(1);
  expect(shade).toBeGreaterThan(0);
  // Presa pela base, a folha afunda para o centro do trecho visível.
  const vh = page.viewportSize()!.height;
  expect(Math.abs(top - (stickTop * scale + vh / 2 * (1 - scale)))).toBeLessThan(1);
});

test("sem cobertura, nenhum capítulo tem transform", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-chapter="abertura"]')).toHaveAttribute("data-stick", "");
  const transforms = await page
    .locator("[data-chapter]")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
  expect(transforms.length).toBeGreaterThanOrEqual(5);
  expect(transforms.filter((t) => t !== "none")).toEqual([]);
});

// Como em site-projetos: a sala chegou quando o h3 dela recebe o foco.
async function focusedName(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return "<body>";
    return el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 80) ?? "";
  });
}

const readScale = (el: Element) => getComputedStyle(el).getPropertyValue("--scale").trim();

test("abrir uma porta não encolhe o Projetos no meio do caminho", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-1440", "só no desktop");
  await page.goto("/");
  const projetos = page.locator('[data-chapter="projetos"]');
  await expect(projetos).toHaveAttribute("data-stick", "");
  // O Como trabalho cobre 30% da tela.
  await page.locator('[data-chapter="trabalho"]').evaluate((el) =>
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * 0.7, behavior: "instant" }),
  );
  // Espera a suavização do scrub assentar.
  let last = "";
  await expect
    .poll(
      async () => {
        const now = await projetos.evaluate(readScale);
        const same = now === last && now !== "";
        last = now;
        return same;
      },
      { intervals: [200], timeout: 5_000 },
    )
    .toBe(true);
  const before = last;
  expect(Number(before)).toBeLessThan(1);

  // Amostra o --scale a cada quadro enquanto a máquina das portas está ocupada.
  await projetos.evaluate((el) => {
    const w = window as unknown as { __scales: string[] };
    w.__scales = [];
    const tick = () => {
      if (el.querySelector(".s-portas[data-door-busy]")) w.__scales.push(getComputedStyle(el).getPropertyValue("--scale").trim());
      if (!el.querySelector("[data-door-panel]")) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.locator('#projetos .s-stage .s-door[data-door="backend"]').evaluate((el) => (el as HTMLElement).click());
  await expect(page.locator("#projetos .s-portas[data-door-busy]")).toHaveCount(1);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => focusedName(page), { timeout: 10_000 }).toBe("Back-end");

  const scales = await page.evaluate(() => (window as unknown as { __scales: string[] }).__scales);
  expect(scales.length).toBeGreaterThan(0);
  expect(new Set(scales)).toEqual(new Set([before]));

  // Depois da chegada, nada entre a sala e o capítulo está transformado.
  await expect
    .poll(() =>
      page.locator("#projetos [data-door-panel]").evaluate((el) => {
        const out: string[] = [];
        for (let n = el.parentElement; n; n = n.parentElement) {
          const t = getComputedStyle(n).transform;
          if (t !== "none") out.push(`${n.tagName}.${n.className}: ${t}`);
          if (n.matches("[data-chapter]")) break;
        }
        return out;
      }),
    )
    .toEqual([]);
});

// WCAG 2.4.11: com o capítulo grudado e o seguinte cobrindo metade da tela,
// Shift+Tab a partir do seguinte leva o foco ao último focável do capítulo,
// que fica no pé dele: ele tem de acabar à vista, sem folha por cima.
for (const [chapter, next] of [
  ["derrube", "projetos"],
  ["projetos", "trabalho"],
] as const) {
  test(`o foco no pé do ${chapter} não fica sob a folha seguinte`, async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(`[data-chapter="${chapter}"]`)).toHaveAttribute("data-stick", "");
    await page.locator(`[data-chapter="${next}"]`).evaluate((el) => {
      const html = document.documentElement;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight / 2);
      html.style.scrollBehavior = "";
      const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
      const first = Array.from(el.querySelectorAll<HTMLElement>(focusable)).find(
        (f) => f.getClientRects().length > 0 && !f.closest("[inert]"),
      )!;
      first.focus({ preventScroll: true });
    });
    await page.waitForTimeout(400);
    await page.keyboard.press("Shift+Tab");
    expect(await page.evaluate((c) => !!document.activeElement?.closest(`[data-chapter="${c}"]`), chapter)).toBe(true);
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const a = document.activeElement as HTMLElement;
            const r = a.getBoundingClientRect();
            const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return !!hit && a.contains(hit);
          }),
        { timeout: 5_000 },
      )
      .toBe(true);
  });
}

// Alguns navegadores (o Firefox) deixam o foco no link depois de navegar para
// a âncora. O link fica na abertura, sob todas as folhas: a guarda do foco não
// pode puxar a página de volta para ele.
test("a âncora do Sobre não é desfeita pelo foco que fica no link", async ({ page }, info) => {
  test.skip(info.project.name === "phone-390", "no celular o menu fecha e o link some");
  await page.goto("/");
  await expect(page.locator('[data-chapter="abertura"]')).toHaveAttribute("data-stick", "");
  const link = page.locator("#s-nav-links").getByRole("link", { name: pt.nav.links[2].label, exact: true });
  await link.click();
  await link.evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }));
  await settle(page);
  await page.waitForTimeout(600);
  await settle(page);
  expect(await link.evaluate((el) => document.activeElement === el)).toBe(true);
  const title = page.locator("#sobre h2");
  await expect(title).toBeInViewport();
  const onTop = await title.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return !!document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest("#sobre");
  });
  expect(onTop).toBe(true);
});

test("medir de novo os capítulos avisa os trechos presos (cortina:relayout)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-chapter="derrube"]')).toHaveAttribute("data-stick", "");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const w = window as unknown as { __relayouts: number };
    w.__relayouts = 0;
    window.addEventListener("cortina:relayout", () => w.__relayouts++);
    const extra = document.createElement("div");
    extra.style.height = "300px";
    document.querySelector('[data-chapter="derrube"]')!.append(extra);
  });
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __relayouts: number }).__relayouts))
    .toBeGreaterThan(0);
});

test("redimensionar com um capítulo grudado não desloca nada", async ({ page }) => {
  await page.goto("/");
  const derrube = page.locator('[data-chapter="derrube"]');
  await expect(derrube).toHaveAttribute("data-stick", "");
  await derrube.evaluate((el: HTMLElement) =>
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + el.offsetHeight / 2, behavior: "instant" }),
  );
  await settle(page);
  await page.setViewportSize({ width: 1024, height: 700 });
  await settle(page);
  // --stick-top é o da janela nova (e não o da antiga).
  await expect
    .poll(() =>
      derrube.evaluate(
        (el: HTMLElement) => parseFloat(getComputedStyle(el).getPropertyValue("--stick-top")) - Math.min(0, innerHeight - el.offsetHeight),
      ),
    )
    .toBe(0);
});

// O refresh corta a suavização do scrub no meio: sem rolar mais nada, o véu
// do capítulo de trás tem de seguir a cobertura de agora.
test("redimensionar no meio da cobertura: o véu segue a cobertura de agora", async ({ page }) => {
  await page.goto("/");
  const projetos = page.locator('[data-chapter="projetos"]');
  await expect(projetos).toHaveAttribute("data-stick", "");
  // O Trabalho cobre metade da tela (sobe sem grudar: a caixa dá a posição).
  await page
    .locator('[data-chapter="trabalho"]')
    .evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight / 2, behavior: "instant" }));
  await settle(page);
  await page.waitForTimeout(600);
  const { width } = page.viewportSize()!;
  await page.setViewportSize({ width: Math.round(width * 0.8), height: 700 });
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const top = document.querySelector('[data-chapter="trabalho"]')!.getBoundingClientRect().top;
          const chapter = document.querySelector('[data-chapter="projetos"]')!;
          const shade = Number(getComputedStyle(chapter).getPropertyValue("--shade"));
          const veilOpacity = Number(getComputedStyle(chapter, "::after").opacity);
          return { cover: Math.min(1, Math.max(0, (innerHeight - top) / innerHeight)), compact: innerWidth <= 719, shade, veilOpacity };
        }).then(({ cover, compact, shade, veilOpacity }) => Math.max(
          Math.abs(shade - chapterEffect(cover, { compact, reduced: false }).shade),
          Math.abs(veilOpacity - shade),
        )),
      { timeout: 5_000 },
    )
    .toBeLessThan(0.01);
});

test("coberta a abertura, o vídeo do personagem pausa", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");
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
  await page.goto("/");
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

test("a âncora do Sobre chega por cima", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "phone-390") await page.getByRole("button", { name: pt.nav.menu }).click();
  await page.locator("#s-nav-links").getByRole("link", { name: pt.nav.links[2].label, exact: true }).click();
  await settle(page);
  const title = page.locator("#sobre h2");
  await expect(title).toBeInViewport();
  const onTop = await title.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit?.closest("#sobre");
  });
  expect(onTop).toBe(true);
});

test("a retração central expõe o fundo da Cortina sem deixar faixa fora da página", async ({ page }, info) => {
  test.skip(info.project.name === "phone-390", "no celular não há escala");
  await page.goto("/");
  const opening = page.locator('[data-chapter="abertura"]');
  await expect(opening).toHaveAttribute("data-stick", "");
  await opening.evaluate(el => window.scrollTo({
    top: Math.max(0, (el as HTMLElement).offsetHeight - innerHeight), behavior: "instant",
  }));
  await page.mouse.wheel(0, 450);
  const recess = (el: Element) => {
    const css = getComputedStyle(el);
    const scale = new DOMMatrixReadOnly(css.transform).a;
    const stick = Number.parseFloat(css.getPropertyValue("--stick-top")) || 0;
    return el.getBoundingClientRect().top - stick * scale;
  };
  await expect.poll(() => opening.evaluate(recess)).toBeGreaterThan(0);
  const top = await opening.evaluate(recess);
  const { viewport, inside, background } = await page.evaluate(() => ({
    viewport: innerHeight,
    inside: !!document.elementFromPoint(innerWidth / 2, 1)?.closest(".s-cortina"),
    background: getComputedStyle(document.querySelector(".s-cortina")!).backgroundColor,
  }));
  // A escala mínima de 0,93 recua no máximo 3,5% da viewport de cada lado
  // do centro. A faixa revelada pertence ao fundo opaco da própria Cortina.
  expect(top).toBeLessThanOrEqual(viewport * 0.035 + 1);
  expect(inside).toBe(true);
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
});

test("um capítulo só encolhe quando o seguinte já o cobre", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");
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
  await page.goto("/");
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
    await page.goto("/");
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
    await page.goto("/");
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
