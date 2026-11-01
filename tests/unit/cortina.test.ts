import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { chapterEffect, COVERED_AT, coverage, stickTop } from "@/lib/cortina";

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

  it("totalmente coberto: encolhe 5% e escurece 45%", () => {
    expect(chapterEffect(1, normal)).toEqual({ scale: 0.95, shade: 0.45 });
  });

  it("no celular não escala, mas escurece", () => {
    expect(chapterEffect(1, { compact: true, reduced: false })).toEqual({ scale: 1, shade: 0.45 });
  });

  it("com movimento reduzido não escala nem escurece", () => {
    for (const cover of [0, 0.3, 1]) {
      expect(chapterEffect(cover, { compact: false, reduced: true })).toEqual({ scale: 1, shade: 0 });
    }
  });

  it("propriedade: limites e monotonicidade em cover", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0, max: 1, noNaN: true }), fc.boolean(), (a, b, compact) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const e1 = chapterEffect(lo, { compact, reduced: false });
        const e2 = chapterEffect(hi, { compact, reduced: false });
        for (const e of [e1, e2]) {
          expect(e.scale).toBeGreaterThanOrEqual(0.95 - 1e-12);
          expect(e.scale).toBeLessThanOrEqual(1);
          expect(e.shade).toBeGreaterThanOrEqual(0);
          expect(e.shade).toBeLessThanOrEqual(0.45 + 1e-12);
        }
        expect(e2.scale).toBeLessThanOrEqual(e1.scale);
        expect(e2.shade).toBeGreaterThanOrEqual(e1.shade);
      }),
      { numRuns: 500 },
    );
  });

  it("o limiar de coberto é 0,9", () => {
    expect(COVERED_AT).toBe(0.9);
  });
});
