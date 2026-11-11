import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { DIA600, DIA600_STAGES } from "@/data/dia600";
import { dia600Frame } from "@/lib/dia600";

describe("dia600Frame", () => {
  it("começa em 300 t, 0 caminhões e a primeira frase", () => {
    expect(dia600Frame(0)).toMatchObject({ tons: 300, trucks: 0, line: 0, morph: 0 });
  });

  it("em 80% do trecho chega a 600 t e 40 caminhões, juntos", () => {
    expect(dia600Frame(0.8)).toMatchObject({ tons: 600, trucks: 40 });
    expect(dia600Frame(0.79).trucks).toBeLessThan(40);
  });

  it("as frases trocam nos pontos da spec", () => {
    expect([0, 0.25, 0.5, 0.7, 0.86].map((p) => dia600Frame(p).line)).toEqual([0, 1, 2, 3, 4]);
    expect(dia600Frame(0.249).line).toBe(0);
  });

  it("a troca de nomes vai de 0,84 a 0,94 e as fichas somem antes", () => {
    expect(dia600Frame(0.84).morph).toBe(0);
    expect(dia600Frame(0.94).morph).toBe(1);
    expect(dia600Frame(0.85).chips.every((c) => !c.visible)).toBe(true);
  });

  it("tem 16 fichas, e a ficha k anda na coluna carga·9 − 0,42k", () => {
    const f = dia600Frame(0.4);
    expect(f.chips).toHaveLength(DIA600.chips);
    expect(f.chips[0].pos).toBeCloseTo(4.5, 10);
    expect(f.chips[3].pos).toBeCloseTo(4.5 - 1.26, 10);
    expect(f.chips[0].visible).toBe(true);
    // Ainda não entrou (pos ≤ 0) e já saiu (pos ≥ 5).
    expect(dia600Frame(0).chips.some((c) => c.visible)).toBe(false);
    expect(dia600Frame(0.6).chips[0].visible).toBe(false);
  });

  it("toneladas e caminhões nunca descem com a rolagem, e perdidos fica em 0", () => {
    fc.assert(
      fc.property(fc.double({ min: -0.5, max: 1.5, noNaN: true }), fc.double({ min: -0.5, max: 1.5, noNaN: true }), (a, b) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const x = dia600Frame(lo);
        const y = dia600Frame(hi);
        expect(y.tons).toBeGreaterThanOrEqual(x.tons);
        expect(y.trucks).toBeGreaterThanOrEqual(x.trucks);
        for (const f of [x, y]) {
          expect(f.tons).toBeGreaterThanOrEqual(DIA600.baseTons);
          expect(f.tons).toBeLessThanOrEqual(DIA600.peakTons);
          expect(f.morph).toBeGreaterThanOrEqual(0);
          expect(f.morph).toBeLessThanOrEqual(1);
        }
        expect(DIA600.lost).toBe(0);
      }),
    );
  });
});

describe("DIA600_STAGES", () => {
  it("liga cada etapa da logística à peça do código, na ordem", () => {
    expect(DIA600_STAGES.map((s) => `${s.id}→${s.code}`)).toEqual([
      "pedido→interface",
      "separacao→api",
      "conferencia→queue",
      "carregamento→worker",
      "lojas→db",
    ]);
  });
});
