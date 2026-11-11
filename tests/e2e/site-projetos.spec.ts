import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
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
    if (!el || el === document.body) return "<body>";
    return el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 80) ?? "";
  });
}

async function tabTo(page: Page, name: string, back = false, limit = 100) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press(back ? "Shift+Tab" : "Tab");
    if ((await focusedName(page)) === name) return;
  }
  throw new Error(`"${name}" não foi alcançado com ${back ? "Shift+Tab" : "Tab"}`);
}

// A página usa rolagem suave (globals.css): espera a rolagem parar.
async function settle(page: Page) {
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) return;
    last = y;
    await page.waitForTimeout(100);
  }
}

async function openProjetos(page: Page, path = "/") {
  await page.goto(path);
  await page
    .locator('[data-chapter="projetos"]')
    .evaluate((el) =>
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
  await settle(page);
  await page.locator("#projetos h2").evaluate((el) => {
    el.setAttribute("tabindex", "-1");
    (el as HTMLElement).focus();
  });
}

const doorButton = (page: Page, id: string) => page.locator(`#projetos .s-stage .s-door[data-door="${id}"]`);
const room = (page: Page, id: string) => page.locator(`#projetos .s-portas > div > [data-door-panel="${id}"]`);

// A sala chegou: o h3 dela está focado (o foco só vai para ele no fim da entrada).
async function arrived(page: Page, name: string) {
  await expect.poll(() => focusedName(page), { timeout: 10_000 }).toBe(name);
}

// Carrossel: espera o deslize (transição CSS da fila) acabar com a porta no meio da tela.
async function centered(page: Page, id: string) {
  await expect
    .poll(
      () =>
        doorButton(page, id).evaluate((el) => {
          const r = el.getBoundingClientRect();
          const sliding = el.parentElement!.getAnimations().length > 0;
          return !sliding && Math.abs(r.left + r.width / 2 - innerWidth / 2) < 2;
        }),
      { timeout: 5_000 },
    )
    .toBe(true);
}

// Caixas que param de mudar entre duas leituras seguidas (layout assentado).
async function settledBoxes(locators: Locator[]) {
  let last = "";
  await expect
    .poll(
      async () => {
        const now = JSON.stringify(await Promise.all(locators.map((l) => l.boundingBox())));
        const same = now === last && !now.includes("null");
        last = now;
        return same;
      },
      { intervals: [100], timeout: 5_000 },
    )
    .toBe(true);
  return JSON.parse(last) as Box[];
}

type Box = { x: number; y: number; width: number; height: number };

const IDENTITY = new Set(["none", "matrix(1, 0, 0, 1, 0, 0)"]);

test('"Ver projetos" leva ao h2 e o destaque do Cidade Energia está visível sem abrir porta', async ({
  page,
}) => {
  await page.goto("/");
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

test("teclado: abre IA (3 h4, hash) e fecha com Esc; abre Back-end, abre Tela cheia (dialog) e fecha com Esc", async ({
  page,
}) => {
  await openProjetos(page);

  const iaBtnName = p.open(p.doors.ia.name);
  await tabTo(page, iaBtnName);
  await page.keyboard.press("Enter");

  await arrived(page, "IA");
  await expect(room(page, "ia").getByRole("heading", { level: 3, name: "IA" })).toBeVisible();
  await expect(room(page, "ia").locator("h4")).toHaveCount(3);
  expect(await page.evaluate(() => location.hash)).toBe("#porta-ia");
  await expect(doorButton(page, "ia")).toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("Escape");
  await expect(room(page, "ia")).toHaveCount(0);
  await expect.poll(() => focusedName(page), { timeout: 10_000 }).toBe(iaBtnName);
  expect(await page.evaluate(() => location.hash)).toBe("");
  await expect(doorButton(page, "ia")).toHaveAttribute("aria-expanded", "false");

  // Abre Back-end e aciona "Tela cheia" por teclado.
  const backBtnName = p.open(p.doors.backend.name);
  await tabTo(page, backBtnName, true);
  await page.keyboard.press("Enter");
  await arrived(page, "Back-end");

  const backPanel = room(page, "backend");
  await expect(backPanel).toBeVisible();
  await tabTo(page, p.board.fullscreen);
  await page.keyboard.press("Enter");

  const dialog = backPanel.locator("dialog.s-board__dialog").first();
  await expect(dialog).toHaveAttribute("open", "");

  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect.poll(() => focusedName(page)).toBe(p.board.fullscreen);
  // A sala Back-end continua aberta depois de fechar o dialog.
  await expect(backPanel).toBeVisible();
});

test("mouse: Front-end abre com um projeto que tem métricas e pelo menos dois links", async ({
  page,
}, info) => {
  test.skip(info.project.name === "phone-390", "no celular a Front-end abre pelo carrossel (teste abaixo)");
  await openProjetos(page);
  await doorButton(page, "frontend").click();
  await arrived(page, "Front-end");

  const panel = room(page, "frontend");
  await expect(panel).toBeVisible();
  await expect(panel.locator("h4")).toHaveCount(2);
  expect(await panel.locator(".s-pcard__metric").count()).toBeGreaterThanOrEqual(1);
  expect(await panel.locator(".s-pcard__links a").count()).toBeGreaterThanOrEqual(2);
});

test("o Voltar do navegador fecha a sala e continua na página", async ({ page }) => {
  await openProjetos(page);
  await doorButton(page, "backend").evaluate((el) => (el as HTMLElement).click());
  await arrived(page, "Back-end");
  expect(await page.evaluate(() => location.hash)).toBe("#porta-backend");

  await page.goBack();
  await expect(room(page, "backend")).toHaveCount(0);
  await expect.poll(() => focusedName(page), { timeout: 10_000 }).toBe(p.open(p.doors.backend.name));
  const url = new URL(page.url());
  expect(url.pathname).toBe("/");
  expect(url.hash).toBe("");
  await expect(page.locator("#projetos .s-stage")).toBeVisible();
});

test("link direto #porta-backend abre a sala Back-end já aberta", async ({ page }) => {
  await page.goto("/#porta-backend");
  const panel = room(page, "backend");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { level: 3, name: "Back-end" })).toBeFocused();
  await expect(doorButton(page, "backend")).toHaveAttribute("aria-expanded", "true");
  // A cena fica escondida embaixo da sala, inerte.
  await expect(page.locator("#projetos .s-stage")).toBeHidden();
});

test("depois de chegar, a sala e os ancestrais até #projetos não têm transformação 3D nem perspectiva", async ({
  page,
}) => {
  await openProjetos(page);
  await doorButton(page, "backend").evaluate((el) => (el as HTMLElement).click());
  await arrived(page, "Back-end");

  const chain = await room(page, "backend").evaluate((el) => {
    const out: { tag: string; transform: string; perspective: string }[] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      out.push({ tag: `${n.tagName}.${n.className}`, transform: cs.transform, perspective: cs.perspective });
      if (n.id === "projetos") break;
    }
    return out;
  });
  expect(chain.at(-1)?.tag).toContain("SECTION");
  for (const c of chain) {
    expect(c.transform, c.tag).not.toContain("matrix3d");
    expect(c.perspective, c.tag).toBe("none");
  }
});

// O quadro final da caminhada e o primeiro quadro da sala real são o mesmo:
// a cena invisível fica no estado "chegou" embaixo da sala.
// A spec pede desktop-1440 e phone-390; roda também no tablet, que custa pouco.
test("quadro de chegada: prévia e sala batem (≤ 2 px) e a abertura cobre o palco inteiro", async ({ page }, info) => {
  await openProjetos(page);
  let screensCompared = 0;
  for (const [id, name] of [
    ["backend", "Back-end"],
    ["frontend", "Front-end"],
    ["ia", "IA"],
  ] as const) {
    if (info.project.name === "phone-390") {
      // Leva a porta à tela do carrossel pelo foco, como o teclado faria.
      await doorButton(page, id).focus();
      await centered(page, id);
    }
    await doorButton(page, id).evaluate((el) => (el as HTMLElement).click());
    await arrived(page, name);

    const frame = await page.evaluate((door) => {
      const stage = document.querySelector("#projetos .s-stage")!.getBoundingClientRect();
      // O que cai dentro do palco: é isso que o quadro de chegada mostra (a prévia
      // é cortada na altura do palco; a sala segue para baixo).
      const inFrame = (el: Element | null) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const x = Math.max(r.left, stage.left);
        const y = Math.max(r.top, stage.top);
        const w = Math.min(r.right, stage.right) - x;
        const h = Math.min(r.bottom, stage.bottom) - y;
        return w > 0 && h > 0 ? { x, y, width: w, height: h } : { x: 0, y: 0, width: 0, height: 0 };
      };
      const previewRoot = `#projetos .s-door[data-door="${door}"] .s-room--preview`;
      const realRoot = `#projetos [data-door-panel="${door}"]`;
      const parts = {
        title: [".s-room__title", "h3"],
        label: [".s-room__label", ".s-room__label"],
        teaser: [".s-room__teaser", ".s-room__teaser"],
        back: [".s-room__top + .s-room__back", ".s-room__top + .s-room__back"],
        card: [".s-pcard", ".s-pcard"],
        screen: [".s-pcard__screen", ".s-pcard__screen"],
      };
      const pairs = Object.fromEntries(
        Object.entries(parts).map(([name, [pre, real]]) => [
          name,
          {
            preview: inFrame(document.querySelector(`${previewRoot} ${pre}`)),
            real: inFrame(document.querySelector(`${realRoot} ${real}`)),
          },
        ]),
      );
      // A abertura da cena chegada (arco no topo: semicírculo de raio largura/2)
      // tem de conter os quatro cantos do palco: nada de madeira no quadro.
      const r = document.querySelector(`#projetos .s-door[data-door="${door}"] .s-door__reveal`)!.getBoundingClientRect();
      const rad = r.width / 2;
      const cx = r.left + rad;
      const cy = r.top + rad;
      const inside = (x: number, y: number) =>
        x >= r.left - 0.5 &&
        x <= r.right + 0.5 &&
        y <= r.bottom + 0.5 &&
        (y >= cy || Math.hypot(x - cx, y - cy) <= rad + 0.5);
      const corners = {
        topLeft: inside(stage.left, stage.top),
        topRight: inside(stage.right, stage.top),
        bottomLeft: inside(stage.left, stage.bottom),
        bottomRight: inside(stage.right, stage.bottom),
      };
      // Todos os cartões e todos os blocos de cada cartão, na ordem do DOM: a
      // prévia desenha o cartão inteiro, então nada pode surgir na troca.
      const BLOCKS = ".s-pcard, .s-pcard__more, .s-pcard__metrics, .s-pcard__links, .s-board";
      const all = (root: string) => Array.from(document.querySelectorAll(`${root} :is(${BLOCKS})`)).map(inFrame);
      const blocks = { preview: all(previewRoot), real: all(realRoot) };
      return { pairs, blocks, corners, reveal: { x: r.x, y: r.y, width: r.width, height: r.height }, stage: stage.toJSON() };
    }, id);

    expect(frame.corners, `${id}: ${JSON.stringify({ reveal: frame.reveal, stage: frame.stage })}`).toEqual({
      topLeft: true,
      topRight: true,
      bottomLeft: true,
      bottomRight: true,
    });
    for (const [name, { preview, real }] of Object.entries(frame.pairs)) {
      // A sala Back-end não tem prints: aí a prévia também não tem nenhum.
      if (name === "screen" && real === null) {
        expect(preview, `${id} screen: sem print na sala, sem print na prévia`).toBeNull();
        continue;
      }
      if (name === "screen") screensCompared++;
      expect(real, `${id} ${name}: a sala tem o elemento`).not.toBeNull();
      expect(preview, `${id} ${name}: a prévia tem o elemento`).not.toBeNull();
      for (const k of ["x", "y", "width", "height"] as const) {
        expect(
          Math.abs(preview![k] - real![k]),
          `${id} ${name} ${k}: ${JSON.stringify({ preview, real })}`,
        ).toBeLessThanOrEqual(2);
      }
    }
    expect(frame.blocks.preview.length, `${id}: mesmos blocos na prévia e na sala`).toBe(frame.blocks.real.length);
    frame.blocks.real.forEach((real, i) => {
      const preview = frame.blocks.preview[i];
      for (const k of ["x", "y", "width", "height"] as const) {
        expect(
          Math.abs(preview![k] - real![k]),
          `${id} bloco ${i} ${k}: ${JSON.stringify({ preview, real })}`,
        ).toBeLessThanOrEqual(2);
      }
    });
    // O título e o rótulo estão sempre no quadro (não são caixas vazias).
    expect(frame.pairs.title.real!.width, id).toBeGreaterThan(0);
    expect(frame.pairs.label.real!.width, id).toBeGreaterThan(0);

    await page.keyboard.press("Escape");
    await expect.poll(() => focusedName(page), { timeout: 10_000 }).toBe(p.open(p.doors[id].name));
  }
  expect(screensCompared, "pelo menos uma sala com print foi comparada").toBeGreaterThan(0);
});

test("redimensionar com a sala aberta e voltar: portas paradas e câmera sem transformação", async ({ page }) => {
  await openProjetos(page);
  const size = page.viewportSize()!;
  await doorButton(page, "ia").evaluate((el) => (el as HTMLElement).click());
  await arrived(page, "IA");

  // A miniatura acompanha o palco (ResizeObserver): é o sinal de que a cena,
  // escondida embaixo da sala, já mediu o tamanho novo.
  const resized = (width: number) =>
    expect
      .poll(() =>
        page.locator("#projetos .s-stage").evaluate((stage, w) => {
          const mini = stage.querySelector<HTMLElement>('.s-door[data-door="ia"] .s-door__mini');
          const sw = stage.getBoundingClientRect().width;
          return innerWidth === w && !!mini && Math.abs(parseFloat(mini.style.width) - sw) < 0.5;
        }, width),
      )
      .toBe(true);
  await page.setViewportSize({ width: size.width - 150, height: size.height - 100 });
  await resized(size.width - 150);
  await page.setViewportSize(size);
  await resized(size.width);

  await page.keyboard.press("Escape");
  await expect.poll(() => focusedName(page), { timeout: 10_000 }).toBe(p.open(p.doors.ia.name));

  // Dez quadros seguidos: tudo parado e em identidade.
  const frames = await page.locator("#projetos .s-stage").evaluate(
    (stage) =>
      new Promise<string[]>((resolve) => {
        const out: string[] = [];
        const tick = () => {
          const world = getComputedStyle(stage.querySelector(".s-world")!).transform;
          const leaves = Array.from(stage.querySelectorAll(".s-leaf")).map((l) => getComputedStyle(l).transform);
          out.push([world, ...leaves].join("|"));
          if (out.length < 10) requestAnimationFrame(tick);
          else resolve(out);
        };
        requestAnimationFrame(tick);
      }),
  );
  expect(new Set(frames).size, frames.join(" / ")).toBe(1);
  for (const t of frames[0].split("|")) expect(IDENTITY.has(t), t).toBe(true);
});

test("phone-390: carrossel 1 de 3 → próxima → 2 de 3 e abre a Front-end pela porta atual", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "phone-390", "o carrossel só existe no celular");
  await openProjetos(page);
  // O Projetos gruda pela base (Cortina): centrar o botão do carrossel, que
  // fica no pé do palco, passaria do ponto em que o capítulo gruda e o
  // seguinte o cobriria. Traz o palco inteiro à tela, como quem rola até as portas.
  // O toque marca a rolagem como da pessoa: sem ele, a guarda de foco da
  // Cortina a toma pela rolagem do foco posto no h2 e volta ao título.
  await page.locator("#projetos .s-stage").evaluate((el) => {
    window.dispatchEvent(new Event("touchstart"));
    el.scrollIntoView({ block: "end", behavior: "instant" });
  });
  const pos = page.locator("#projetos .s-carousel__pos");
  const carousel = page.locator("#projetos .s-carousel");
  await expect(pos).toHaveText("1 de 3");
  await centered(page, "backend");

  // Parado, o indicador sempre fala da porta que está no meio da tela.
  const steps = [
    [p.carousel.next, "frontend", "2 de 3"],
    [p.carousel.next, "ia", "3 de 3"],
    [p.carousel.prev, "frontend", "2 de 3"],
    [p.carousel.prev, "backend", "1 de 3"],
    [p.carousel.next, "frontend", "2 de 3"],
  ] as const;
  for (const [button, door, text] of steps) {
    await carousel.getByRole("button", { name: button }).click();
    await centered(page, door);
    await expect(pos).toHaveText(text);
  }

  const front = doorButton(page, "frontend");
  await front.click();
  await arrived(page, "Front-end");
  await expect(room(page, "frontend")).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe("#porta-frontend");
});

test("phone-390: Tab até a porta Front-end deixa ela no meio da tela (nada rola de lado)", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "phone-390", "o carrossel só existe no celular");
  await openProjetos(page);
  await tabTo(page, p.open(p.doors.frontend.name));
  await centered(page, "frontend");
  await expect(page.locator("#projetos .s-carousel__pos")).toHaveText("2 de 3");
  // Nem o palco nem nenhum ancestral (a .s-cortina tem overflow-x: hidden) rolou.
  const scrolled = await page.locator("#projetos .s-stage").evaluate((stage) => {
    const out: string[] = [];
    for (let n: Element | null = stage; n && n !== document.documentElement; n = n.parentElement) {
      if (n.scrollLeft !== 0) out.push(`${n.tagName}.${n.className}: ${n.scrollLeft}`);
    }
    if (window.scrollX !== 0) out.push(`window: ${window.scrollX}`);
    return out;
  });
  expect(scrolled).toEqual([]);
});

const intersects = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

test("phone-390: o Voltar da sala não cobre o rótulo; deitado, o nome da porta não cobre o carrossel", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "phone-390", "só no celular");
  await openProjetos(page);
  await doorButton(page, "frontend").focus();
  await centered(page, "frontend");
  await doorButton(page, "frontend").evaluate((el) => (el as HTMLElement).click());
  await arrived(page, "Front-end");
  const panel = room(page, "frontend");
  const back = (await panel.locator(".s-room__top ~ .s-room__back").boundingBox())!;
  const label = (await panel.locator(".s-room__label").boundingBox())!;
  expect(intersects(back, label), JSON.stringify({ back, label })).toBe(false);
  await page.keyboard.press("Escape");
  await expect.poll(() => focusedName(page), { timeout: 10_000 }).toBe(p.open(p.doors.frontend.name));

  await page.setViewportSize({ width: 599, height: 300 });
  await expect.poll(() => page.evaluate(() => innerWidth)).toBe(599);
  await centered(page, "frontend");
  const door = doorButton(page, "frontend");
  const controls = await page.locator("#projetos .s-carousel > *").all();
  const [name, jamb, wall, ...buttons] = await settledBoxes([
    door.locator(".s-door__label"),
    door.locator(".s-door__jamb"),
    page.locator("#projetos .s-wall"),
    ...controls,
  ]);
  for (const b of buttons) expect(intersects(name, b), JSON.stringify({ name, b })).toBe(false);
  // A porta cabe na parede.
  expect(jamb.y).toBeGreaterThanOrEqual(wall.y - 1);
  expect(jamb.y + jamb.height).toBeLessThanOrEqual(wall.y + wall.height + 1);
});

test("movimento reduzido: abrir não aplica translate3d no mundo em nenhum quadro", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openProjetos(page);
  await page.evaluate(() => {
    const w = window as unknown as { __samples: string[]; __stop: boolean };
    w.__samples = [];
    w.__stop = false;
    const tick = () => {
      const world = document.querySelector<HTMLElement>("#projetos .s-world");
      if (world) w.__samples.push(`${world.style.transform}|${getComputedStyle(world).transform}`);
      if (!w.__stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await doorButton(page, "backend").evaluate((el) => (el as HTMLElement).click());
  await arrived(page, "Back-end");
  await expect(room(page, "backend")).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect.poll(() => focusedName(page), { timeout: 10_000 }).toBe(p.open(p.doors.backend.name));

  const samples = await page.evaluate(() => {
    const w = window as unknown as { __samples: string[]; __stop: boolean };
    w.__stop = true;
    return w.__samples;
  });
  expect(samples.length).toBeGreaterThan(5);
  expect(samples.filter((s) => /translate3d|matrix3d/.test(s))).toEqual([]);
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("as três salas estão visíveis e nenhum botão de porta existe", async ({
    page,
  }) => {
    await page.goto("/");
    const s = page.locator("#projetos");
    await expect(s.locator('[data-door-panel="backend"]')).toBeVisible();
    await expect(s.locator('[data-door-panel="frontend"]')).toBeVisible();
    await expect(s.locator('[data-door-panel="ia"]')).toBeVisible();
    await expect(s.locator(".s-door")).toHaveCount(0);
    await expect(s.locator("[aria-expanded]")).toHaveCount(0);
  });
});

for (const lang of ["pt", "en"] as const) {
  test(`axe: sem violações sérias com a sala Back-end aberta (${lang})`, async ({
    page,
  }) => {
    await page.addInitScript(
      (l) => localStorage.setItem("preferred-language", l),
      lang,
    );
    await openProjetos(page);
    const openLabel = siteCopy[lang].projetos.open(
      siteCopy[lang].projetos.doors.backend.name,
    );
    await page
      .locator("#projetos")
      .getByRole("button", { name: openLabel })
      .evaluate((el) => (el as HTMLElement).click());
    await arrived(page, siteCopy[lang].projetos.doors.backend.name);
    await expect(room(page, "backend")).toBeVisible();

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
