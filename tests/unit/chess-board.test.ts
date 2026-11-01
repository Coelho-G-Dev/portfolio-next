import { describe, expect, it } from "vitest";
import { boards, type Board } from "@/data/boards";
import {
  boardToSvg,
  edgePath,
  nodeCenter,
  notation,
  parseSquare,
  PIECE_GLYPH,
} from "@/lib/chessBoard";
import { escapeXml } from "@/lib/xml";

describe("parseSquare e nodeCenter", () => {
  it("converte os cantos do tabuleiro 8×6", () => {
    expect(parseSquare("a1")).toEqual({ col: 0, row: 0 });
    expect(parseSquare("h6")).toEqual({ col: 7, row: 5 });
    expect(parseSquare("e3")).toEqual({ col: 4, row: 2 });
  });

  it("lança erro com casa fora de a1..h6", () => {
    for (const bad of ["", "i9", "a0", "a7", "z1", "a11"]) {
      expect(() => parseSquare(bad), bad).toThrow();
    }
  });

  it("nodeCenter coloca a linha 1 embaixo", () => {
    expect(nodeCenter("a1", 100)).toEqual({ x: 50, y: 550 });
    expect(nodeCenter("h6", 100)).toEqual({ x: 750, y: 50 });
  });
});

describe("edgePath", () => {
  it("começa no centro de origem e termina no centro de destino", () => {
    const d = edgePath("a1", "c3", 100);
    expect(d.startsWith("M 50 550")).toBe(true);
    expect(d.endsWith("250 350")).toBe(true);
    // Curva em L com arco de raio 8.
    expect(d).toContain("Q 250 550");
  });

  it("funciona em linha reta horizontal ou vertical sem curva degenerada", () => {
    const horiz = edgePath("a1", "c1", 100);
    expect(horiz).toBe("M 50 550 L 250 550");
    const vert = edgePath("a1", "a3", 100);
    expect(vert).toBe("M 50 550 L 50 350");
  });
});

describe("notation", () => {
  it.each(Object.entries(boards))(
    "tabuleiro %s: gera uma linha por aresta mais a linha de peças perdidas",
    (_id, board) => {
      const pt = notation(board, "pt");
      const en = notation(board, "en");
      expect(pt).toHaveLength(board.edges.length + 1);
      expect(en).toHaveLength(board.edges.length + 1);
      expect(pt[0]).toMatch(/^1\. .+ → .+$/);
      expect(pt.at(-1)).toBe("Peças perdidas: 0");
      expect(en.at(-1)).toBe("Pieces lost: 0");
    },
  );
});

describe("boardToSvg e escapeXml", () => {
  it("escapa caracteres especiais de XML", () => {
    expect(escapeXml(`P&D <teste> "a" 'x'`)).toBe(
      "P&amp;D &lt;teste&gt; &quot;a&quot; &apos;x&apos;",
    );
  });

  it("gera XML válido mesmo com '&', '<' e aspas no título, um <text> por nó e borda âmbar no crítico", () => {
    const board = boards[2]; // AuthGuard
    const svg = boardToSvg(board, "P&D <teste> 'x' \"y\"", "pt");
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    expect(doc.querySelector("parsererror")).toBeNull();

    const nodeTexts = doc.querySelectorAll("[data-board-node] text[data-node-label]");
    expect(nodeTexts).toHaveLength(board.nodes.length);

    const critical = doc.querySelector('[data-critical="true"]');
    expect(critical).not.toBeNull();
    expect(critical?.getAttribute("stroke")).toBe("#F5A524");
  });

  it("funciona quando um nó não tem nodeSpec (usa o label)", () => {
    const custom: Board = {
      nodes: [
        { id: "x", label: { pt: "Nó A & B", en: "Node A & B" }, piece: "pawn", square: "a1" },
        { id: "y", label: { pt: "Banco <Z>", en: "DB <Z>" }, piece: "king", square: "c3", critical: true },
      ],
      edges: [{ from: "x", to: "y", label: { pt: "HTTP & TLS", en: "HTTP & TLS" } }],
    };
    const notes = notation(custom, "pt");
    expect(notes).toEqual(["1. Nó A & B → Banco <Z> (HTTP & TLS)", "Peças perdidas: 0"]);

    const svg = boardToSvg(custom, "Teste", "pt");
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    expect(doc.querySelector("parsererror")).toBeNull();
    expect(svg).toContain("Nó A &amp; B");
    expect(svg).toContain(PIECE_GLYPH.king);
  });
});
