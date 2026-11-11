import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Character from "@/components/site/Character";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { siteCopy } from "@/lib/i18n/site";
import { heroManifest } from "@/components/site/heroAssets";
import { frameTime } from "@/lib/gazeCurve";

const verticalFile = heroManifest.olharV;

vi.mock("next/image", () => ({ default: () => null }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    matches: media.includes("pointer: fine"), media, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => true,
  }) as MediaQueryList);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => { heroManifest.olharV = verticalFile; vi.useRealTimers(); vi.restoreAllMocks(); });

function mount() {
  const view = render(<SiteCopyContext.Provider value={siteCopy.pt}><Character paused={false} /></SiteCopyContext.Provider>);
  const char = screen.getByRole("button");
  const clip = (key: string) => view.container.querySelector<HTMLVideoElement>(`video[data-clip="${key}"]`)!;
  return { ...view, char, clip };
}

function mediaHarness(rvfc = true) {
  let now = performance.now(), id = 0;
  const raf = new Map<number, FrameRequestCallback>();
  const presented = new Map<HTMLVideoElement, VideoFrameRequestCallback>();
  const writes: { el: HTMLVideoElement; time: number }[] = [];
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(cb => { raf.set(++id, cb); return id; });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(k => { raf.delete(k); });
  if (rvfc) {
    Object.defineProperty(HTMLVideoElement.prototype, "requestVideoFrameCallback", { configurable: true, value(this: HTMLVideoElement, cb: VideoFrameRequestCallback) { presented.set(this, cb); return ++id; } });
    Object.defineProperty(HTMLVideoElement.prototype, "cancelVideoFrameCallback", { configurable: true, value(this: HTMLVideoElement) { presented.delete(this); } });
  }
  const view = mount();
  const videos = [view.clip("olhar"), view.clip("olhar-v")];
  for (const el of videos) {
    let time = 0, seeking = false;
    Object.defineProperties(el, {
      duration: { configurable: true, value: el === videos[0] ? 116 / 24 : 85 / 24 },
      readyState: { configurable: true, value: 4 },
      seeking: { configurable: true, get: () => seeking },
      currentTime: { configurable: true, get: () => time, set: (t: number) => { time = t; seeking = true; writes.push({ el, time: t }); } },
      finishSeek: { configurable: true, value: () => { seeking = false; fireEvent.seeked(el); } },
    });
    fireEvent.loadedMetadata(el);
  }
  const finish = (el: HTMLVideoElement) => (el as HTMLVideoElement & { finishSeek(): void }).finishSeek();
  const present = (el: HTMLVideoElement, k: number) => act(() => {
    const cb = presented.get(el); presented.delete(el);
    cb?.(now, { mediaTime: k / 24 } as VideoFrameCallbackMetadata);
  });
  const step = (count = 1, complete = false) => {
    for (let i = 0; i < count; i++) act(() => {
      now += 16;
      const callbacks = [...raf.values()]; raf.clear(); callbacks.forEach(cb => cb(now));
      if (complete) for (const el of videos) if (el.seeking) { finish(el); present(el, Math.floor(el.currentTime * 24)); }
    });
  };
  const move = (x: number, y: number) => fireEvent(window, new MouseEvent("pointermove", { clientX: x * innerWidth, clientY: y * innerHeight }));
  return { ...view, videos, writes, finish, present, step, move };
}

describe("interação do personagem", () => {
  afterEach(() => {
    cleanup();
    delete (HTMLVideoElement.prototype as Partial<HTMLVideoElement>).requestVideoFrameCallback;
    delete (HTMLVideoElement.prototype as Partial<HTMLVideoElement>).cancelVideoFrameCallback;
  });
  it("clique espera a neutra apresentada e não é cancelado ao sair", () => {
    const h = mediaHarness();
    h.move(0, 0.5); h.step(40, true);
    fireEvent.click(h.char); fireEvent.pointerLeave(h.char);
    expect(screen.getByRole("status")).toBeInTheDocument();
    h.step(30);
    expect(h.clip("clique-1")).not.toHaveAttribute("data-active");
    h.step(30, true);
    expect(h.clip("clique-1")).toHaveAttribute("data-active", "true");
    expect(h.videos[0].currentTime).toBe(frameTime(58));
    fireEvent.click(h.char);
    expect(h.clip("clique-1")).toHaveAttribute("data-active", "true");
    expect(h.clip("clique-2")).not.toHaveAttribute("data-active");
  });
  it("retomar depois de pausa ou aba oculta preserva o instante da reação", () => {
    const h = mediaHarness();
    h.videos.forEach(el => { h.finish(el); h.present(el, el === h.videos[0] ? 58 : 42); });
    fireEvent.click(h.char); h.step(30, true);
    const played = trackTime(h.clip("clique-1")); played(0.7);
    const tree = (paused: boolean) => <SiteCopyContext.Provider value={siteCopy.pt}><Character paused={paused} /></SiteCopyContext.Provider>;
    h.rerender(tree(true)); h.rerender(tree(false));
    expect(h.clip("clique-1").currentTime).toBe(0.7);
    let hidden = true;
    const visibility = vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    fireEvent(document, new Event("visibilitychange")); hidden = false;
    fireEvent(document, new Event("visibilitychange"));
    expect(h.clip("clique-1").currentTime).toBe(0.7);
    visibility.mockRestore();
  });

  it("toque percorre até a neutra, aguarda decode e retoma dela", () => {
    vi.mocked(window.matchMedia).mockImplementation(media => ({ matches: false, media }) as MediaQueryList);
    let now = performance.now(), id = 0, time = 20 / 24, seeking = false;
    const frames = new Map<number, FrameRequestCallback>();
    const writes: number[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(cb => { frames.set(++id, cb); return id; });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(k => { frames.delete(k); });
    const h = mount(), loop = h.clip("loop");
    Object.defineProperties(loop, {
      duration: { configurable: true, value: 232 / 24 },
      readyState: { configurable: true, value: 4 },
      seeking: { configurable: true, get: () => seeking },
      currentTime: { configurable: true, get: () => time, set: (t: number) => { time = t; writes.push(t); seeking = true; } },
    });
    const step = (count: number, finish: boolean) => {
      for (let i = 0; i < count; i++) act(() => {
        now += 16; const cbs = [...frames.values()]; frames.clear(); cbs.forEach(cb => cb(now));
        if (finish) { seeking = false; fireEvent.seeked(loop); }
      });
    };
    fireEvent.ended(h.clip("entrada")); fireEvent.click(h.char);
    expect(h.clip("clique-1")).not.toHaveAttribute("data-active");
    step(30, false);
    expect(h.clip("clique-1")).not.toHaveAttribute("data-active");
    step(30, true);
    expect(h.clip("clique-1")).toHaveAttribute("data-active", "true");
    expect(time).toBe(frameTime(0));
    expect(writes.length).toBeGreaterThan(1);
    expect(writes.every((t, i) => i === 0 || t <= writes[i - 1])).toBe(true);
    fireEvent.ended(h.clip("clique-1"));
    expect(loop).toHaveAttribute("data-active", "true");
    expect(time).toBe(frameTime(0));
  });
  it("troca só após apresentação da neutra visível e seeked do vídeo escondido", () => {
    const h = mediaHarness();
    h.move(0.5, 0);
    h.finish(h.videos[0]); h.finish(h.videos[1]);
    h.step(1);
    expect(h.videos[0]).toHaveAttribute("data-active", "true");
    h.present(h.videos[0], 58); h.step();
    expect(h.videos[1]).toHaveAttribute("data-active", "true");
    expect(h.writes.every(w => Math.abs(w.time * 24 - 0.5 - Math.round(w.time * 24 - 0.5)) < 1e-9)).toBe(true);
  });
  it.each([false, true])("tem fallback de apresentação quando rVFC existe=%s", rvfc => {
    const h = mediaHarness(rvfc);
    h.move(0.5, 0);
    h.videos.forEach(h.finish);
    h.step(rvfc ? 17 : 1);
    expect(h.videos[1]).toHaveAttribute("data-active", "true");
  });
  it("não repete seeks parado e retoma da neutra depois da reação", () => {
    const h = mediaHarness();
    h.videos.forEach(el => { h.finish(el); h.present(el, el === h.videos[0] ? 58 : 42); });
    h.move(0.5, 0.5); h.step(60, true);
    const count = h.writes.length; h.step(60, true);
    expect(h.writes).toHaveLength(count);
    fireEvent.click(h.char); h.step(5, true); fireEvent.ended(h.clip("clique-1"));
    h.step(60, true); expect(h.writes).toHaveLength(count);
    h.move(0.5, 0); h.step(30, true);
    expect(h.videos[1]).toHaveAttribute("data-active", "true");
    fireEvent.error(h.videos[1]); h.step(3, true);
    expect(h.videos[0]).toHaveAttribute("data-active", "true");
    expect(h.videos[0].currentTime).toBe(frameTime(58));
  });
  it("mede o cursor a partir dos olhos: ao lado do rosto olha para o lado, acima olha para cima", () => {
    const size = { innerWidth: window.innerWidth, innerHeight: window.innerHeight };
    Object.defineProperties(window, { innerWidth: { configurable: true, value: 1440 }, innerHeight: { configurable: true, value: 900 } });
    try {
      const h = mediaHarness();
      vi.spyOn(h.char, "getBoundingClientRect").mockReturnValue({ left: 620, top: 0, width: 820, height: 900, right: 1440, bottom: 900, x: 620, y: 0, toJSON() {} } as DOMRect);
      h.videos.forEach(el => { h.finish(el); h.present(el, el === h.videos[0] ? 58 : 42); });
      // Ao lado do rosto, acima do centro da janela: a regra antiga olhava para cima.
      const at = (x: number, y: number) => fireEvent(window, new MouseEvent("pointermove", { clientX: x, clientY: y }));
      at(850, 290); h.step(60, true);
      expect(h.videos[0]).toHaveAttribute("data-active", "true");
      expect(h.videos[0].currentTime).toBeLessThan(frameTime(58));
      // Ao lado do peito, abaixo do centro: continua olhando para o lado.
      at(850, 650); h.step(60, true);
      expect(h.videos[0]).toHaveAttribute("data-active", "true");
      // Logo acima dos olhos: olha para cima.
      at(1250, 10); h.step(80, true);
      expect(h.videos[1]).toHaveAttribute("data-active", "true");
      expect(h.videos[1].currentTime).toBeLessThan(frameTime(42));
    } finally {
      Object.defineProperties(window, { innerWidth: { configurable: true, value: size.innerWidth }, innerHeight: { configurable: true, value: size.innerHeight } });
    }
  });
  it("aguarda a neutra apresentada para hover e cancela ao sair", () => {
    const h = mediaHarness();
    h.move(0.5, 0.5); fireEvent.pointerEnter(h.char);
    h.videos.forEach(h.finish); h.step();
    expect(h.clip("hover")).not.toHaveAttribute("data-active");
    fireEvent.pointerLeave(h.char); h.present(h.videos[0], 58); h.step();
    expect(h.clip("hover")).not.toHaveAttribute("data-active");
    const n = h.writes.length;
    fireEvent.pointerEnter(h.char); h.step();
    expect(h.clip("hover")).toHaveAttribute("data-active", "true");
    expect(h.writes).toHaveLength(n);
  });
  it("retoma o horizontal se um tick antigo reativar V antes do commit do erro", () => {
    const h = mediaHarness();
    h.videos.forEach(el => { h.finish(el); h.present(el, el === h.videos[0] ? 58 : 42); });
    h.move(0.5, 0); h.step(40, true);
    expect(h.videos[1]).toHaveAttribute("data-active", "true");
    // O erro agenda o render; os ticks ainda usam o vertical da closure anterior.
    act(() => { fireEvent.error(h.videos[1]); h.step(3, true); });
    h.move(1, 0.5); h.step(80, true);
    expect(h.videos[0]).toHaveAttribute("data-active", "true");
    expect(h.videos[0].currentTime).toBeGreaterThan(frameTime(100));
    fireEvent.pointerEnter(h.char); h.step(80, true);
    expect(h.clip("hover")).toHaveAttribute("data-active", "true");
  });
  it.each(["touch", "reduced"])("não inicia seeker ou rVFC em %s", mode => {
    vi.mocked(window.matchMedia).mockImplementation(media => ({ matches: mode === "reduced" && media.includes("reduced-motion") }) as MediaQueryList);
    const callback = vi.fn();
    Object.defineProperty(HTMLVideoElement.prototype, "requestVideoFrameCallback", { configurable: true, value: callback });
    const { clip } = mount();
    expect(clip("olhar-v")).toBeNull(); expect(callback).not.toHaveBeenCalled();
    if (mode === "reduced") expect(clip("entrada")).toBeNull();
  });
  it("uma decodificação pendente não desliga o eixo vertical já carregado", () => {
    let id = 0;
    let now = performance.now();
    let verticalReady = 4;
    const frames = new Map<number, FrameRequestCallback>();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => { frames.set(++id, callback); return id; });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(token => { frames.delete(token); });
    const { clip } = mount();
    for (const key of ["olhar", "olhar-v"]) {
      Object.defineProperty(clip(key), "duration", { configurable: true, value: 4.8 });
      Object.defineProperty(clip(key), "readyState", { configurable: true, get: () => key === "olhar-v" ? verticalReady : 4 });
      fireEvent.loadedMetadata(clip(key));
      fireEvent.seeked(clip(key));
    }
    const step = (count: number) => {
      for (let i = 0; i < count; i++) act(() => {
        now += 16;
        const pending = [...frames.values()]; frames.clear();
        pending.forEach(callback => callback(now));
        for (const key of ["olhar", "olhar-v"]) fireEvent.seeked(clip(key));
      });
    };
    fireEvent(window, new MouseEvent("pointermove", { clientX: innerWidth / 2, clientY: 0 }));
    step(120);
    expect(clip("olhar-v")).toHaveAttribute("data-active", "true");
    verticalReady = 1;
    step(120);
    expect(clip("olhar-v")).toHaveAttribute("data-active", "true");
    expect(clip("olhar-v").currentTime / 4.8).toBeLessThan(0.05);
  });
  it("prepara o vídeo vertical no desktop sem carregá-lo antes do lazy", () => {
    const { clip } = mount();
    expect(clip("olhar-v")).not.toBeNull();
    expect(clip("olhar-v")).not.toHaveAttribute("src");
  });

  it("sem clipe vertical continua seguindo o mouse na horizontal", () => {
    delete heroManifest.olharV;
    const { clip } = mount();
    fireEvent.pointerMove(window, { clientX: 20, clientY: 20 });
    expect(clip("olhar-v")).toBeNull();
    expect(clip("olhar")).toHaveAttribute("data-active", "true");
  });

  it("o movimento do cursor não gira nem desloca o plano do personagem", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => { frames.push(callback); return frames.length; });
    const { char } = mount();
    fireEvent.pointerMove(window, { clientX: 20, clientY: 20 });
    act(() => { frames.splice(0).forEach(callback => callback(performance.now() + 16)); });
    for (const property of ["--char-tilt-x", "--char-tilt-y", "--char-shift-x", "--char-shift-y"]) {
      expect(char.style.getPropertyValue(property)).toBe("");
    }
  });

  it("erro do vídeo vertical preserva o olhar horizontal e as reações", () => {
    const h = mediaHarness();
    h.videos.forEach(el => { h.finish(el); h.present(el, el === h.videos[0] ? 58 : 42); });
    fireEvent.click(h.char); h.step(30, true);
    fireEvent.ended(h.clip("clique-1"));
    expect(h.clip("olhar-v")).not.toBeNull();
    fireEvent.error(h.clip("olhar-v"));
    expect(h.clip("olhar")).toHaveAttribute("data-active", "true");
    fireEvent.click(h.char); h.step(30, true);
    expect(h.clip("clique-2")).toHaveAttribute("data-active", "true");
  });

  it("o primeiro movimento acompanha o cursor sem esperar o vídeo de entrada", () => {
    const { clip } = mount();
    fireEvent.pointerMove(window, { clientX: 20, clientY: 20 });
    expect(clip("olhar")).toHaveAttribute("data-active", "true");
  });

  it("a fala some após quatro segundos mesmo com o cursor se movendo", () => {
    const { char } = mount();
    fireEvent.click(char);
    expect(screen.getByRole("status")).toBeInTheDocument();
    for (let i = 0; i < 5; i++) {
      act(() => { vi.advanceTimersByTime(1000); });
      fireEvent.pointerMove(window, { clientX: 20 + i, clientY: 20 });
    }
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("o fim da reação não cancela o prazo da fala", () => {
    const h = mediaHarness();
    h.videos.forEach(el => { h.finish(el); h.present(el, el === h.videos[0] ? 58 : 42); });
    fireEvent.click(h.char); h.step(30, true);
    expect(h.clip("clique-1")).toHaveAttribute("data-active", "true");
    act(() => { vi.advanceTimersByTime(1000); });
    fireEvent.ended(h.clip("clique-1"));
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("o fim de um vídeo inativo não interrompe o clique atual", () => {
    const h = mediaHarness();
    h.videos.forEach(el => { h.finish(el); h.present(el, el === h.videos[0] ? 58 : 42); });
    fireEvent.click(h.char); h.step(30, true);
    fireEvent.ended(h.clip("entrada"));
    expect(h.clip("clique-1")).toHaveAttribute("data-active", "true");
  });

  // Um clipe parado no meio apareceria nessa pose, por um ou dois quadros de
  // tela, na próxima vez em que fosse ativado, até o seek para 0 terminar.
  function trackTime(el: HTMLVideoElement) {
    let time = 0;
    Object.defineProperty(el, "currentTime", { configurable: true, get: () => time, set: (t: number) => { time = t; } });
    return (t: number) => { time = t; };
  }

  it("um clique termina antes de outro gesto e volta ao começo ao sair de cena", () => {
    const h = mediaHarness();
    h.videos.forEach(el => { h.finish(el); h.present(el, el === h.videos[0] ? 58 : 42); });
    fireEvent.click(h.char); h.step(30, true);
    const played = trackTime(h.clip("clique-1"));
    played(0.7);
    fireEvent.click(h.char);
    expect(h.clip("clique-1")).toHaveAttribute("data-active", "true");
    expect(h.clip("clique-1").currentTime).toBe(0.7);
    fireEvent.ended(h.clip("clique-1"));
    expect(h.clip("clique-1").currentTime).toBe(0);
  });

  it("um hover cancelado ao sair volta ao começo", () => {
    const h = mediaHarness();
    h.move(0.5, 0.5); fireEvent.pointerEnter(h.char);
    h.videos.forEach(h.finish); h.present(h.videos[0], 58); h.step();
    expect(h.clip("hover")).toHaveAttribute("data-active", "true");
    const played = trackTime(h.clip("hover"));
    played(0.7);
    fireEvent.pointerLeave(h.char);
    expect(h.clip("olhar")).toHaveAttribute("data-active", "true");
    expect(h.clip("hover").currentTime).toBe(0);
  });

  it("sair do personagem cancela o hover pendente e retoma o olhar", () => {
    const { char, clip } = mount();
    fireEvent.ended(clip("entrada"));
    fireEvent.pointerEnter(char);
    fireEvent.pointerLeave(char);
    expect(clip("olhar")).toHaveAttribute("data-active", "true");
  });
});
