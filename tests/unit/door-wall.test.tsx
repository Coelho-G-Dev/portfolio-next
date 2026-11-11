import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, type ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DoorWall, { type DoorScene, type WallDoor } from "@/components/site/projetos/DoorWall";
import { PERSPECTIVE } from "@/components/site/projetos/doorMotion";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { DOORS } from "@/data/doors";
import { cameraTarget } from "@/lib/doorCamera";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";

function withCopy(node: ReactElement, lang: "pt" | "en" = "pt") {
  return (
    <LanguageProvider>
      <SiteCopyContext.Provider value={siteCopy[lang]}>{node}</SiteCopyContext.Provider>
    </LanguageProvider>
  );
}

const threeDoors: WallDoor[] = DOORS.map((id, index) => ({
  id,
  index,
  name: siteCopy.pt.projetos.doors[id].name,
  teaser: siteCopy.pt.projetos.doors[id].teaser,
}));

const box = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} }) as DOMRect;

// O jsdom não mede nada; aqui o palco tem 1440×840 e cada abertura 202×380.
function stubLayout() {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains("s-stage")) return box(0, 100, 1440, 840);
    if (this.classList.contains("s-door__reveal")) return box(300, 200, 202, 380);
    return box(0, 0, 0, 0);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("parede de portas", () => {
  it("a miniatura mantém a aparência sem controles dentro do botão da porta", () => {
    stubLayout();
    const { container } = render(
      withCopy(<DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" />),
    );
    expect(container.querySelectorAll("button button, button a[href]" )).toHaveLength(0);
    expect(container.querySelector(".s-room--preview .s-room__back")).toHaveTextContent(siteCopy.pt.projetos.back);
  });
  it("uma quarta porta entra só pelos dados, sem mudar o componente", () => {
    const doors: WallDoor[] = [
      ...DOORS.map((id, index) => ({ id, index, name: siteCopy.pt.projetos.doors[id].name, teaser: "t" })),
      { id: "fullstack", index: 3, name: "Full-stack", teaser: "t" },
    ];
    render(withCopy(<DoorWall doors={doors} activeId={null} busy={false} onSelect={() => {}} lang="pt" />));
    expect(screen.getAllByRole("button", { name: /^Abrir a porta / })).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Abrir a porta Full-stack" })).toHaveAttribute(
      "aria-controls",
      "door-panel-fullstack",
    );
  });

  it("porta tem duas folhas, plaqueta com o nome e nenhum glifo de xadrez", () => {
    const { container } = render(
      withCopy(<DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" />),
    );
    const back = container.querySelector('[data-door="backend"]')!;
    expect(back.querySelectorAll(".s-leaf")).toHaveLength(2);
    expect(back.textContent).toContain("BACK-END");
    expect(container.textContent).not.toMatch(/[♜♞♛♚♝♟]/);
  });

  it("com busy, clicar não seleciona", () => {
    const onSelect = vi.fn();
    render(withCopy(<DoorWall doors={threeDoors} activeId={null} busy onSelect={onSelect} lang="pt" />));
    fireEvent.click(screen.getByRole("button", { name: "Abrir a porta IA" }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("clicar seleciona a porta, e aria-expanded segue a porta ativa", () => {
    const onSelect = vi.fn();
    render(withCopy(<DoorWall doors={threeDoors} activeId="frontend" busy={false} onSelect={onSelect} lang="pt" />));
    fireEvent.click(screen.getByRole("button", { name: "Abrir a porta IA" }));
    expect(onSelect).toHaveBeenCalledWith("ia");
    expect(screen.getByRole("button", { name: "Abrir a porta Front-end" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Abrir a porta IA" })).toHaveAttribute("aria-expanded", "false");
  });

  it("cada porta tem nome e teaser no rótulo e a cor da folha vem do token dela", () => {
    const { container } = render(
      withCopy(<DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" />),
    );
    const ia = container.querySelector<HTMLElement>('[data-door="ia"]')!;
    expect(ia.querySelector(".s-door__label")?.textContent).toContain("RAG que responde com fontes.");
    expect(ia.style.getPropertyValue("--leaf-claro")).toBe("var(--c-porta-ia-claro)");
    expect(ia.style.getPropertyValue("--leaf-escuro")).toBe("var(--c-porta-ia-escuro)");
  });

  it("o teaser de cada porta descreve o botão para o leitor de tela", () => {
    render(withCopy(<DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" />));
    for (const d of threeDoors) {
      const button = screen.getByRole("button", { name: `Abrir a porta ${d.name}` });
      expect(button).toHaveAccessibleDescription(d.teaser);
      const line = document.getElementById(button.getAttribute("aria-describedby")!)!;
      expect(line).toHaveClass("s-door__line");
      expect(button.contains(line)).toBe(true);
    }
  });

  it("focusDoor põe o foco no botão da porta", () => {
    const sceneRef = createRef<DoorScene>();
    render(
      withCopy(
        <DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" sceneRef={sceneRef} />,
      ),
    );
    sceneRef.current!.focusDoor("frontend");
    expect(screen.getByRole("button", { name: "Abrir a porta Front-end" })).toHaveFocus();
    sceneRef.current!.focusDoor("xyz"); // porta que não existe: nada acontece
    expect(screen.getByRole("button", { name: "Abrir a porta Front-end" })).toHaveFocus();
  });

  it("o palco usa a perspectiva da câmera", () => {
    const { container } = render(
      withCopy(<DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" />),
    );
    expect(container.querySelector<HTMLElement>(".s-stage")!.style.perspective).toBe(`${PERSPECTIVE}px`);
  });

  it("sceneRef entrega folhas, sombras, luz e o que esmaece (as outras portas e os rótulos)", () => {
    const sceneRef = createRef<DoorScene>();
    const { container } = render(
      withCopy(
        <DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" sceneRef={sceneRef} />,
      ),
    );
    const els = sceneRef.current!.getEls("frontend")!;
    const front = container.querySelector('[data-door="frontend"]')!;
    expect(els.world).toBe(container.querySelector(".s-world"));
    expect(els.leaves[0]).toHaveClass("s-leaf--l");
    expect(els.leaves[1]).toHaveClass("s-leaf--r");
    expect(els.leaves.every((l) => front.contains(l))).toBe(true);
    expect(els.shades).toHaveLength(2);
    expect(els.spill).toBe(front.querySelector(".s-door__spill"));
    expect(els.dim).toContain(container.querySelector('[data-door="backend"]'));
    expect(els.dim).toContain(container.querySelector('[data-door="ia"]'));
    expect(els.dim).toContain(front.querySelector(".s-door__label"));
    expect(els.dim).not.toContain(front);
    expect(sceneRef.current!.getEls("xyz")).toBeNull();
  });

  it("getRects devolve null quando a abertura não tem tamanho, em vez de um alvo falso", () => {
    const sceneRef = createRef<DoorScene>();
    render(
      withCopy(
        <DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" sceneRef={sceneRef} />,
      ),
    );
    expect(sceneRef.current!.getRects("backend")).toBeNull();
  });

  it("getRects mede palco e abertura com a câmera em repouso", () => {
    stubLayout();
    const sceneRef = createRef<DoorScene>();
    const stageRef = createRef<HTMLDivElement>();
    const { container } = render(
      withCopy(
        <DoorWall
          doors={threeDoors}
          activeId={null}
          busy={false}
          onSelect={() => {}}
          lang="pt"
          sceneRef={sceneRef}
          stageRef={stageRef}
        />,
      ),
    );
    expect(stageRef.current).toBe(container.querySelector(".s-stage"));
    const world = container.querySelector<HTMLElement>(".s-world")!;
    world.style.transform = "translate3d(10px, 20px, 300px)";
    const rects = sceneRef.current!.getRects("ia")!;
    expect(rects.stage.width).toBe(1440);
    expect(rects.reveal.width).toBe(202);
    // a câmera volta para onde estava depois de medir
    expect(world.style.transform).toBe("translate3d(10px, 20px, 300px)");
  });

  it("a miniatura da sala tem o tamanho do palco, escalada por 1/k dentro da abertura", () => {
    stubLayout();
    const { container } = render(
      withCopy(<DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" />),
    );
    const reveal = container.querySelector('[data-door="frontend"] .s-door__reveal')!;
    const preview = reveal.querySelector<HTMLElement>(".s-room--preview")!;
    expect(preview).not.toBeNull();
    expect(preview.style.width).toBe("1440px");
    expect(preview.style.height).toBe("840px");
    const { k } = cameraTarget(box(0, 100, 1440, 840), box(300, 200, 202, 380), PERSPECTIVE);
    const mini = reveal.querySelector<HTMLElement>(".s-door__mini")!;
    expect(mini.style.transform).toBe(`translate(-50%, -50%) scale(${1 / k})`);
  });

  describe("carrossel do celular", () => {
    const pos = (i: number) => `${i} de 3`;
    const wall = (props: { busy?: boolean; activeId?: string | null; onSelect?: (id: string) => void } = {}) =>
      render(
        withCopy(
          <DoorWall
            doors={threeDoors}
            activeId={props.activeId ?? null}
            busy={props.busy ?? false}
            onSelect={props.onSelect ?? (() => {})}
            lang="pt"
          />,
        ),
      );

    it("os botões falam de portas, não de projetos (PT e EN)", () => {
      expect(siteCopy.pt.projetos.carousel.prev).toBe("Porta anterior");
      expect(siteCopy.pt.projetos.carousel.next).toBe("Próxima porta");
      expect(siteCopy.en.projetos.carousel.prev).toBe("Previous door");
      expect(siteCopy.en.projetos.carousel.next).toBe("Next door");
    });

    it("a região viva anuncia \"Porta 2 de 3\" e a tela mostra só \"2 de 3\"", () => {
      const { container } = wall();
      fireEvent.click(screen.getByRole("button", { name: "Próxima porta" }));
      const live = container.querySelector("[aria-live]")!;
      expect(live.textContent).toBe("Porta 2 de 3");
      expect(live.querySelector(".s-carousel__pos")!.textContent).toBe("2 de 3");
      expect(live.querySelector(".sr-only")!.textContent).toBe("Porta ");
    });

    it("anda com os botões e para nas pontas", () => {
      const { container } = wall();
      const next = screen.getByRole("button", { name: siteCopy.pt.projetos.carousel.next });
      const prev = screen.getByRole("button", { name: siteCopy.pt.projetos.carousel.prev });
      expect(prev).toBeDisabled();
      expect(screen.getByText(pos(1))).toBeInTheDocument();
      fireEvent.click(next);
      fireEvent.click(next);
      expect(screen.getByText(pos(3))).toBeInTheDocument();
      expect(next).toBeDisabled();
      expect(container.querySelector<HTMLElement>(".s-wall")!.style.getPropertyValue("--wall-i")).toBe("2");
    });

    it("focar uma porta leva o carrossel até ela", () => {
      wall();
      fireEvent.focus(screen.getByRole("button", { name: "Abrir a porta IA" }));
      expect(screen.getByText(pos(3))).toBeInTheDocument();
    });

    it("com busy o carrossel não anda", () => {
      wall({ busy: true });
      expect(screen.getByRole("button", { name: siteCopy.pt.projetos.carousel.next })).toBeDisabled();
    });

    it("a porta aberta é a atual", () => {
      wall({ activeId: "ia" });
      expect(screen.getByText(pos(3))).toBeInTheDocument();
    });

    it("arrastar mais de 40px troca de porta e não abre a porta; menos que isso não troca", () => {
      vi.spyOn(window, "matchMedia").mockImplementation(
        (q) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
      );
      const onSelect = vi.fn();
      const { container } = wall({ onSelect });
      const stage = container.querySelector(".s-stage")!;
      const door = screen.getByRole("button", { name: "Abrir a porta Back-end" });
      const swipe = (from: number, to: number) => {
        fireEvent.pointerDown(stage, { clientX: from, pointerId: 1 });
        fireEvent.pointerUp(stage, { clientX: to, pointerId: 1 });
      };
      swipe(200, 170);
      expect(screen.getByText(pos(1))).toBeInTheDocument();
      swipe(200, 140);
      expect(screen.getByText(pos(2))).toBeInTheDocument();
      fireEvent.click(door, { detail: 1 });
      expect(onSelect).not.toHaveBeenCalled();
      swipe(100, 160);
      expect(screen.getByText(pos(1))).toBeInTheDocument();
    });

    it("swipe sem clique, depois Enter (detail 0) abre a porta", () => {
      vi.spyOn(window, "matchMedia").mockImplementation(
        (q) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
      );
      const onSelect = vi.fn();
      const { container } = wall({ onSelect });
      const stage = container.querySelector(".s-stage")!;
      fireEvent.pointerDown(stage, { clientX: 200, clientY: 0, pointerId: 1 });
      fireEvent.pointerUp(stage, { clientX: 100, clientY: 0, pointerId: 1 });
      fireEvent.click(screen.getByRole("button", { name: "Abrir a porta Front-end" }));
      expect(onSelect).toHaveBeenCalledWith("frontend");
    });

    it("gesto mais vertical que horizontal não troca de porta", () => {
      vi.spyOn(window, "matchMedia").mockImplementation(
        (q) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
      );
      const { container } = wall();
      const stage = container.querySelector(".s-stage")!;
      fireEvent.pointerDown(stage, { clientX: 200, clientY: 0, pointerId: 1 });
      fireEvent.pointerUp(stage, { clientX: 150, clientY: 120, pointerId: 1 });
      expect(screen.getByText(pos(1))).toBeInTheDocument();
    });

    it("chegar à última porta passa o foco para o botão anterior", () => {
      wall();
      const next = screen.getByRole("button", { name: siteCopy.pt.projetos.carousel.next });
      next.focus();
      fireEvent.click(next);
      fireEvent.click(next);
      expect(screen.getByRole("button", { name: siteCopy.pt.projetos.carousel.prev })).toHaveFocus();
    });

    it("clicar logo depois de deslizar mede com a transição da fila suspensa e o transform mantido", () => {
      stubLayout();
      const sceneRef = createRef<DoorScene>();
      const { container } = render(
        withCopy(
          <DoorWall doors={threeDoors} activeId={null} busy={false} onSelect={() => {}} lang="pt" sceneRef={sceneRef} />,
        ),
      );
      const w = container.querySelector<HTMLElement>(".s-wall")!;
      w.style.transition = "transform 0.35s";
      fireEvent.click(screen.getByRole("button", { name: siteCopy.pt.projetos.carousel.next }));
      let seen = "";
      const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("s-door__reveal")) seen = w.style.transition;
        return box(0, 0, 200, 300);
      });
      sceneRef.current!.getRects("ia");
      spy.mockRestore();
      expect(seen).toBe("none");
      expect(w.style.transition).toBe("transform 0.35s");
      expect(w.style.getPropertyValue("--wall-i")).toBe("1");
    });
  });
});
