import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadManifest, verticalOf, type HeroManifest } from "@/lib/heroManifest";
import accepted from "../fixtures/olhar-v3b/curve.json";

const valid: HeroManifest = {
  bg: "#e2dac9",
  width: 1280,
  height: 720,
  poster: "poster.webp",
  entrada: "entrada.mp4",
  olhar: "olhar.mp4",
  olharFrames: 116,
  olharNeutral: 58,
  olharLoop: "olhar-loop.mp4",
  reactions: { hover: "hover.mp4", "clique-1": "clique-1.mp4" },
  bytes: { "poster.webp": 1, "entrada.mp4": 1 },
};

describe("manifest do hero", () => {
  it("exige a geometria do horizontal e mantém o vertical inválido como fallback", () => {
    expect(() => loadManifest({ ...valid, olharFrames: undefined })).toThrow(/olharFrames/);
    expect(() => loadManifest({ ...valid, olharNeutral: 116 })).toThrow(/olharNeutral/);
    const legacy = loadManifest({ ...valid, olharV: "olhar-v.mp4" });
    expect(verticalOf(legacy)).toBeNull();
    expect(verticalOf(loadManifest(JSON.parse(readFileSync("public/hero/manifest.json", "utf8"))))).not.toBeNull();
  });

  it("entrega somente a curva vertical validada", () => {
    const m = { ...valid, olharV: "olhar-v.mp4", olharVFrames: 85, olharVNeutral: 42, olharVCurve: accepted.olharVCurve };
    expect(verticalOf(m)).toEqual({ file: "olhar-v.mp4", frames: 85, neutral: 42, curve: accepted.olharVCurve });
    const bad = [
      { olharVCurve: undefined }, { olharVFrames: 84 }, { olharVNeutral: 41 },
      { olharVCurve: accepted.olharVCurve.slice(1) },
      { olharVCurve: accepted.olharVCurve.map((v, k) => k === 0 ? 0.01 : v) },
      { olharVCurve: accepted.olharVCurve.map((v, k) => k === 84 ? 0.99 : v) },
      { olharVCurve: accepted.olharVCurve.map((v, k) => k === 42 ? 0.49 : v) },
      { olharVCurve: accepted.olharVCurve.map((v, k) => k === 20 ? NaN : v) },
      { olharVCurve: accepted.olharVCurve.map((v, k) => k === 20 ? accepted.olharVCurve[19] : v) },
    ];
    for (const fields of bad) expect(verticalOf(loadManifest({ ...m, ...fields }))).toBeNull();
  });
  it("aceita um manifest completo", () => {
    expect(loadManifest(valid)).toEqual(valid);
  });

  it("aceita o olhar vertical opcional e conserva compatibilidade sem ele", () => {
    expect(loadManifest({ ...valid, olharV: "olhar-v.mp4" }).olharV).toBe("olhar-v.mp4");
    expect(loadManifest(valid).olharV).toBeUndefined();
  });

  it.each([null, 17, {}, ""])("recusa olharV inválido: %j", (olharV) => {
    expect(() => loadManifest({ ...valid, olharV })).toThrow(/olharV/);
  });

  it("recusa manifest sem o Olhar", () => {
    const { olhar: _omit, ...rest } = valid;
    expect(() => loadManifest(rest)).toThrow(/olhar/);
  });

  it("recusa bg que não seja #rrggbb minúsculo", () => {
    expect(() => loadManifest({ ...valid, bg: "#E2DAC9" })).toThrow(/bg/);
    expect(() => loadManifest({ ...valid, bg: "marfim" })).toThrow(/bg/);
  });

  it("exige a reação de hover e pelo menos um clique", () => {
    expect(() => loadManifest({ ...valid, reactions: { "clique-1": "c.mp4" } })).toThrow(/hover/);
    expect(() => loadManifest({ ...valid, reactions: { hover: "h.mp4" } })).toThrow(/clique/);
  });

  it("o manifest publicado é válido e todo arquivo citado existe", () => {
    const real = loadManifest(JSON.parse(readFileSync("public/hero/manifest.json", "utf8")));
    const files = [real.poster, real.entrada, real.olhar, real.olharLoop, ...(real.olharV ? [real.olharV] : []), ...Object.values(real.reactions)];
    for (const f of files) expect(existsSync(`public/hero/${f}`), f).toBe(true);
  });

  it("o personagem publicado tem o clipe vertical disponível", () => {
    const real = loadManifest(JSON.parse(readFileSync("public/hero/manifest.json", "utf8")));
    expect(real.olharV).toBe("olhar-v.mp4");
    expect(existsSync(`public/hero/${real.olharV}`)).toBe(true);
  });
});
