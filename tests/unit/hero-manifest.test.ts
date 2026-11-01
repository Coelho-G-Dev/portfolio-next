import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadManifest, type HeroManifest } from "@/lib/heroManifest";

const valid: HeroManifest = {
  bg: "#e2dac9",
  width: 1280,
  height: 720,
  poster: "poster.webp",
  entrada: "entrada.mp4",
  olhar: "olhar.mp4",
  olharLoop: "olhar-loop.mp4",
  reactions: { hover: "hover.mp4", "clique-1": "clique-1.mp4" },
  bytes: { "poster.webp": 1, "entrada.mp4": 1 },
};

describe("manifest do hero", () => {
  it("aceita um manifest completo", () => {
    expect(loadManifest(valid)).toEqual(valid);
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
    const files = [real.poster, real.entrada, real.olhar, real.olharLoop, ...Object.values(real.reactions)];
    for (const f of files) expect(existsSync(`public/hero/${f}`), f).toBe(true);
  });
});
