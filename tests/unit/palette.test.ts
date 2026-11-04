import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getContrastRatio } from "@/lib/accessibility";
import { PALETTE, TEXT_PAIRS, UI_PAIRS, type Tone } from "@/lib/palette";

const kebab = (tone: string) => tone.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

describe("paleta Tabuleiro", () => {
  it("tem exatamente os seis tons da spec", () => {
    expect(PALETTE).toEqual({
      ebano: "#0E0F13",
      nogueiraEscura: "#2A2018",
      nogueira: "#8A6A4A",
      bordo: "#D9C3A0",
      marfim: "#F4EEE3",
      ambar: "#F5A524",
    });
  });

  it("todo par de texto passa no mínimo AA declarado", () => {
    const rows = TEXT_PAIRS.map((p) => ({
      texto: p.fg,
      fundo: p.bg,
      razao: Number(getContrastRatio(PALETTE[p.fg], PALETTE[p.bg]).toFixed(2)),
      minimo: p.min,
    }));
    // Registro pedido pela spec §5.1: a razão medida de cada par.
    console.table(rows);
    for (const r of rows) expect(r.razao, `${r.texto} sobre ${r.fundo}`).toBeGreaterThanOrEqual(r.minimo);
  });

  it("toda borda ou ícone tem contraste de 3:1", () => {
    for (const p of UI_PAIRS) {
      expect(getContrastRatio(PALETTE[p.fg], PALETTE[p.bg]), `${p.fg} sobre ${p.bg}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("âmbar nunca é texto sobre marfim e nogueira nunca é texto", () => {
    expect(TEXT_PAIRS).not.toContainEqual(expect.objectContaining({ fg: "ambar", bg: "marfim" }));
    expect(TEXT_PAIRS.filter((p) => p.fg === "nogueira")).toEqual([]);
  });

  it("os tokens CSS do site usam os mesmos hex", () => {
    const css = readFileSync("app/site.css", "utf8");
    for (const [tone, hex] of Object.entries(PALETTE) as [Tone, string][]) {
      const match = css.match(new RegExp(`--c-${kebab(tone)}:\\s*(#[0-9a-fA-F]{6});`));
      expect(match?.[1]?.toUpperCase(), `--c-${kebab(tone)}`).toBe(hex);
    }
  });
});
