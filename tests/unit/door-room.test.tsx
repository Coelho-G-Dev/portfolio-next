import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, type ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DoorRoom from "@/components/site/projetos/DoorRoom";
import RoomPreview from "@/components/site/projetos/RoomPreview";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";

function withCopy(node: ReactElement, lang: "pt" | "en" = "pt") {
  return (
    <LanguageProvider>
      <SiteCopyContext.Provider value={siteCopy[lang]}>{node}</SiteCopyContext.Provider>
    </LanguageProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("sala atrás da porta", () => {
  it("a sala Front-end abre com o topo e os dois projetos, cada um marcado como da porta Back-end", () => {
    render(withCopy(<DoorRoom door="frontend" index={1} lang="pt" staticMode={false} onBack={() => {}} />));
    expect(screen.getByRole("heading", { level: 3, name: "Front-end" })).toBeInTheDocument();
    expect(screen.getByText("Porta 02 · Front-end")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual(["Cidade Energia", "BuscaSUS"]);
    expect(screen.getAllByText("Também na porta Back-end")).toHaveLength(2);
  });

  it("na sala Back-end, quem mora ali não leva a marca e tem tabuleiro", () => {
    render(withCopy(<DoorRoom door="backend" index={0} lang="pt" staticMode />));
    // Projetos que moram na IA aparecem aqui com a marca da IA; nenhum leva a do Back-end.
    expect(screen.queryByText("Também na porta Back-end")).toBeNull();
    expect(screen.getAllByText("Também na porta IA").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Peças perdidas: 0").length).toBeGreaterThan(0);
  });

  it("a prévia é invisível para leitor de tela, sem foco e sem links", () => {
    const { container } = render(withCopy(<RoomPreview door="backend" index={0} lang="pt" width={1440} height={840} />));
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.hasAttribute("inert")).toBe(true);
    expect(root.querySelectorAll("a, h3, h4, dialog, [role], [aria-live]")).toHaveLength(0);
    expect(root.querySelectorAll("[data-project-card], [data-project-board], [aria-expanded]")).toHaveLength(0);
    // Gêmeos visuais em spans: a miniatura fica dentro do botão da porta.
    expect(root.querySelectorAll("button, [tabindex]")).toHaveLength(0);
    expect(root.querySelectorAll(".s-board__piece").length).toBeGreaterThan(1);
  });

  it.each([
    ["backend", 0],
    ["frontend", 1],
    ["ia", 2],
  ] as const)("a prévia da sala %s desenha o cartão inteiro, bloco por bloco: nada surge depois da chegada", (door, index) => {
    // Mesma árvore de caixas. Link vira span e título vira p na prévia; o
    // diálogo de tela cheia (fechado, sem caixa) fica só na sala.
    const tag = (e: Element) => ({ A: "SPAN", BUTTON: "SPAN", H4: "P" })[e.tagName] ?? e.tagName;
    const blocks = (root: ParentNode) =>
      Array.from(root.querySelectorAll(".s-pcard")).map((card) =>
        Array.from(card.querySelectorAll("*"))
          .filter((e) => !e.closest("dialog"))
          .map((e) => `${tag(e)}.${e.getAttribute("class") ?? ""}`),
      );
    const room = render(withCopy(<DoorRoom door={door} index={index} lang="pt" onBack={() => {}} />));
    const real = blocks(room.container);
    room.unmount();
    const prev = render(withCopy(<RoomPreview door={door} index={index} lang="pt" width={1440} height={840} />));
    expect(blocks(prev.container)).toEqual(real);
    if (door === "backend") expect(prev.container.querySelector(".s-board .s-board__piece")).not.toBeNull();
  });

  it("a prévia já traz o Voltar no mesmo lugar da sala: nada surge depois da chegada", () => {
    const room = render(withCopy(<DoorRoom door="ia" index={2} lang="pt" onBack={() => {}} />));
    const realBack = room.container.querySelector(".s-room > .s-room__top + .s-room__back")!;
    const realHtml = realBack.innerHTML;
    room.unmount();
    const prev = render(withCopy(<RoomPreview door="ia" index={2} lang="pt" width={1440} height={840} />));
    const twin = prev.container.querySelector(".s-room > .s-room__top + .s-room__back")!;
    expect(twin).not.toBeNull();
    expect(twin.innerHTML).toBe(realHtml);
    expect(twin.textContent).toContain(siteCopy.pt.projetos.back);
  });

  it("o brilho da sala vem do token da porta, na sala e na prévia", () => {
    const room = render(withCopy(<DoorRoom door="ia" index={2} lang="pt" staticMode />));
    const roomEl = room.container.querySelector<HTMLElement>(".s-room")!;
    expect(roomEl.style.getPropertyValue("--room-glow")).toBe("var(--c-porta-ia-claro)");
    room.unmount();
    const prev = render(withCopy(<RoomPreview door="frontend" index={1} lang="pt" width={1440} height={840} />));
    const prevEl = prev.container.querySelector<HTMLElement>(".s-room")!;
    expect(prevEl.style.getPropertyValue("--room-glow")).toBe("var(--c-porta-frontend-claro)");
  });

  it("com movimento reduzido, Voltar ao topo rola sem animação", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((q: string) => ({ matches: q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {} })),
    );
    const original = Element.prototype.scrollIntoView;
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    try {
      const headingRef = createRef<HTMLHeadingElement>();
      render(withCopy(<DoorRoom door="ia" index={2} lang="pt" headingRef={headingRef} onBack={() => {}} />));
      fireEvent.click(screen.getByRole("button", { name: siteCopy.pt.projetos.panel.scrollTop }));
      expect(scroll).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it("o texto novo existe em inglês", () => {
    render(withCopy(<DoorRoom door="frontend" index={1} lang="en" staticMode />, "en"));
    expect(screen.getByText("Door 02 · Front-end")).toBeInTheDocument();
    expect(screen.getAllByText("Also behind the Back-end door")).toHaveLength(2);
  });

  it("o primeiro print e o topo do cartão são iguais na sala e na prévia", () => {
    const room = render(withCopy(<DoorRoom door="frontend" index={1} lang="pt" staticMode />));
    const roomCard = room.container.querySelector(".s-pcard")!;
    const roomImg = roomCard.querySelector(".s-pcard__screen")!;
    const roomFirstChildren = Array.from(roomCard.children).slice(0, 3).map((e) => e.className);
    room.unmount();
    const prev = render(withCopy(<RoomPreview door="frontend" index={1} lang="pt" width={1440} height={840} />));
    const prevCard = prev.container.querySelector(".s-pcard")!;
    const prevImg = prevCard.querySelector(".s-pcard__screen")!;
    expect(prevImg.className).toBe(roomImg.className);
    expect(prevImg.getAttribute("src")).toBe(roomImg.getAttribute("src"));
    expect(prevImg.getAttribute("width")).toBe(roomImg.getAttribute("width"));
    expect(Array.from(prevCard.children).slice(0, 3).map((e) => e.className)).toEqual(roomFirstChildren);
    // prints extras vêm depois do texto, nos dois modos
    expect(roomCard.querySelector(".s-pcard__more")).not.toBeNull();
    expect(prevCard.querySelector(".s-pcard__more")).not.toBeNull();
  });
});
