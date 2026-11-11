import { describe, expect, it } from "vitest";
import fixture from "../fixtures/olhar-v3b/report.json";
import accepted from "../fixtures/olhar-v3b/curve.json";
import { median3, noiseOf, firstFrame, lastFrame, balanceK, buildCurve, realEnergy, binRatios, gates, inverseCurve } from "../../tools/hero-vertical.mjs";

const up = fixture.clips.cima.calculation.rawMotion;
const down = fixture.clips.baixo.calculation.rawMotion;
const gateInput = {
  motion: fixture.headMotion, K: 42, bUp: 0.2400173611111111, bDown: 0.38447627314814814,
  curve: accepted.olharVCurve, neutralSsim: [0.989083, 0.985682], nativeSsim: 0.990175,
  nativeReference: 0.990406, canonicalSource: true, bytes: 433609, firstLoad: 748528,
};

describe("pipeline vertical aprovado", () => {
  it("calcula os cortes a partir do movimento e da cauda parada", () => {
    const um = median3(up), dm = median3(down);
    const ub = noiseOf(um), db = noiseOf(dm);
    expect(ub).toBeCloseTo(0.2400174, 7);
    expect(db).toBeCloseTo(0.3844763, 7);
    expect(firstFrame(um, ub)).toBe(4);
    expect(firstFrame(dm, db)).toBe(8);
    expect(() => firstFrame(dm, db, 7)).toThrow();
    expect(lastFrame(um, ub, 4)).toBe(48);
    expect(lastFrame(dm, db, 8)).toBe(49);
    expect(balanceK([{ F: 4, L: 48 }, { F: 8, L: 49 }])).toBe(42);
  });

  it("reproduz a curva aceita com a neutra exata e sem gastar y na diferença de render", () => {
    const curve = buildCurve({ mt: median3(up), b: gateInput.bUp, F: 4 }, { mt: median3(down), b: gateInput.bDown, F: 8 }, 42);
    expect(curve).toHaveLength(85);
    expect(curve[42]).toBe(0.5);
    curve.forEach((v, k) => {
      expect(Math.abs(v - accepted.olharVCurve[k])).toBeLessThan(1e-9);
      if (k) expect(v).toBeGreaterThan(curve[k - 1]);
    });
    expect(inverseCurve(curve, 0)).toBe(0);
    expect(inverseCurve(curve, 0.5)).toBe(42);
    expect(inverseCurve(curve, 1)).toBe(84);
  });

  it("mede G2 no deslocamento real, independentemente da energia da curva", () => {
    const ratios = binRatios(realEnergy(fixture.headMotion, 42, gateInput.bUp, gateInput.bDown), accepted.olharVCurve, 42);
    expect(Math.min(...ratios)).toBeCloseTo(0.839076, 5);
    expect(Math.max(...ratios)).toBeCloseTo(1.219289, 5);
    const result = gates(gateInput);
    expect(result.G1.value).toBeCloseTo(2.2453, 3);
    expect(result.G3.value).toEqual([0, 0]);
    expect(Object.values(result).every(g => g.pass)).toBe(true);
    const badMotion = [...fixture.headMotion]; badMotion[43] = 60;
    expect(gates({ ...gateInput, motion: badMotion }).G2.pass).toBe(false);
  });

  it("reprova emenda, neutra de outra origem e aumento da carga", () => {
    expect(gates({ ...gateInput, neutralSsim: [0.94, 0.99] }).G1b.pass).toBe(false);
    expect(gates({ ...gateInput, canonicalSource: false }).G4.pass).toBe(false);
    expect(gates({ ...gateInput, nativeSsim: 0.98 }).G4.pass).toBe(false);
    expect(gates({ ...gateInput, bytes: 533586 }).G6.pass).toBe(false);
    expect(gates({ ...gateInput, firstLoad: 748529 }).G6.pass).toBe(false);
  });

  it("recusa material sem movimento útil", () => {
    expect(() => firstFrame(Array(64).fill(0), 0)).toThrow();
    expect(() => lastFrame(Array(64).fill(0), 0, 4)).toThrow();
    expect(() => balanceK([{ F: 5, L: 4 }])).toThrow();
  });
});
