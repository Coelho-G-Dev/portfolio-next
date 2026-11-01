import { describe, expect, it } from "vitest";
import { boards, PIECE_ROLE } from "@/data/boards";
import { nodeSpecs } from "@/data/nodeSpecs";
import { projects, type Door, type LocalizedString } from "@/data/projects";

const DOORS: Door[] = ["backend", "frontend", "ia"];

function inDoor(door: Door) {
  return projects.filter((p) => p.doors?.includes(door));
}

// Coleta todo objeto { pt, en } de uma árvore de dados.
function localized(value: unknown, path = ""): [string, LocalizedString][] {
  if (Array.isArray(value)) return value.flatMap((v, i) => localized(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (typeof o.pt === "string" && typeof o.en === "string") return [[path, o as LocalizedString]];
    return Object.entries(o).flatMap(([k, v]) => localized(v, path ? `${path}.${k}` : k));
  }
  return [];
}

describe("portas e facetas dos projetos", () => {
  it("todo projeto tem pelo menos uma porta, e toda porta listada tem faceta", () => {
    for (const p of projects) {
      expect(p.doors?.length ?? 0, p.title).toBeGreaterThan(0);
      for (const door of p.doors ?? []) {
        expect(p.facets?.[door], `${p.title} / ${door}`).toBeDefined();
      }
    }
  });

  it("nenhum projeto tem faceta de uma porta em que não está", () => {
    for (const p of projects) {
      for (const door of Object.keys(p.facets ?? {}) as Door[]) {
        expect(p.doors, `${p.title} / ${door}`).toContain(door);
      }
    }
  });

  it("toda faceta tem linha, stack e pelo menos um link que existe no projeto", () => {
    const url = { github: "githubLink", frontend: "frontendLink", demo: "demoLink", docs: "apiDocsLink" } as const;
    for (const p of projects) {
      for (const [door, f] of Object.entries(p.facets ?? {})) {
        expect(f.stack.length, `${p.title} / ${door}`).toBeGreaterThan(0);
        expect(f.links.length, `${p.title} / ${door}`).toBeGreaterThan(0);
        for (const link of f.links) expect(p[url[link]], `${p.title} / ${door} / ${link}`).toBeTruthy();
      }
    }
  });

  it('a porta "frontend" tem exatamente o Cidade Energia', () => {
    expect(inDoor("frontend").map((p) => p.title)).toEqual(["Cidade Energia"]);
  });

  it("as portas seguem a spec", () => {
    const doorsOf = (title: string) => projects.find((p) => p.title === title)?.doors;
    expect(doorsOf("Cidade Energia")).toEqual(["backend", "frontend", "ia"]);
    for (const t of ["AuthGuard", "Guia Maranhão", "BuscaSUS"]) expect(doorsOf(t), t).toEqual(["backend"]);
    for (const t of ["RAG Serviços Públicos", "API Financeira Inteligente"]) expect(doorsOf(t), t).toEqual(["ia", "backend"]);
  });

  it("a faceta front-end do Cidade Energia mostra os testes do PWA e os links do front e da demo", () => {
    const f = projects.find((p) => p.title === "Cidade Energia")?.facets?.frontend;
    expect(f?.metrics?.some((m) => m.value.pt.includes("133"))).toBe(true);
    expect(f?.links).toEqual(["frontend", "demo"]);
  });

  it("todo projeto da porta backend tem tabuleiro", () => {
    for (const p of inDoor("backend")) expect(boards[p.id], p.title).toBeDefined();
  });
});

describe.each(Object.entries(boards))("tabuleiro do projeto %s", (id, board) => {
  it("as casas são válidas e únicas", () => {
    const squares = board.nodes.map((n) => n.square);
    for (const sq of squares) expect(sq).toMatch(/^[a-h][1-6]$/);
    expect(new Set(squares).size).toBe(squares.length);
  });

  it("os ids dos nós são únicos e toda aresta liga nós que existem", () => {
    const ids = board.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(board.edges.length).toBeGreaterThan(0);
    for (const e of board.edges) {
      expect(ids, `${e.from} → ${e.to}`).toContain(e.from);
      expect(ids, `${e.from} → ${e.to}`).toContain(e.to);
    }
  });

  it("tem exatamente um nó crítico", () => {
    expect(board.nodes.filter((n) => n.critical)).toHaveLength(1);
  });

  it("todo spec existe em nodeSpecs", () => {
    for (const n of board.nodes) if (n.spec) expect(nodeSpecs[n.spec], `${id} / ${n.id}`).toBeDefined();
  });

  it("todo banco de dados é o rei", () => {
    for (const n of board.nodes) {
      const spec = n.spec ? nodeSpecs[n.spec] : undefined;
      const isDb = spec?.color === "blue" && /postgres|mongo|pgvector|banco|database/i.test(`${n.spec} ${n.label.pt}`);
      if (isDb) expect(n.piece, `${id} / ${n.id}`).toBe("king");
    }
  });
});

describe("paridade de idioma dos dados novos", () => {
  const trees = {
    facets: projects.map((p) => p.facets),
    boards,
    PIECE_ROLE,
  };

  it.each(Object.entries(trees))("todo texto em %s tem pt e en não vazios", (_name, tree) => {
    const found = localized(tree);
    expect(found.length).toBeGreaterThan(0);
    const bad = found.filter(([, s]) => !s.pt.trim() || !s.en.trim()).map(([p]) => p);
    expect(bad).toEqual([]);
  });

  it("toda peça tem um papel na legenda", () => {
    expect(Object.keys(PIECE_ROLE).sort()).toEqual(["bishop", "king", "knight", "pawn", "queen", "rook"]);
  });

  it("toda porta é uma das três", () => {
    for (const p of projects) for (const d of p.doors ?? []) expect(DOORS).toContain(d);
  });
});
