import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ChessArchitecture from "@/components/site/projetos/ChessArchitecture";
import { boards } from "@/data/boards";
import { nodeSpecs } from "@/data/nodeSpecs";
import { projects } from "@/data/projects";
import * as clipboard from "@/lib/clipboard";

const authGuard = projects.find((p) => p.title === "AuthGuard")!;
const authBoard = boards[authGuard.id];

describe("ChessArchitecture", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renderiza um botão por nó do AuthGuard com aria-label completo e marca o nó crítico", () => {
    const { container } = render(<ChessArchitecture project={authGuard} lang="pt" />);
    for (const node of authBoard.nodes) {
      const btn = screen.getByRole("button", {
        name: new RegExp(`${node.label.pt}, .+, casa ${node.square}`, "i"),
      });
      expect(btn).toBeInTheDocument();
      if (node.critical) {
        expect(btn).toHaveAttribute("data-critical", "true");
      }
    }
    const items = container.querySelectorAll(".s-board__notation li");
    expect(items).toHaveLength(authBoard.edges.length + 1);
  });

  it("anima o pulso âmbar uma aresta por vez, em ordem, a cada 1,2 s", () => {
    vi.useFakeTimers();
    const { container } = render(<ChessArchitecture project={authGuard} lang="pt" />);
    const pulses0 = container.querySelectorAll(".s-board__pulse");
    expect(pulses0).toHaveLength(1);
    expect(pulses0[0]).toHaveAttribute("data-edge-index", "0");
    expect((pulses0[0] as HTMLElement).style.animationDuration).toBe("1.2s");

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    const pulses1 = container.querySelectorAll(".s-board__pulse");
    expect(pulses1).toHaveLength(1);
    expect(pulses1[0]).toHaveAttribute("data-edge-index", "1");
  });

  it("clicar em RabbitMQ abre o detalhe com o trade-off do nodeSpec, e Esc ou novo clique fecha", () => {
    render(<ChessArchitecture project={authGuard} lang="pt" />);
    const rabbitSpec = nodeSpecs["RabbitMQ Exchange"];
    expect(screen.queryByText(rabbitSpec.tradeoff.pt)).toBeNull();

    const rabbitBtn = screen.getByRole("button", { name: /^RabbitMQ,/i });
    fireEvent.click(rabbitBtn);
    expect(screen.getByText(rabbitSpec.protocol)).toBeInTheDocument();
    expect(screen.getByText(rabbitSpec.role.pt)).toBeInTheDocument();
    expect(screen.getByText(rabbitSpec.tradeoff.pt)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText(rabbitSpec.tradeoff.pt)).toBeNull();

    fireEvent.click(rabbitBtn);
    expect(screen.getByText(rabbitSpec.tradeoff.pt)).toBeInTheDocument();
    fireEvent.click(rabbitBtn);
    expect(screen.queryByText(rabbitSpec.tradeoff.pt)).toBeNull();
  });

  it("Tela cheia abre o dialog, move o foco para Fechar e Esc devolve o foco ao botão Tela cheia sem vazar", () => {
    const outerKey = vi.fn();
    window.addEventListener("keydown", outerKey);
    try {
      render(<ChessArchitecture project={authGuard} lang="pt" />);
      const fsBtn = screen.getByRole("button", { name: "Tela cheia" });
      fireEvent.click(fsBtn);

      const closeBtn = screen.getByRole("button", { name: "Fechar" });
      expect(document.activeElement).toBe(closeBtn);

      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("button", { name: "Fechar" })).toBeNull();
      expect(document.activeElement).toBe(fsBtn);
      expect(outerKey).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener("keydown", outerKey);
    }
  });

  it("clicar num nó sem nodeSpec não quebra e fecha qualquer detalhe aberto", () => {
    const originalSpec = authBoard.nodes[0].spec;
    authBoard.nodes[0].spec = undefined;
    try {
      render(<ChessArchitecture project={authGuard} lang="pt" />);
      const rabbitSpec = nodeSpecs["RabbitMQ Exchange"];
      fireEvent.click(screen.getByRole("button", { name: /^RabbitMQ,/i }));
      expect(screen.getByText(rabbitSpec.tradeoff.pt)).toBeInTheDocument();

      const clientBtn = screen.getByRole("button", { name: /^Cliente,/i });
      fireEvent.click(clientBtn);
      expect(screen.queryByText(rabbitSpec.tradeoff.pt)).toBeNull();
    } finally {
      authBoard.nodes[0].spec = originalSpec;
    }
  });

  it("Copiar Mermaid chama copyText com o diagrama entre cercas de código e anuncia em role=status", async () => {
    const spy = vi.spyOn(clipboard, "copyText").mockResolvedValue(true);
    render(<ChessArchitecture project={authGuard} lang="pt" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar Mermaid" }));
    });

    expect(spy).toHaveBeenCalledWith(
      "```mermaid\n" + authGuard.architecture!.mermaid!.pt + "\n```",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Mermaid copiado");
  });

  it("Baixar SVG cria um Blob image/svg+xml", () => {
    const blobs: Blob[] = [];
    const createUrl = vi.fn((b: Blob) => {
      blobs.push(b);
      return "blob:test-svg";
    });
    const revokeUrl = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: createUrl,
      revokeObjectURL: revokeUrl,
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<ChessArchitecture project={authGuard} lang="pt" />);
    fireEvent.click(screen.getByRole("button", { name: "Baixar SVG" }));

    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(blobs[0].type).toContain("image/svg+xml");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeUrl).toHaveBeenCalledWith("blob:test-svg");
  });

  it("com movimento reduzido simulado, nenhum elemento .s-board__pulse é renderizado", () => {
    const origMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      }) as MediaQueryList;

    try {
      const { container } = render(<ChessArchitecture project={authGuard} lang="pt" />);
      expect(container.querySelectorAll(".s-board__pulse")).toHaveLength(0);
    } finally {
      window.matchMedia = origMatchMedia;
    }
  });
});
