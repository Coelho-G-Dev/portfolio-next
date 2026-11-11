import { describe, expect, it } from "vitest";
import { frameForPos, frameTime, frameFromMediaTime } from "@/lib/gazeCurve";
import { inverseCurve } from "../../tools/hero-vertical.mjs";
import accepted from "../fixtures/olhar-v3b/curve.json";

describe("posição do olhar em quadros", () => {
  it("alcança extremos e a neutra exata do horizontal par", () => {
    expect(frameForPos(0, 116, 58)).toBe(0);
    expect(frameForPos(0.5, 116, 58)).toBe(58);
    expect(frameForPos(1, 116, 58)).toBe(115);
    expect(frameForPos(0.25, 116, 58)).toBe(29);
  });
  it("inverte a curva aprovada e nunca volta atrás", () => {
    const curve = accepted.olharVCurve;
    curve.forEach((p, k) => expect(frameForPos(p, 85, 42, curve)).toBe(k));
    let last = -1;
    for (let i = 0; i <= 1000; i++) {
      const k = frameForPos(i / 1000, 85, 42, curve);
      expect(k).toBeGreaterThanOrEqual(last);
      expect(k).toBe(inverseCurve(curve, i / 1000));
      last = k;
    }
    expect(frameForPos(0.5, 85, 42, curve)).toBe(42);
  });
  it("limita posições inválidas e pede o centro de cada quadro", () => {
    expect(frameForPos(-1, 116, 58)).toBe(0);
    expect(frameForPos(2, 116, 58)).toBe(115);
    expect(frameForPos(NaN, 116, 58)).toBe(58);
    expect(frameTime(42)).toBe(42.5 / 24);
    for (let k = 0; k < 116; k++) expect(frameFromMediaTime(frameTime(k) - 0.5 / 24)).toBe(k);
  });
});
