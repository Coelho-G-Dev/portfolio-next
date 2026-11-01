import { describe, expect, it } from "vitest";
import { redesignCopy } from "@/lib/i18n/redesign";
import { siteCopy } from "@/lib/i18n/site";

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
