// Máquina de estados do personagem do hero (spec §5.2).
//
// O clique atualiza a fala imediatamente; o gesto passa pela neutra e termina.

export type Reaction = "hover" | "clique-1" | "clique-2" | "clique-3";

export type CharState =
  | { phase: "intro"; target: number; clicks: number }
  | { phase: "scrub"; target: number; clicks: number }
  | { phase: "centering"; pending: Reaction; target: number; clicks: number }
  | { phase: "reaction"; clip: Reaction; target: number; clicks: number; finishGesture?: true };

export type CharEvent =
  | { type: "introEnded" }
  | { type: "pointer"; x: number } // 0..1 na largura da janela
  | { type: "hover" }
  | { type: "leave" }
  | { type: "click" }
  | { type: "centered" } // o Olhar chegou à pose neutra
  | { type: "reactionEnded" };

export const NEUTRAL = 0.5;

export const CLICKS: Reaction[] = ["clique-1", "clique-2", "clique-3"];

export const initialChar: CharState = { phase: "intro", target: NEUTRAL, clicks: 0 };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function charReducer(s: CharState, e: CharEvent): CharState {
  switch (e.type) {
    case "pointer":
      return s.phase === "intro"
        ? { phase: "scrub", target: clamp01(e.x), clicks: s.clicks }
        : { ...s, target: clamp01(e.x) };
    case "leave":
      return (s.phase === "centering" && s.pending === "hover") || (s.phase === "reaction" && s.clip === "hover" && !s.finishGesture)
        ? { phase: "scrub", target: s.target, clicks: s.clicks }
        : s;
    case "introEnded":
      return s.phase === "intro" ? { phase: "scrub", target: s.target, clicks: s.clicks } : s;
    case "hover":
      return s.phase === "scrub" ? { phase: "centering", pending: "hover", target: s.target, clicks: s.clicks } : s;
    case "click": {
      if (s.phase === "reaction") {
        return s.clip === "hover"
          ? { ...s, clicks: s.clicks + 1, finishGesture: true }
          : { ...s, clicks: s.clicks + 1 };
      }
      if (s.phase === "centering" && s.pending !== "hover") {
        return { ...s, clicks: s.clicks + 1 };
      }
      const nextClip = CLICKS[s.clicks % CLICKS.length];
      return { phase: "centering", pending: nextClip, target: s.target, clicks: s.clicks + 1 };
    }
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

export type Axis = "h" | "v";
export type Gaze = { axis: Axis; pos: number; vel?: number };
export const AXIS_DEAD = 0.06;
export const AXIS_RATIO = 1.25;
export const SWAP_EPS = 0.01;

// Olhos na pose neutra (olhar.mp4, quadro 58), em fração do quadro 1280×720.
// O olhar é medido a partir deles, não do centro da janela: o personagem fica
// à direita e no alto, e um cursor ao lado do rosto precisa ser "ao lado".
export const EYES = { x: 880 / 1280, y: 183 / 720 } as const;

export type Point = { x: number; y: number };
export type Box = { left: number; top: number; width: number; height: number };

// Onde os olhos aparecem na tela, com o vídeo em object-fit: cover e o
// object-position dado em fração (0,68 = 68%).
export function eyesOnScreen(box: Box, media: { width: number; height: number }, objectPosition: Point, eyes: Point = EYES): Point {
  const scale = Math.max(box.width / media.width, box.height / media.height);
  const w = media.width * scale;
  const h = media.height * scale;
  return {
    x: box.left + (box.width - w) * objectPosition.x + eyes.x * w,
    y: box.top + (box.height - h) * objectPosition.y + eyes.y * h,
  };
}

// x e y: alvo nos vídeos, 0,5 nos olhos e 0 ou 1 na borda da janela de cada
// lado. dx e dy: distância aos olhos em alturas de janela, a mesma escala nos
// dois eixos, para a escolha do eixo seguir a direção real do cursor.
export type Aim = { x: number; y: number; dx: number; dy: number };

const side = (p: number, origin: number, size: number) =>
  p <= origin
    ? origin > 0 ? NEUTRAL * (p / origin) : NEUTRAL
    : origin < size ? NEUTRAL + NEUTRAL * ((p - origin) / (size - origin)) : NEUTRAL;

export function aimFrom(px: number, py: number, eyes: Point, view: { width: number; height: number }): Aim {
  const unit = view.height || 1;
  return {
    x: clamp01(side(px, eyes.x, view.width)),
    y: clamp01(side(py, eyes.y, view.height)),
    dx: (px - eyes.x) / unit,
    dy: (py - eyes.y) / unit,
  };
}

export const CENTER_AIM: Aim = { x: NEUTRAL, y: NEUTRAL, dx: 0, dy: 0 };

export function pickAxis(current: Axis, dxFromEyes: number, dyFromEyes: number): Axis {
  const dx = Math.abs(dxFromEyes);
  const dy = Math.abs(dyFromEyes);
  if (Math.max(dx, dy) < AXIS_DEAD) return current;
  if (current === "h") return dy > AXIS_RATIO * dx ? "v" : "h";
  return dx > AXIS_RATIO * dy ? "h" : "v";
}

// Os vídeos compartilham a pose do meio, não poses diagonais. Antes da troca,
// o eixo atual volta a esse quadro; no seguinte, o novo eixo segue o cursor.
export function spring(pos: number, vel: number, target: number, dtMs: number, omega: number): { pos: number; vel: number } {
  if (dtMs <= 0) return { pos, vel };
  const dt = dtMs / 1000, x = pos - target, decay = Math.exp(-omega * dt);
  const term = (vel + omega * x) * dt;
  return { pos: target + (x + term) * decay, vel: (vel - omega * term) * decay };
}

// O loop é a ida e volta do horizontal; as duas metades chegam à neutra.
export function loopNeutral(frame: number, frames: number): number {
  return [0, Math.floor(frames / 2), frames - 1].reduce((a, b) => Math.abs(b - frame) < Math.abs(a - frame) ? b : a);
}

export function gazeStep(g: Gaze, aim: Aim, dtMs: number, allowV: boolean, centering = false): Gaze {
  const want = centering ? g.axis : allowV ? pickAxis(g.axis, aim.dx, aim.dy) : "h";
  const returning = centering || want !== g.axis;
  const target = returning ? NEUTRAL : clamp01(g.axis === "h" ? aim.x : aim.y);
  const next = spring(g.pos, g.vel ?? 0, target, dtMs, returning ? 34 : 18);
  if (returning && Math.abs(next.pos - NEUTRAL) < SWAP_EPS) return { axis: want, pos: NEUTRAL, vel: 0 };
  const pos = clamp01(next.pos);
  return { axis: g.axis, pos, vel: pos !== next.pos ? 0 : next.vel };
}
