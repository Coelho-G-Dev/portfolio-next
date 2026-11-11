import { describe, expect, it } from "vitest";
import { nodeSpecs } from "@/data/nodeSpecs";
import { projects } from "@/data/projects";
import { siteCopy } from "@/lib/i18n/site";
import type { DirectEvent } from "@/lib/directFlow";
import type { FlowEvent } from "@/lib/messageFlow";

// Lista cada folha da árvore de textos como "caminho: tipo".
function shape(value: unknown, path = ""): string[] {
  if (Array.isArray(value)) {
    return [`${path}: array(${value.length})`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  }
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .flatMap((k) => shape((value as Record<string, unknown>)[k], path ? `${path}.${k}` : k));
  }
  return [`${path}: ${typeof value}`];
}

function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  }
  return [];
}

describe("textos PT/EN (site)", () => {
  it("têm exatamente as mesmas chaves, tipos e tamanhos de lista", () => {
    expect(shape(siteCopy.en)).toEqual(shape(siteCopy.pt));
  });

  it.each(["pt", "en"] as const)("nenhuma string vazia em %s", (lang) => {
    const empty = strings(siteCopy[lang])
      .filter(([, s]) => s.trim() === "")
      .map(([p]) => p);
    expect(empty).toEqual([]);
  });

  it("caminhos de fotos e links são os mesmos nas duas línguas", () => {
    const urls = (lang: "pt" | "en") =>
      strings(siteCopy[lang])
        .filter(([, s]) => /^(\/|https?:|mailto:|#)/.test(s))
        .sort(([a], [b]) => a.localeCompare(b));
    expect(urls("en")).toEqual(urls("pt"));
  });
});

describe("textos não têm termos sem prova", () => {
  // Itens sem projeto que comprove e expressões genéricas que já saíram do site.
  const banned =
    /\bJava\b|Spring|Outbox|Linux|CI\/CD|alta concorrência|high-concurrency|empresarial|enterprise|táteis|tactile|resili|60 FPS|Prévia do (redesign|site)|não indexada|\bpreview\b/i;

  // Também lê textos montados por função (open, closeAndBack, tilesText…),
  // chamando cada uma com argumentos de exemplo. derrube.event recebe um
  // evento de verdade só no outro teste; aqui devolve undefined e fica de fora,
  // porque a simulação fala de outbox de propósito.
  function texts(value: unknown, path = ""): [string, string][] {
    if (typeof value === "string") return [[path, value]];
    if (typeof value === "function") {
      try {
        const out = (value as (...a: unknown[]) => unknown)("X", 1);
        return typeof out === "string" ? [[`${path}()`, out]] : [];
      } catch {
        return [];
      }
    }
    if (value && typeof value === "object") {
      return Object.entries(value).flatMap(([k, v]) => texts(v, path ? `${path}.${k}` : k));
    }
    return [];
  }

  const hitsIn = (value: unknown) =>
    texts(value)
      .filter(([, s]) => banned.test(s))
      .map(([path, s]) => `${path}: ${s}`);

  it.each(["pt", "en"] as const)("nenhum texto do site usa termo proibido em %s", (lang) => {
    expect(hitsIn(siteCopy[lang])).toEqual([]);
  });

  it("os textos dos projetos e das peças do tabuleiro também não usam", () => {
    expect(hitsIn(projects)).toEqual([]);
    expect(hitsIn(nodeSpecs)).toEqual([]);
  });

  it.each(["pt", "en"] as const)("a Bancada não lista ferramenta sem projeto em %s", (lang) => {
    const names = siteCopy[lang].about.stackCategories.flatMap((cat) => cat.items.map((i) => i.name));
    expect(names.filter((n) => /Java|Spring|Outbox|Linux/.test(n))).toEqual([]);
  });

  it.each(["pt", "en"] as const)("títulos da Bancada não empilham '&' em %s", (lang) => {
    const c = siteCopy[lang];
    const titles = [c.about.stackTitle, ...c.about.stackCategories.map((cat) => cat.name)];
    expect(titles.filter((t) => t.includes("&"))).toEqual([]);
  });
});

describe("números do texto batem com os dados dos projetos", () => {
  it("a legenda do contrato cita o mesmo total de rotas da API do Cidade Energia", () => {
    const api = JSON.stringify(projects.find((p) => p.title === "Cidade Energia"));
    const total = /(\d+) rotas validadas/.exec(api)?.[1];
    expect(total).toBeDefined();
    expect(siteCopy.pt.how.contractCaption).toContain(`${total} rotas`);
    expect(siteCopy.en.how.contractCaption).toContain(`${total} documented routes`);
  });
});

describe("eventos do Derrube no site", () => {
  const events: (FlowEvent | DirectEvent)[] = [
    { kind: "sent", id: 1 },
    { kind: "waitingApi", id: 1 },
    { kind: "outbox", id: 1 },
    { kind: "waitingWorker", id: 1 },
    { kind: "retry", id: 1, attempt: 1, max: 3, delay: 2 },
    { kind: "toDlq", id: 1 },
    { kind: "replayed", id: 1 },
    { kind: "delivered", id: 1 },
    { kind: "lost", id: 1, service: "worker" },
  ];

  it.each(["pt", "en"] as const)("todo evento vira uma frase em %s", (lang) => {
    for (const e of events) {
      const text = siteCopy[lang].derrube.event(e);
      expect(typeof text, e.kind).toBe("string");
      expect(text.trim().length, e.kind).toBeGreaterThan(0);
    }
  });

  it("a tentativa diz em quantos segundos tenta de novo", () => {
    const text = siteCopy.pt.derrube.event({ kind: "retry", id: 1, attempt: 1, max: 3, delay: 2 });
    expect(text).toContain("1,5 s");
  });
});

describe("textos do capítulo de projetos no site", () => {
  it.each(["pt", "en"] as const)("open(name) inclui o nome da porta em %s", (lang) => {
    const label = siteCopy[lang].projetos.open("Back-end");
    expect(label).toContain("Back-end");
  });

  it("tem as três portas com nome e teaser nas duas línguas", () => {
    expect(Object.keys(siteCopy.pt.projetos.doors).sort()).toEqual(["backend", "frontend", "ia"]);
    expect(Object.keys(siteCopy.en.projetos.doors).sort()).toEqual(["backend", "frontend", "ia"]);
  });
});
