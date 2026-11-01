import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Typed from "@/components/site/Typed";

function mockReducedMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

const visible = (container: HTMLElement) =>
  (container.querySelector(".s-typed")?.firstChild?.textContent ?? "").trim();

describe("Typed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("o texto completo está sempre no DOM para leitores de tela", () => {
    mockReducedMotion(false);
    const { container } = render(<Typed text="Olá, mundo" />);
    expect(container.querySelector(".sr-only")).toHaveTextContent("Olá, mundo");
    expect(container.querySelector(".s-typed")).toHaveAttribute("aria-hidden", "true");
  });

  it("a parte visível começa vazia e cresce com o tempo", async () => {
    mockReducedMotion(false);
    const { container } = render(<Typed text="Olá, mundo" />);
    expect(visible(container)).toBe("");
    await act(async () => {
      vi.advanceTimersByTime(700 + 32 * 3 + 20);
    });
    expect(visible(container)).toBe("Olá");
  });

  it("com movimento reduzido, a parte visível já nasce completa", () => {
    mockReducedMotion(true);
    const { container } = render(<Typed text="Olá, mundo" />);
    expect(visible(container)).toBe("Olá, mundo");
  });

  it("trocar o texto no meio recomeça do zero, sem pedaço do texto antigo", async () => {
    mockReducedMotion(false);
    const { container, rerender } = render(<Typed text="Olá, mundo" />);
    await act(async () => {
      vi.advanceTimersByTime(700 + 32 * 5);
    });
    expect(visible(container).length).toBeGreaterThan(0);

    rerender(<Typed text="Hi, world" />);
    expect(visible(container)).toBe("");
    await act(async () => {
      vi.advanceTimersByTime(700 + 32 * 2 + 20);
    });
    expect(visible(container)).toBe("Hi");
    expect(container.querySelector(".sr-only")).toHaveTextContent("Hi, world");
  });

  it("o resto do texto ocupa o espaço, invisível, para não deslocar o layout", () => {
    mockReducedMotion(false);
    const { container } = render(<Typed text="Olá, mundo" />);
    expect(container.querySelector(".s-typed__rest")).toHaveTextContent("Olá, mundo");
  });
});
