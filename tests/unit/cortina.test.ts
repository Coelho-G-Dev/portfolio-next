import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { chapterEffect, COVERED_AT, coverage, stickTop, uncoverScroll } from "@/lib/cortina";

describe("stickTop", () => {
  it("capítulo menor que a tela gruda no topo", () => {
    expect(stickTop(600, 800)).toBe(0);
  });

  it("capítulo mais alto que a tela gruda pela base", () => {
    expect(stickTop(1300, 800)).toBe(-500);
  });
});

describe("coverage", () => {
  it("é a fração da tela já coberta pelo capítulo seguinte", () => {
    expect(coverage(800, 800)).toBe(0);
    expect(coverage(400, 800)).toBe(0.5);
  });

  it("fica limitada a [0, 1]", () => {
    expect(coverage(-50, 800)).toBe(1);
    expect(coverage(2000, 800)).toBe(0);
  });
});

describe("chapterEffect", () => {
  const normal = { compact: false, reduced: false };

  it("totalmente coberto: encolhe 7%, escurece 60% e arredonda 28 px", () => {
    expect(chapterEffect(1, normal)).toEqual({ scale: 0.93, shade: 0.6, round: 28 });
  });

  it("no celular não escala, mas escurece 45%", () => {
    expect(chapterEffect(1, { compact: true, reduced: false })).toEqual({ scale: 1, shade: 0.45, round: 28 });
  });

  it("a curva é suave: na metade da cobertura, metade do efeito", () => {
    expect(chapterEffect(0.5, normal).shade).toBeCloseTo(0.3, 10);
    expect(chapterEffect(0.25, normal).shade).toBeCloseTo(0.6 * 0.15625, 10); // smooth(0,25)=0,15625
  });

  it("com movimento reduzido não escala, não escurece nem arredonda", () => {
    for (const cover of [0, 0.3, 1]) {
      expect(chapterEffect(cover, { compact: false, reduced: true })).toEqual({ scale: 1, shade: 0, round: 0 });
    }
  });

  it("propriedade: limites e monotonicidade em cover", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0, max: 1, noNaN: true }), fc.boolean(), (a, b, compact) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const e1 = chapterEffect(lo, { compact, reduced: false });
        const e2 = chapterEffect(hi, { compact, reduced: false });
        const maxShade = compact ? 0.45 : 0.6;
        for (const e of [e1, e2]) {
          expect(e.scale).toBeGreaterThanOrEqual(0.93 - 1e-12);
          expect(e.scale).toBeLessThanOrEqual(1);
          expect(e.shade).toBeGreaterThanOrEqual(0);
          expect(e.shade).toBeLessThanOrEqual(maxShade + 1e-12);
          expect(e.round).toBeGreaterThanOrEqual(0);
          expect(e.round).toBeLessThanOrEqual(28 + 1e-12);
        }
        expect(e2.scale).toBeLessThanOrEqual(e1.scale);
        expect(e2.shade).toBeGreaterThanOrEqual(e1.shade);
        expect(e2.round).toBeGreaterThanOrEqual(e1.round);
      }),
      { numRuns: 500 },
    );
  });

  it("o limiar de coberto é 0,9", () => {
    expect(COVERED_AT).toBe(0.9);
  });
});

describe("uncoverScroll", () => {
  const vh = 800;
  // Capítulo de 2000 px que começa em 1000: gruda (pela base) em 1000 + 1200 = 2200.
  const chapter = { top: 1000, height: 2000 };

  it("elemento no alto do capítulo: centrado na tela", () => {
    expect(uncoverScroll({ top: 1400, height: 40 }, chapter, vh, false)).toBe(1400 - 380);
  });

  it("elemento no pé de um capítulo alto: para onde o capítulo gruda, antes de a folha seguinte cobrir", () => {
    expect(uncoverScroll({ top: 2900, height: 40 }, chapter, vh, false)).toBe(2200);
  });

  it("no último capítulo, que não gruda, só centra", () => {
    expect(uncoverScroll({ top: 2900, height: 40 }, chapter, vh, true)).toBe(2900 - 380);
  });

  it("nunca rola para antes do topo da página", () => {
    expect(uncoverScroll({ top: 20, height: 40 }, { top: 0, height: 900 }, vh, false)).toBe(0);
  });

  it("propriedade: o elemento fica inteiro na tela e o capítulo não passa do ponto em que gruda", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5000 }),
        fc.integer({ min: 200, max: 6000 }),
        fc.integer({ min: 300, max: 1200 }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.integer({ min: 1, max: 200 }),
        (cTop, cHeight, view, at, h) => {
          fc.pre(h <= view && h <= cHeight);
          const top = cTop + at * (cHeight - h);
          const y = uncoverScroll({ top, height: h }, { top: cTop, height: cHeight }, view, false);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(cTop + Math.max(0, cHeight - view) + 1e-9);
          expect(top - y).toBeGreaterThanOrEqual(-1e-9);
          expect(top + h - y).toBeLessThanOrEqual(view + 1e-9);
        },
      ),
      { numRuns: 500 },
    );
  });
});
