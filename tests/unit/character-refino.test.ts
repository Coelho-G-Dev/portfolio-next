import { describe, expect, it } from "vitest";
import { charReducer, gazeStep, NEUTRAL, spring, loopNeutral, type Gaze, type CharState } from "@/lib/character";

describe("refinamento A+B+C", () => {
  it("mola exata chega a 90% antes de 240ms e independe da taxa de quadros", () => {
    const once = spring(0, 0, 1, 240, 18);
    expect(once.pos).toBeGreaterThan(0.92);
    for (const hz of [60, 100, 120]) {
      let s = { pos: 0, vel: 0 };
      for (let i = 0; i < hz; i++) s = spring(s.pos, s.vel, 1, 1000 / hz, 18);
      expect(s.pos).toBeCloseTo(spring(0, 0, 1, 1000, 18).pos, 10);
      expect(s.vel).toBeCloseTo(spring(0, 0, 1, 1000, 18).vel, 10);
    }
  });
  it("mola repousa no alvo, não avança sem tempo e não oscila num degrau", () => {
    expect(spring(0.5, 0, 0.5, 16, 34)).toEqual({ pos: 0.5, vel: 0 });
    expect(spring(0.3, 2, 1, 0, 18)).toEqual({ pos: 0.3, vel: 2 });
    let s = { pos: 0, vel: 0 };
    for (let i = 0; i < 120; i++) {
      const next = spring(s.pos, s.vel, 1, 16, 18);
      expect(next.pos).toBeGreaterThanOrEqual(s.pos);
      expect(next.pos).toBeLessThanOrEqual(1);
      s = next;
    }
  });
  it("olhar troca de eixo pela neutra em até 210ms", () => {
    let g: Gaze = { axis: "h", pos: 1, vel: 0 };
    let elapsed = 0;
    while (g.axis === "h" && elapsed < 1000) {
      g = gazeStep(g, { x: 0.5, y: 0, dx: 0, dy: -1 }, 10, true);
      elapsed += 10;
    }
    expect(g.axis).toBe("v"); expect(g.pos).toBe(NEUTRAL); expect(g.vel).toBe(0);
    expect(elapsed).toBeLessThanOrEqual(210);
  });
  it("centralização de reação mantém o eixo ativo e usa retorno rápido", () => {
    const g = gazeStep({ axis: "v", pos: 0, vel: 0 }, { x: 0.5, y: 0.5, dx: 0, dy: 0 }, 180, true, true);
    expect(g.axis).toBe("v"); expect(g.pos).toBeGreaterThan(0.49);
  });
  it("extremos ficam limitados mesmo ao inverter uma velocidade alta", () => {
    const g = gazeStep({ axis: "h", pos: 1, vel: 10 }, { x: 0, y: 0.5, dx: -1, dy: 0 }, 16, true);
    expect(g.pos).toBeLessThanOrEqual(1); expect(g.pos).toBeGreaterThanOrEqual(0);
    expect(g.vel).toBe(0);
  });
  it("clique centraliza e sair não cancela a reação pendente", () => {
    const s = charReducer({ phase: "scrub", clicks: 0, target: 1 }, { type: "click" });
    expect(s).toMatchObject({ phase: "centering", pending: "clique-1", clicks: 1 });
    expect(charReducer(s, { type: "leave" })).toBe(s);
    expect(charReducer(s, { type: "centered" })).toMatchObject({ phase: "reaction", clip: "clique-1" });
  });
  it("novos cliques atualizam a fala e preservam gesto ou clique pendente", () => {
    const states: CharState[] = [
      { phase: "reaction", clip: "clique-1", target: 0.5, clicks: 1 },
      { phase: "centering", pending: "clique-1", target: 0.5, clicks: 1 },
    ];
    for (const s of states) expect(charReducer(s, { type: "click" })).toEqual({ ...s, clicks: 2 });
  });
  it("clique durante hover preserva o gesto inclusive ao sair da caixa", () => {
    const s = charReducer({ phase: "reaction", clip: "hover", target: 0.2, clicks: 0 }, { type: "click" });
    expect(s).toMatchObject({ phase: "reaction", clip: "hover", clicks: 1 });
    expect(charReducer(s, { type: "leave" })).toBe(s);
  });
  it("loop escolhe a neutra mais próxima, incluindo a emenda final", () => {
    expect(loopNeutral(20, 232)).toBe(0);
    expect(loopNeutral(80, 232)).toBe(116);
    expect(loopNeutral(220, 232)).toBe(231);
  });
});
