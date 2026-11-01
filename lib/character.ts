// Máquina de estados do personagem do hero (spec §5.2).
//
// intro ──introEnded──▶ scrub ──hover/click──▶ centering ──centered──▶ reaction
//                         ▲                                                │
//                         └──────────────────── reactionEnded ─────────────┘
//
// Uma reação só começa a partir do scrub, e antes dela o Olhar desliza até a
// pose neutra (centering). Assim nunca há duas reações ao mesmo tempo.

export type Reaction = "hover" | "clique-1" | "clique-2" | "clique-3";

export type CharState =
  | { phase: "intro"; target: number; clicks: number }
  | { phase: "scrub"; target: number; clicks: number }
  | { phase: "centering"; pending: Reaction; target: number; clicks: number }
  | { phase: "reaction"; clip: Reaction; target: number; clicks: number };

export type CharEvent =
  | { type: "introEnded" }
  | { type: "pointer"; x: number } // 0..1 na largura da janela
  | { type: "hover" }
  | { type: "click" }
  | { type: "centered" } // o Olhar chegou à pose neutra
  | { type: "reactionEnded" };

export const NEUTRAL = 0.5;

const CLICKS: Reaction[] = ["clique-1", "clique-2", "clique-3"];

export const initialChar: CharState = { phase: "intro", target: NEUTRAL, clicks: 0 };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function charReducer(s: CharState, e: CharEvent): CharState {
  switch (e.type) {
    case "pointer":
      return { ...s, target: clamp01(e.x) };
    case "introEnded":
      return s.phase === "intro" ? { phase: "scrub", target: s.target, clicks: s.clicks } : s;
    case "hover":
      return s.phase === "scrub" ? { phase: "centering", pending: "hover", target: s.target, clicks: s.clicks } : s;
    case "click":
      return s.phase === "scrub"
        ? { phase: "centering", pending: CLICKS[s.clicks % CLICKS.length], target: s.target, clicks: s.clicks + 1 }
        : s;
    case "centered":
      return s.phase === "centering" ? { phase: "reaction", clip: s.pending, target: s.target, clicks: s.clicks } : s;
    case "reactionEnded":
      return s.phase === "reaction" ? { phase: "scrub", target: s.target, clicks: s.clicks } : s;
  }
}

// Suavização exponencial: em `halfLifeMs`, cobre metade da distância ao alvo.
export function approach(current: number, target: number, dtMs: number, halfLifeMs = 140): number {
  return target + (current - target) * 2 ** (-dtMs / halfLifeMs);
}
