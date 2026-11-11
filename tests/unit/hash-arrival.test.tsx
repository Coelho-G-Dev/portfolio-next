import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arriveAtHash } from "@/components/site/flowTop";
import { useHashArrival } from "@/components/site/useHashArrival";
import { CORTINA_RELAYOUT } from "@/lib/scrollTrigger";

vi.mock("@/components/site/flowTop", () => ({ arriveAtHash: vi.fn(() => true) }));

describe("chegada inicial ao hash", () => {
  let frames: Map<number, FrameRequestCallback>;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    delete (window as Window & { __portfolioHashInput?: boolean }).__portfolioHashInput;
    history.replaceState(null, "", "/#contato");
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    frames = new Map();
    let id = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { frames.set(++id, cb); return id; });
    vi.stubGlobal("cancelAnimationFrame", (token: number) => frames.delete(token));
  });
  afterEach(() => { delete (window as Window & { __portfolioHashInput?: boolean }).__portfolioHashInput; vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); history.replaceState(null, "", "/"); });
  const frame = () => act(() => { const pending = [...frames.values()]; frames.clear(); pending.forEach(cb => cb(performance.now())); });
  const settle = () => { frame(); frame(); };

  it("aguarda dois quadros e corrige relayout apenas na janela inicial", () => {
    renderHook(() => useHashArrival());
    frame(); expect(arriveAtHash).not.toHaveBeenCalled();
    frame(); expect(arriveAtHash).toHaveBeenCalledWith("#contato");
    vi.mocked(arriveAtHash).mockClear();
    act(() => { window.dispatchEvent(new Event(CORTINA_RELAYOUT)); }); settle();
    expect(arriveAtHash).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(2100); });
    vi.mocked(arriveAtHash).mockClear();
    act(() => { window.dispatchEvent(new Event(CORTINA_RELAYOUT)); }); settle();
    expect(arriveAtHash).not.toHaveBeenCalled();
  });
  it("aguarda load quando o documento ainda carrega", () => {
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    renderHook(() => useHashArrival()); settle();
    expect(arriveAtHash).not.toHaveBeenCalled();
    act(() => { window.dispatchEvent(new Event("load")); }); settle();
    expect(arriveAtHash).toHaveBeenCalledTimes(1);
  });
  it.each(["wheel", "touchstart", "keydown", "pointerdown"])("desiste se houver %s antes de assentar", event => {
    renderHook(() => useHashArrival());
    act(() => { window.dispatchEvent(new Event(event)); }); settle();
    act(() => { window.dispatchEvent(new Event(CORTINA_RELAYOUT)); }); settle();
    expect(arriveAtHash).not.toHaveBeenCalled();
  });
  it("desmontagem cancela quadros e ouvintes pendentes", () => {
    const { unmount } = renderHook(() => useHashArrival());
    unmount(); settle();
    act(() => { window.dispatchEvent(new Event(CORTINA_RELAYOUT)); }); settle();
    expect(arriveAtHash).not.toHaveBeenCalled();
  });
  it("não interfere em uma visita sem hash", () => {
    history.replaceState(null, "", "/");
    renderHook(() => useHashArrival()); settle();
    expect(arriveAtHash).not.toHaveBeenCalled();
  });
  it("respeita interação registrada antes da hidratação", () => {
    (window as Window & { __portfolioHashInput?: boolean }).__portfolioHashInput = true;
    renderHook(() => useHashArrival()); settle();
    expect(arriveAtHash).not.toHaveBeenCalled();
  });
});
