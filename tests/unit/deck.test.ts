import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { deckEntrance, deckLayout, deckProgressFor, deckMode } from "@/lib/deck";

describe("deckMode", () => {
  it.each([
    [null, 700, 500, 900, "full"],
    [null, 700, 500, 640, "compact"],
    [null, 700, 620, 640, "list"],
    [null, 852, 600, 900, "full"],
    ["compact", 840, 500, 900, "compact"],
    ["compact", 820, 500, 900, "full"],
    ["list", 900, 580, 640, "list"],
    ["list", 900, 568, 640, "compact"],
    ["full", 853, 500, 900, "compact"],
  ] as const)("%s, full %i, compact %i, palco %i → %s", (prev, full, compact, height, expected) => {
    expect(deckMode(prev, full, compact, height)).toBe(expected);
  });
});

describe("deckLayout", () => {
  it("no início, só a carta 01 está na frente e as outras esperam embaixo", () => {
    const L = deckLayout(0, 4, 800);
    expect(L[0]).toEqual({ y: 0, rotate: 0, scale: 1, shade: 0 });
    for (const c of L.slice(1)) expect(c.y).toBeCloseTo(680, 6);
  });

  it("no fim, a carta 04 está na frente e a 01 é a mais funda", () => {
    const L = deckLayout(1, 4, 800);
    expect(L[3]).toEqual({ y: 0, rotate: 0, scale: 1, shade: 0 });
    expect(L[0].scale).toBeCloseTo(0.85, 10);
    expect(L[0].shade).toBeCloseTo(0.45, 10);
  });

  it("deckProgressFor leva cada carta inteira para a frente", () => {
    for (let j = 1; j < 4; j++) {
      const d = deckProgressFor(j, 4);
      expect(deckLayout(d, 4, 800)[j].y).toBeCloseTo(0, 6); // inteira na frente, nenhuma carta à frente dela
    }
    expect(deckProgressFor(0, 4)).toBe(0);
  });

  it("deckEntrance: a carta 01 já começa inteira; no fim, todas entraram", () => {
    expect(deckEntrance(0, 4)).toEqual([1, 0, 0, 0]);
    expect(deckEntrance(1, 4)).toEqual([1, 1, 1, 1]);
    expect(deckEntrance(deckProgressFor(2, 4), 4)[3]).toBeCloseTo(0, 6);
  });

  it("escala entre 0,85 e 1, escurecer entre 0 e 0,45, e cada carta só sobe com o progresso", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.integer({ min: 300, max: 1400 }),
        (a, b, vh) => {
          const [lo, hi] = a <= b ? [a, b] : [b, a];
          const before = deckLayout(lo, 4, vh);
          const after = deckLayout(hi, 4, vh);
          for (let j = 0; j < 4; j++) {
            for (const c of [before[j], after[j]]) {
              expect(c.scale).toBeGreaterThanOrEqual(0.85 - 1e-12);
              expect(c.scale).toBeLessThanOrEqual(1);
              expect(c.shade).toBeGreaterThanOrEqual(0);
              expect(c.shade).toBeLessThanOrEqual(0.45);
            }
            expect(after[j].y).toBeLessThanOrEqual(before[j].y + 1e-9);
          }
        },
      ),
    );
  });
});
