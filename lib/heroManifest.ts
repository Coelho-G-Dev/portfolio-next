import type { Reaction } from "./character";

// Descreve os arquivos do personagem gerados por tools/hero-video.mjs em
// public/hero/. As reações de clique podem faltar (clipes ainda pendentes):
// basta o hover e pelo menos um clique.
export type HeroManifest = {
  bg: string;
  width: number;
  height: number;
  poster: string;
  entrada: string;
  olhar: string;
  olharFrames: number;
  olharNeutral: number;
  olharV?: string;
  olharVFrames?: number;
  olharVNeutral?: number;
  olharVCurve?: number[];
  olharLoop: string;
  reactions: Partial<Record<Reaction, string>>;
  bytes: Record<string, number>;
};

const FILE_KEYS = ["poster", "entrada", "olhar", "olharLoop"] as const;

export function loadManifest(json: unknown): HeroManifest {
  if (!json || typeof json !== "object") throw new Error("manifest do hero: não é um objeto");
  const m = json as Record<string, unknown>;

  if (typeof m.bg !== "string" || !/^#[0-9a-f]{6}$/.test(m.bg)) {
    throw new Error("manifest do hero: bg precisa ser #rrggbb minúsculo");
  }
  for (const key of ["width", "height"] as const) {
    if (typeof m[key] !== "number" || !(Number(m[key]) > 0)) throw new Error(`manifest do hero: ${key} inválido`);
  }
  for (const key of FILE_KEYS) {
    if (typeof m[key] !== "string" || m[key] === "") throw new Error(`manifest do hero: falta ${key}`);
  }
  if (!Number.isInteger(m.olharFrames) || Number(m.olharFrames) < 2) throw new Error("manifest do hero: olharFrames inválido");
  if (!Number.isInteger(m.olharNeutral) || Number(m.olharNeutral) < 0 || Number(m.olharNeutral) >= Number(m.olharFrames)) throw new Error("manifest do hero: olharNeutral inválido");
  if ("olharV" in m && (typeof m.olharV !== "string" || m.olharV === "")) {
    throw new Error("manifest do hero: olharV inválido");
  }

  const reactions = m.reactions as Record<string, unknown> | undefined;
  if (!reactions || typeof reactions !== "object") throw new Error("manifest do hero: falta reactions");
  if (typeof reactions.hover !== "string") throw new Error("manifest do hero: falta a reação hover");
  if (!["clique-1", "clique-2", "clique-3"].some((k) => typeof reactions[k] === "string")) {
    throw new Error("manifest do hero: falta pelo menos uma reação de clique");
  }
  if (!m.bytes || typeof m.bytes !== "object") throw new Error("manifest do hero: falta bytes");

  return json as HeroManifest;
}

export function verticalOf(m: HeroManifest): { file: string; frames: number; neutral: number; curve: number[] } | null {
  const { olharV: file, olharVFrames: frames, olharVNeutral: neutral, olharVCurve: curve } = m;
  if (!file || !Number.isInteger(frames) || frames! < 3 || frames! % 2 !== 1 || neutral !== (frames! - 1) / 2 || !Array.isArray(curve) || curve.length !== frames) return null;
  if (curve[0] !== 0 || curve[frames - 1] !== 1 || curve[neutral] !== 0.5 || curve.some((p, k) => !Number.isFinite(p) || (k > 0 && p <= curve[k - 1]))) return null;
  return { file, frames, neutral, curve };
}
