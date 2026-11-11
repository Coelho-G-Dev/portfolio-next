import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Projetos from "@/components/site/projetos/Projetos";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { projects } from "@/data/projects";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { siteCopy, type SiteCopy } from "@/lib/i18n/site";

// As linhas do tempo simuladas chamam o callback na hora, para a lógica do
// componente ser testada sem animação. `hold.enter` segura a chegada e
// `hold.scroll` segura a rolagem inicial até o teste soltar.
type Cb = () => void;
const motion = vi.hoisted(() => ({
  enter: 0,
  fade: [] as ("in" | "out")[],
  reverse: 0,
  arrived: 0,
  rest: 0,
  // Ordem das chamadas nas linhas do tempo e alvo de cada enterTimeline.
  calls: [] as string[],
  targets: [] as unknown[],
  hold: { enter: false, scroll: false },
  release: null as Cb | null,
  scrollKilled: false,
  finishScroll: null as Cb | null,
}));

vi.mock("@/components/site/projetos/doorMotion", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/components/site/projetos/doorMotion")>();
  function fakeTimeline(onDone: Cb, opts: { held: boolean; autoplay: boolean }) {
    let progress = 0;
    const callbacks: Record<string, Cb> = {};
    const tl = {
      play() {
        if (opts.held) {
          progress = 0.5;
          motion.release = () => {
            progress = 1;
            onDone();
          };
        } else {
          progress = 1;
          onDone();
        }
        return tl;
      },
      reverse() {
        motion.reverse++;
        motion.calls.push("reverse");
        progress = 0;
        callbacks.onReverseComplete?.();
        return tl;
      },
      progress(value?: number, suppressEvents?: boolean) {
        if (value === undefined) return progress;
        motion.calls.push(`progress(${value}, ${suppressEvents === true})`);
        progress = value;
        if (value === 1 && !suppressEvents) onDone();
        return tl;
      },
      eventCallback(type: string, cb: Cb) {
        callbacks[type] = cb;
        return tl;
      },
      kill() {
        return tl;
      },
    };
    if (opts.autoplay) tl.play();
    return tl;
  }
  return {
    ...real,
    enterTimeline: (_els: unknown, t: unknown, onArrive: Cb) => {
      motion.enter++;
      motion.calls.push("enterTimeline");
      motion.targets.push(t);
      return fakeTimeline(onArrive, { held: motion.hold.enter, autoplay: false });
    },
    arrivedState: () => {
      motion.arrived++;
    },
    restState: () => {
      motion.rest++;
    },
    fadeTimeline: (_el: unknown, dir: "in" | "out", onDone: Cb) => {
      motion.fade.push(dir);
      return fakeTimeline(onDone, { held: false, autoplay: true });
    },
    scrollIntoStage: () => {
      if (!motion.hold.scroll) return null;
      const callbacks: Record<string, Cb> = {};
      const tween = {
        eventCallback(type: string, cb: Cb) {
          callbacks[type] = cb;
          return tween;
        },
        progress() {
          callbacks.onComplete?.();
          return tween;
        },
        kill() {
          motion.scrollKilled = true;
          return tween;
        },
      };
      motion.finishScroll = () => callbacks.onComplete?.();
      return tween;
    },
  };
});

const box = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} }) as DOMRect;

// O jsdom não mede nada; aqui o palco tem 1440×840 e cada abertura 202×380.
// `layout` pode mudar no meio do teste (janela redimensionada).
const layout = { stage: box(0, 100, 1440, 840), reveal: box(300, 200, 202, 380) };
function stubLayout() {
  layout.stage = box(0, 100, 1440, 840);
  layout.reveal = box(300, 200, 202, 380);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains("s-stage")) return layout.stage;
    if (this.classList.contains("s-door__reveal")) return layout.reveal;
    return box(0, 0, 0, 0);
  });
}

function reducedMotion() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

function tree(copy: SiteCopy = siteCopy.pt, lang: "pt" | "en" = "pt") {
  localStorage.setItem("preferred-language", lang);
  return (
    <LanguageProvider>
      <SiteCopyContext.Provider value={copy}>
        <Projetos lang={lang} />
      </SiteCopyContext.Provider>
    </LanguageProvider>
  );
}

const door = (name: string, lang: "pt" | "en" = "pt") =>
  screen.getByRole("button", { name: siteCopy[lang].projetos.open(name) });

const holdEnter = () => {
  motion.hold.enter = true;
};
const holdScroll = () => {
  motion.hold.scroll = true;
};
const enterCalls = () => motion.enter;
const reverseCalls = () => motion.reverse;
const fadeCalls = () => motion.fade.length;

describe("Portas e capítulo de projetos", () => {
  beforeEach(() => {
    Object.assign(motion, {
      enter: 0,
      fade: [],
      reverse: 0,
      arrived: 0,
      rest: 0,
      calls: [],
      targets: [],
      hold: { enter: false, scroll: false },
      release: null,
      scrollKilled: false,
      finishScroll: null,
    });
    stubLayout();
  });

  afterEach(async () => {
    cleanup();
    vi.restoreAllMocks();
    document.querySelectorAll("dialog").forEach((d) => d.remove());
    // O history.back() do jsdom anda em tarefas (setTimeout 0, duas vezes):
    // espera ele terminar antes de zerar a URL para o próximo teste.
    for (let i = 0; i < 3; i++) await new Promise((r) => setTimeout(r, 0));
    history.replaceState(null, "", "/");
  });

  it("as três portas começam fechadas e o destaque do Cidade Energia está sempre presente", () => {
    render(tree());
    expect(screen.getByRole("heading", { level: 3, name: "Cidade Energia" })).toBeInTheDocument();
    expect(screen.getByText(siteCopy.pt.projetos.featured.badge)).toBeInTheDocument();
    for (const name of ["Back-end", "Front-end", "IA"]) {
      expect(door(name)).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("abrir Front-end empilha #porta-frontend, foca o h3 e lista Cidade Energia e BuscaSUS", () => {
    render(tree());
    fireEvent.click(door("Front-end"));
    const h3 = screen.getByRole("heading", { level: 3, name: "Front-end" });
    expect(document.activeElement).toBe(h3);
    expect(location.hash).toBe("#porta-frontend");
    expect(history.state).toEqual({ door: "frontend" });
    expect(enterCalls()).toBe(1);
    const room = h3.closest("[data-door-panel]") as HTMLElement;
    expect(within(room).getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual([
      "Cidade Energia",
      "BuscaSUS",
    ]);
    // O destaque continua visível com a sala aberta.
    expect(screen.getByRole("heading", { level: 3, name: "Cidade Energia" })).toBeInTheDocument();
  });

  it("com a sala aberta, a cena fica embaixo, escondida e inerte, e as portas saem da árvore acessível", () => {
    const { container } = render(tree());
    fireEvent.click(door("IA"));
    const stage = container.querySelector(".s-stage")!;
    const scene = stage.parentElement!;
    expect(scene.hasAttribute("inert")).toBe(true);
    expect(scene).toHaveStyle({ visibility: "hidden", position: "absolute" });
    expect(screen.queryByRole("button", { name: siteCopy.pt.projetos.open("IA") })).toBeNull();
  });

  it("Esc fecha, limpa o hash e devolve o foco à porta", async () => {
    render(tree());
    fireEvent.click(door("IA"));
    fireEvent.keyDown(window, { key: "Escape" });
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    });
    expect(screen.queryByRole("heading", { level: 3, name: "IA" })).toBeNull();
    expect(document.activeElement).toBe(door("IA"));
    expect(door("IA")).toHaveAttribute("aria-expanded", "false");
  });

  it("a volta a partir da sala aberta remonta a cena no quadro de chegada, sem eventos, e reverte", () => {
    render(tree());
    fireEvent.click(door("Back-end"));
    expect(enterCalls()).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Voltar às portas" }));
    // Uma linha do tempo nova (alvo recalculado), sem disparar a chegada de novo.
    expect(enterCalls()).toBe(2);
    expect(reverseCalls()).toBe(1);
    expect(screen.queryByRole("heading", { level: 3, name: "Back-end" })).toBeNull();
    expect(document.activeElement).toBe(door("Back-end"));
  });

  it("a volta remonta o quadro de chegada sem eventos antes de reverter, com o alvo medido de novo", () => {
    render(tree());
    fireEvent.click(door("Back-end"));
    // A janela muda com a sala aberta: palco mais estreito, abertura em outro lugar.
    layout.stage = box(0, 0, 1200, 700);
    layout.reveal = box(250, 150, 170, 320);
    motion.calls = [];
    fireEvent.click(screen.getByRole("button", { name: "Voltar às portas" }));
    expect(motion.calls).toEqual(["enterTimeline", "progress(1, true)", "reverse"]);
    expect(motion.targets).toHaveLength(2);
    expect(motion.targets[1]).not.toEqual(motion.targets[0]);
  });

  it("o botão Voltar do navegador fecha a sala", () => {
    render(tree());
    fireEvent.click(door("Back-end"));
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    });
    expect(screen.queryByRole("heading", { level: 3, name: "Back-end" })).toBeNull();
    expect(document.activeElement).toBe(door("Back-end"));
  });

  it("Esc no meio da entrada reverte e fecha", () => {
    holdEnter(); // a simulação de enterTimeline não chama onArrive até soltar
    render(tree());
    fireEvent.click(door("IA"));
    expect(door("IA")).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(reverseCalls()).toBe(1);
    expect(door("IA")).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(door("IA"));
    expect(screen.queryByRole("heading", { level: 3, name: "IA" })).toBeNull();
  });

  it("Esc durante a rolagem inicial para a rolagem e fecha sem criar linha do tempo", () => {
    holdScroll();
    render(tree());
    fireEvent.click(door("IA"));
    expect(enterCalls()).toBe(0);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(motion.scrollKilled).toBe(true);
    expect(enterCalls()).toBe(0);
    expect(door("IA")).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(door("IA"));
  });

  it("a entrada só começa quando a rolagem inicial termina", () => {
    holdScroll();
    render(tree());
    fireEvent.click(door("IA"));
    expect(enterCalls()).toBe(0);
    act(() => motion.finishScroll!());
    expect(enterCalls()).toBe(1);
    expect(screen.getByRole("heading", { level: 3, name: "IA" })).toBeInTheDocument();
  });

  it("clique em outra porta durante a entrada é ignorado", () => {
    holdEnter();
    render(tree());
    fireEvent.click(door("IA"));
    fireEvent.click(door("IA"));
    fireEvent.click(door("Back-end"));
    expect(enterCalls()).toBe(1);
    expect(history.state).toEqual({ door: "ia" });
    expect(door("Back-end")).toHaveAttribute("aria-expanded", "false");
  });

  it("Esc é ignorado enquanto um diálogo está aberto", () => {
    render(tree());
    fireEvent.click(door("Back-end"));
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");
    document.body.appendChild(dialog);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("heading", { level: 3, name: "Back-end" })).toBeInTheDocument();
    expect(reverseCalls()).toBe(0);
  });

  it("link direto #porta-backend abre a sala já aberta, sem entrada", () => {
    history.replaceState(null, "", "/#porta-backend");
    render(tree());
    const h3 = screen.getByRole("heading", { level: 3, name: "Back-end" });
    expect(h3).toBeInTheDocument();
    expect(document.activeElement).toBe(h3);
    expect(enterCalls()).toBe(0);
    expect(motion.arrived).toBe(1);
    // Sem entrada no histórico: fechar pela interface só limpa o hash.
    fireEvent.click(screen.getByRole("button", { name: "Voltar às portas" }));
    expect(location.hash).toBe("");
    expect(screen.queryByRole("heading", { level: 3, name: "Back-end" })).toBeNull();
    expect(document.activeElement).toBe(door("Back-end"));
  });

  it("hash desconhecido não abre nada", () => {
    history.replaceState(null, "", "/#porta-xyz");
    render(tree());
    expect(screen.queryByRole("heading", { level: 3, name: "Back-end" })).toBeNull();
    expect(door("Back-end")).toHaveAttribute("aria-expanded", "false");
  });

  it("hash de outra seção (#contato) é ignorado e continua na URL", () => {
    history.replaceState(null, "", "/#contato");
    render(tree());
    for (const name of ["Back-end", "Front-end", "IA"]) {
      expect(door(name)).toHaveAttribute("aria-expanded", "false");
    }
    expect(location.hash).toBe("#contato");
    expect(history.state).toBeNull();
  });

  it("Avançar no navegador até #porta-ia reabre a sala, sem entrada", () => {
    render(tree());
    act(() => {
      history.replaceState({ door: "ia" }, "", "/#porta-ia");
      window.dispatchEvent(new PopStateEvent("popstate", { state: { door: "ia" } }));
    });
    expect(screen.getByRole("heading", { level: 3, name: "IA" })).toBeInTheDocument();
    expect(enterCalls()).toBe(0);
  });

  it("trocar o idioma com a sala aberta mantém a sala e traduz", () => {
    const view = render(tree());
    fireEvent.click(door("Back-end"));
    expect(screen.getByRole("button", { name: "Voltar às portas" })).toBeInTheDocument();
    view.rerender(tree(siteCopy.en, "en"));
    expect(screen.getByRole("heading", { level: 3, name: "Back-end" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to doors" })).toBeInTheDocument();
  });

  it("trocar o idioma durante a entrada mantém a entrada e chega na sala traduzida", () => {
    holdEnter();
    const view = render(tree());
    fireEvent.click(door("IA"));
    view.rerender(tree(siteCopy.en, "en"));
    expect(door("AI", "en")).toHaveAttribute("aria-expanded", "true");
    act(() => motion.release!());
    expect(screen.getByRole("heading", { level: 3, name: "AI" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to doors" })).toBeInTheDocument();
  });

  it("movimento reduzido usa o esmaecer, não a câmera", () => {
    reducedMotion();
    render(tree());
    fireEvent.click(door("Front-end"));
    expect(fadeCalls()).toBe(1);
    expect(enterCalls()).toBe(0);
    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 3, name: "Front-end" }));
    fireEvent.click(screen.getByRole("button", { name: "Voltar às portas" }));
    expect(motion.fade).toEqual(["in", "out"]);
    expect(enterCalls()).toBe(0);
    expect(reverseCalls()).toBe(0);
    expect(document.activeElement).toBe(door("Front-end"));
  });

  it("link direto com movimento reduzido: sem quadro de chegada, e a cena volta ao repouso ao fechar", () => {
    reducedMotion();
    history.replaceState(null, "", "/#porta-backend");
    render(tree());
    expect(screen.getByRole("heading", { level: 3, name: "Back-end" })).toBeInTheDocument();
    expect(motion.arrived).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Voltar às portas" }));
    expect(motion.fade).toEqual(["out"]);
    expect(motion.rest).toBe(1);
    expect(document.activeElement).toBe(door("Back-end"));
  });

  it("movimento reduzido ligado com a sala aberta: fecha esmaecendo e devolve a cena ao repouso", () => {
    render(tree());
    fireEvent.click(door("IA"));
    expect(enterCalls()).toBe(1);
    reducedMotion();
    fireEvent.click(screen.getByRole("button", { name: "Voltar às portas" }));
    expect(motion.fade).toEqual(["out"]);
    expect(reverseCalls()).toBe(0);
    expect(motion.rest).toBe(1);
    expect(door("IA")).toHaveAttribute("aria-expanded", "false");
  });

  it("sem medida da abertura (palco escondido), abre e fecha sem câmera", () => {
    vi.restoreAllMocks();
    render(tree());
    fireEvent.click(door("IA"));
    expect(screen.getByRole("heading", { level: 3, name: "IA" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Voltar às portas" }));
    expect(enterCalls()).toBe(0);
    expect(document.activeElement).toBe(door("IA"));
  });

  it("renderiza as telas de celular na ficha Front-end quando screens existe", () => {
    const ce = projects.find((p) => p.title === "Cidade Energia")!;
    const screens = ce.facets!.frontend!.screens!;
    render(tree());
    fireEvent.click(door("Front-end"));
    const room = screen.getByRole("heading", { level: 3, name: "Front-end" }).closest("[data-door-panel]") as HTMLElement;
    for (const s of screens) expect(within(room).getByAltText(s.alt.pt)).toBeInTheDocument();
  });

  it("sem JavaScript, mostra as três salas abertas, tabuleiros estáticos e nenhum aria-expanded", () => {
    const html = renderToString(tree());
    expect(html).not.toContain("aria-expanded");
    expect(html).not.toContain("s-stage");
    for (const n of ["Back-end", "Front-end", "IA"]) expect(html).toContain(`>${n}</h3>`);
    expect(html).toContain("Peças perdidas: 0");
  });
});
