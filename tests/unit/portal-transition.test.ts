import { describe, expect, it, vi } from "vitest";
import { alignDelta, runPortal } from "@/lib/portalTransition";

describe("runPortal: a porta vira o painel num movimento só", () => {
  it("usa a View Transition do navegador quando ela existe", () => {
    const update = vi.fn();
    const startViewTransition = vi.fn((cb: () => void) => {
      cb();
      return {};
    });
    const mode = runPortal(update, { reduced: false, doc: { startViewTransition } });
    expect(mode).toBe("view-transition");
    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("troca na hora quando o navegador não tem View Transition", () => {
    const update = vi.fn();
    expect(runPortal(update, { reduced: false, doc: {} })).toBe("instant");
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("troca na hora com movimento reduzido, mesmo com View Transition", () => {
    const update = vi.fn();
    const startViewTransition = vi.fn();
    expect(runPortal(update, { reduced: true, doc: { startViewTransition } })).toBe("instant");
    expect(startViewTransition).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("se a View Transition falhar ao começar, troca na hora e não perde a atualização", () => {
    const update = vi.fn();
    const startViewTransition = vi.fn(() => {
      throw new Error("InvalidStateError");
    });
    expect(runPortal(update, { reduced: false, doc: { startViewTransition } })).toBe("instant");
    expect(update).toHaveBeenCalledTimes(1);
  });
});

describe("alignDelta: o painel nasce onde a porta estava", () => {
  it("rola o quanto o painel se deslocou em relação às portas", () => {
    // Portas em 300px; o painel montou em 120px: sobe a página 180px.
    expect(alignDelta(300, 120, 24)).toBe(-180);
  });

  it("não rola quando o painel já está no mesmo lugar", () => {
    expect(alignDelta(300, 300, 24)).toBe(0);
  });

  it("nunca deixa o topo do painel acima da margem mínima", () => {
    // As portas começavam acima da janela: o painel para na margem.
    expect(alignDelta(-200, -200, 24)).toBe(-224);
  });
});
