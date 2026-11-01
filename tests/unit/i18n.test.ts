import { describe, expect, it } from "vitest";
import { redesignCopy } from "@/lib/i18n/redesign";
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

describe.each([
  ["redesign", redesignCopy],
  ["site", siteCopy],
] as const)("textos PT/EN (%s)", (_name, copy) => {
  it("têm exatamente as mesmas chaves, tipos e tamanhos de lista", () => {
    expect(shape(copy.en)).toEqual(shape(copy.pt));
  });

  it.each(["pt", "en"] as const)("nenhuma string vazia em %s", (lang) => {
    const empty = strings(copy[lang])
      .filter(([, s]) => s.trim() === "")
      .map(([p]) => p);
    expect(empty).toEqual([]);
  });

  it("caminhos de fotos e links são os mesmos nas duas línguas", () => {
    const urls = (lang: "pt" | "en") =>
      strings(copy[lang])
        .filter(([, s]) => /^(\/|https?:|mailto:|#)/.test(s))
        .sort(([a], [b]) => a.localeCompare(b));
    expect(urls("en")).toEqual(urls("pt"));
  });
});

describe("eventos do Derrube no site novo", () => {
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

describe("textos do capítulo de projetos no site novo", () => {
  it.each(["pt", "en"] as const)("open(name) inclui o nome da porta em %s", (lang) => {
    const label = siteCopy[lang].projetos.open("Back-end");
    expect(label).toContain("Back-end");
  });

  it("tem as três portas com nome e teaser nas duas línguas", () => {
    expect(Object.keys(siteCopy.pt.projetos.doors).sort()).toEqual(["backend", "frontend", "ia"]);
    expect(Object.keys(siteCopy.en.projetos.doors).sort()).toEqual(["backend", "frontend", "ia"]);
  });
});
