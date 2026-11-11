import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { aimFrom, approach, charReducer, EYES, eyesOnScreen, gazeStep, initialChar, NEUTRAL, pickAxis, type CharEvent, type CharState, type Gaze } from "@/lib/character";

const run = (events: CharEvent[], from: CharState = initialChar) => events.reduce(charReducer, from);
const scrub = run([{ type: "introEnded" }]);

// Hero a 1440×900: caixa do personagem sangrando à direita, vídeo 1280×720
// em cover com object-position 68% 50%. Os olhos caem em (1189,6; 228,8).
const VIEW = { width: 1440, height: 900 };
const BOX = { left: 620, top: 0, width: 820, height: 900 };
const MEDIA = { width: 1280, height: 720 };
const OBJ = { x: 0.68, y: 0.5 };
const EYES_1440 = eyesOnScreen(BOX, MEDIA, OBJ);
const aimAt = (px: number, py: number) => aimFrom(px, py, EYES_1440, VIEW);
const axisAt = (px: number, py: number, current: "h" | "v" = "h") => {
  const a = aimAt(px, py);
  return pickAxis(current, a.dx, a.dy);
};
const UP = { x: 0.5, y: 0, dx: 0, dy: -0.5 };

describe("olhar medido a partir dos olhos", () => {
  it("acha os olhos na tela pelo cover e pelo object-position do vídeo", () => {
    expect(EYES.x).toBeCloseTo(880 / 1280, 6);
    expect(EYES.y).toBeCloseTo(183 / 720, 6);
    expect(EYES_1440.x).toBeCloseTo(1189.6, 1);
    expect(EYES_1440.y).toBeCloseTo(228.75, 1);
    // Caixa mais larga que o vídeo: sobra corte em cima e embaixo.
    const wide = eyesOnScreen({ left: 0, top: 100, width: 1280, height: 360 }, MEDIA, OBJ);
    expect(wide.x).toBeCloseTo(880, 6);
    expect(wide.y).toBeCloseTo(100 + (360 - 720) * 0.5 + 183, 6);
  });

  it("mouse nos olhos é a pose neutra; nas bordas da janela, os extremos", () => {
    const at = aimAt(EYES_1440.x, EYES_1440.y);
    expect(at).toEqual({ x: 0.5, y: 0.5, dx: 0, dy: 0 });
    expect(aimAt(0, EYES_1440.y).x).toBe(0);
    expect(aimAt(VIEW.width, EYES_1440.y).x).toBe(1);
    expect(aimAt(EYES_1440.x, 0).y).toBe(0);
    expect(aimAt(EYES_1440.x, VIEW.height).y).toBe(1);
    expect(aimAt(EYES_1440.x / 2, EYES_1440.y).x).toBeCloseTo(0.25, 6);
    expect(aimAt(-50, 2000)).toMatchObject({ x: 0, y: 1 });
  });

  it("mouse ao lado do rosto ou do peito olha para o lado, nunca para cima ou para baixo", () => {
    for (const [px, py] of [[850, 290], [850, 650], [800, 520], [950, 300], [300, 120], [300, 700]]) {
      expect(axisAt(px, py), `${px},${py}`).toBe("h");
      expect(aimAt(px, py).x, `${px},${py}`).toBeLessThan(0.5);
    }
    expect(axisAt(1350, 260)).toBe("h");
    expect(aimAt(1350, 260).x).toBeGreaterThan(0.5);
  });

  it("mouse acima ou abaixo dos olhos olha para cima ou para baixo", () => {
    expect(axisAt(1190, 20)).toBe("v");
    expect(aimAt(1190, 20).y).toBeLessThan(0.5);
    expect(axisAt(1150, 880)).toBe("v");
    expect(aimAt(1150, 880).y).toBeGreaterThan(0.5);
  });
});

describe("olhar em dois eixos", () => {
  it("segue a direção dominante, com zona morta e histerese na diagonal", () => {
    expect(pickAxis("h", 0, -0.45)).toBe("v");
    expect(pickAxis("v", 0.45, 0)).toBe("h");
    expect(pickAxis("v", 0.03, 0.02)).toBe("v");
    expect(pickAxis("h", 0.02, -0.03)).toBe("h");
    expect(pickAxis("h", -0.3, 0.35)).toBe("h");
    expect(pickAxis("v", 0.35, -0.3)).toBe("v");
  });

  it("volta ao neutro antes de trocar e depois segue o alvo vertical", () => {
    let gaze: Gaze = { axis: "h", pos: 0.9 };
    const first = gazeStep(gaze, UP, 16, true);
    expect(first.axis).toBe("h");
    expect(first.pos).toBeLessThan(0.9);
    expect(first.pos).toBeGreaterThan(0.5);
    let switches = 0;
    for (let elapsed = 0; elapsed < 2000; elapsed += 16) {
      const next = gazeStep(gaze, UP, 16, true);
      if (next.axis !== gaze.axis) {
        expect(next.pos).toBe(0.5);
        switches++;
      }
      gaze = next;
    }
    expect(switches).toBe(1);
    expect(gaze.axis).toBe("v");
    expect(gaze.pos).toBeLessThan(0.05);
  });

  it("mantém o horizontal enquanto o vertical não está disponível", () => {
    expect(gazeStep({ axis: "h", pos: 0.5 }, UP, 140, false)).toMatchObject({ axis: "h", pos: 0.5 });
    expect(gazeStep({ axis: "h", pos: 0.5 }, { x: 1, y: 0.5, dx: 0.4, dy: 0 }, 240, true).pos).toBeGreaterThan(0.95);
  });

  it("limita a posição do olhar aos extremos do vídeo", () => {
    expect(gazeStep({ axis: "h", pos: 0.5 }, { x: 5, y: 0.5, dx: 2, dy: 0 }, 5000, true).pos).toBe(1);
    expect(gazeStep({ axis: "v", pos: 0.5 }, { x: 0.5, y: -5, dx: 0, dy: -2 }, 5000, true).pos).toBeGreaterThanOrEqual(0);
    expect(gazeStep({ axis: "v", pos: 0.5 }, { x: 0.5, y: -5, dx: 0, dy: -2 }, 5000, true).pos).toBeLessThan(1e-10);
  });
});

describe("máquina de estados do personagem", () => {
  it("começa na entrada, olhando ao centro", () => {
    expect(initialChar).toEqual({ phase: "intro", target: NEUTRAL, clicks: 0 });
  });

  it("o fim da entrada passa a seguir o cursor", () => {
    expect(scrub.phase).toBe("scrub");
  });

  it("pointer atualiza o alvo em qualquer fase, limitado a [0, 1]", () => {
    expect(charReducer(initialChar, { type: "pointer", x: 0.2 }).target).toBe(0.2);
    expect(charReducer(scrub, { type: "pointer", x: -3 }).target).toBe(0);
    expect(charReducer(scrub, { type: "pointer", x: 7 }).target).toBe(1);
  });

  it("hover em scrub centraliza antes de reagir", () => {
    expect(charReducer(scrub, { type: "hover" })).toMatchObject({ phase: "centering", pending: "hover" });
  });

  it("sair durante a centralização ou o hover devolve o controle ao cursor", () => {
    const centering = charReducer(scrub, { type: "hover" });
    const reaction = charReducer(centering, { type: "centered" });
    for (const s of [centering, reaction]) {
      expect(charReducer(s, { type: "leave" })).toMatchObject({ phase: "scrub" });
    }
    const clicked = charReducer(scrub, { type: "click" });
    expect(charReducer(clicked, { type: "leave" })).toBe(clicked);
  });

  it("os cliques alternam entre as três variações", () => {
    const clips: string[] = [];
    let s = scrub;
    for (let i = 0; i < 4; i++) {
      s = charReducer(s, { type: "click" });
      s = charReducer(s, { type: "centered" });
      if (s.phase === "reaction") clips.push(s.clip);
      s = charReducer(s, { type: "reactionEnded" });
    }
    expect(clips).toEqual(["clique-1", "clique-2", "clique-3", "clique-1"]);
  });

  it("hover fora de scrub é ignorado (mesmo objeto)", () => {
    const centering = charReducer(scrub, { type: "hover" });
    const reaction = charReducer(centering, { type: "centered" });
    for (const s of [initialChar, centering, reaction]) {
      expect(charReducer(s, { type: "hover" })).toBe(s);
    }
  });

  it("cliques durante o gesto atualizam a fala e deixam a animação terminar", () => {
    const r1 = run([{ type: "click" }, { type: "centered" }], scrub);
    expect(r1).toMatchObject({ phase: "reaction", clip: "clique-1", clicks: 1 });
    const r2 = charReducer(r1, { type: "click" });
    expect(r2).toMatchObject({ phase: "reaction", clip: "clique-1", clicks: 2 });
    const r3 = charReducer(r2, { type: "click" });
    expect(r3).toMatchObject({ phase: "reaction", clip: "clique-1", clicks: 3 });
    const r4 = charReducer(r3, { type: "click" });
    expect(r4).toMatchObject({ phase: "reaction", clip: "clique-1", clicks: 4 });
  });

  it("centered leva à reação pendente e o fim dela volta ao scrub com o alvo atualizado", () => {
    let s = run([{ type: "hover" }, { type: "centered" }], scrub);
    expect(s).toMatchObject({ phase: "reaction", clip: "hover" });
    s = run([{ type: "pointer", x: 0.9 }, { type: "reactionEnded" }], s);
    expect(s).toMatchObject({ phase: "scrub", target: 0.9 });
  });

  it("propriedade: cliques nunca diminuem e o personagem sempre volta ao scrub", () => {
    const event: fc.Arbitrary<CharEvent> = fc.oneof(
      fc.constant<CharEvent>({ type: "introEnded" }),
      fc.double({ min: -1, max: 2, noNaN: true }).map((x) => ({ type: "pointer", x }) as CharEvent),
      fc.constant<CharEvent>({ type: "hover" }),
      fc.constant<CharEvent>({ type: "click" }),
      fc.constant<CharEvent>({ type: "centered" }),
      fc.constant<CharEvent>({ type: "reactionEnded" }),
    );
    fc.assert(
      fc.property(fc.array(event, { maxLength: 120 }), (events) => {
        let prev = initialChar;
        for (const e of events) {
          const next = charReducer(prev, e);
          expect(next.clicks).toBeGreaterThanOrEqual(prev.clicks);
          expect(next.target).toBeGreaterThanOrEqual(0);
          expect(next.target).toBeLessThanOrEqual(1);
          if (prev.phase === "centering" && e.type === "centered") {
            const done = run([{ type: "reactionEnded" }], next);
            expect(done.phase).toBe("scrub");
          }
          prev = next;
        }
      }),
      { numRuns: 500 },
    );
  });
});

describe("approach (suavização do scrub)", () => {
  it("cobre metade do caminho em uma meia-vida (140 ms)", () => {
    expect(approach(0, 1, 140)).toBeCloseTo(0.5, 2);
  });

  it("parado no alvo, continua no alvo", () => {
    expect(approach(0.3, 0.3, 500)).toBe(0.3);
  });

  it("propriedade: o resultado fica entre a posição atual e o alvo", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 0, max: 5000, noNaN: true }),
        (current, target, dt) => {
          const r = approach(current, target, dt);
          expect(r).toBeGreaterThanOrEqual(Math.min(current, target) - 1e-12);
          expect(r).toBeLessThanOrEqual(Math.max(current, target) + 1e-12);
        },
      ),
      { numRuns: 500 },
    );
  });
});
