import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { approach, charReducer, initialChar, NEUTRAL, type CharEvent, type CharState } from "@/lib/character";

const run = (events: CharEvent[], from: CharState = initialChar) => events.reduce(charReducer, from);
const scrub = run([{ type: "introEnded" }]);

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

  it("hover e clique fora de scrub são ignorados (mesmo objeto)", () => {
    const centering = charReducer(scrub, { type: "click" });
    const reaction = charReducer(centering, { type: "centered" });
    for (const s of [initialChar, centering, reaction]) {
      expect(charReducer(s, { type: "hover" })).toBe(s);
      expect(charReducer(s, { type: "click" })).toBe(s);
    }
  });

  it("centered leva à reação pendente e o fim dela volta ao scrub com o alvo atualizado", () => {
    let s = run([{ type: "hover" }, { type: "centered" }], scrub);
    expect(s).toMatchObject({ phase: "reaction", clip: "hover" });
    s = run([{ type: "pointer", x: 0.9 }, { type: "reactionEnded" }], s);
    expect(s).toMatchObject({ phase: "scrub", target: 0.9 });
  });

  it("propriedade: reação só depois de centralizar, cliques nunca diminuem e o personagem sempre volta ao scrub", () => {
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
          if (next.phase === "reaction" && prev.phase !== "reaction") expect(prev.phase).toBe("centering");
          expect(next.clicks).toBeGreaterThanOrEqual(prev.clicks);
          expect(next.target).toBeGreaterThanOrEqual(0);
          expect(next.target).toBeLessThanOrEqual(1);
          if (prev.phase === "centering") {
            const done = run([{ type: "centered" }, { type: "reactionEnded" }], prev);
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
