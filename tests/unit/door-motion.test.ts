import { describe, expect, it, vi } from "vitest";
import gsap from "gsap";
import {
  arrivedState,
  enterTimeline,
  fadeTimeline,
  PERSPECTIVE,
  restState,
  scrollIntoStage,
  type DoorSceneEls,
} from "@/components/site/projetos/doorMotion";

const div = () => document.createElement("div");
function makeEls(): DoorSceneEls {
  return {
    world: div(),
    leaves: [div(), div()],
    shades: [div(), div()],
    spill: div(),
    dim: [div(), div()],
  };
}
const T = { x: 30, y: 130, z: 1042.5, k: 7.6 };

describe("movimento das portas", () => {
  it("usa a perspectiva do protótipo", () => {
    expect(PERSPECTIVE).toBe(1200);
  });

  it("a linha do tempo de entrada termina com a câmera no alvo, as folhas abertas e chama onArrive", () => {
    const els = makeEls();
    const onArrive = vi.fn();
    const tl = enterTimeline(els, T, onArrive);
    tl.progress(1);
    expect(onArrive).toHaveBeenCalledOnce();
    expect(gsap.getProperty(els.world, "x")).toBe(30);
    expect(gsap.getProperty(els.world, "y")).toBe(130);
    expect(gsap.getProperty(els.world, "z")).toBe(1042.5);
    expect(gsap.getProperty(els.leaves[0], "rotationY")).toBe(-92);
    expect(gsap.getProperty(els.leaves[1], "rotationY")).toBe(92);
    expect(els.leaves[0].style.transform).toContain("rotateY(-92deg)");
    expect(els.leaves[1].style.transform).toContain("rotateY(92deg)");
    expect(Number(els.spill.style.opacity)).toBe(1);
    expect(Number(els.dim[0].style.opacity)).toBeCloseTo(0.12);
  });

  it("dura cerca de 1,6 s", () => {
    const tl = enterTimeline(makeEls(), T, () => {});
    expect(tl.duration()).toBeCloseTo(1.6, 2);
  });

  it("revertida, volta ao quadro inicial e chama onReverseComplete", () => {
    const els = makeEls();
    const onLeft = vi.fn();
    const tl = enterTimeline(els, { ...T, z: 1000 }, () => {});
    tl.eventCallback("onReverseComplete", onLeft);
    tl.progress(1).reverse();
    tl.progress(0);
    expect(gsap.getProperty(els.leaves[0], "rotationY")).toBe(0);
    expect(gsap.getProperty(els.world, "z")).toBe(0);
    expect(Number(els.dim[0].style.opacity)).toBe(1);
  });

  it("arrivedState aplica o quadro final sem animar", () => {
    const els = makeEls();
    arrivedState(els, T);
    expect(gsap.getProperty(els.world, "z")).toBe(1042.5);
    expect(gsap.getProperty(els.leaves[1], "rotationY")).toBe(92);
    expect(Number(els.spill.style.opacity)).toBe(1);
  });

  it("restState devolve a cena ao repouso do CSS, sem tocar outros estilos", () => {
    const els = makeEls();
    els.dim[0].style.setProperty("--leaf-claro", "red");
    arrivedState(els, T);
    restState(els);
    expect(els.world.style.transform).toBe("");
    expect(els.leaves[0].style.transform).toBe("");
    expect(els.spill.style.opacity).toBe("");
    expect(els.shades[0].style.opacity).toBe("");
    expect(els.dim[0].style.opacity).toBe("");
    expect(els.dim[0].style.getPropertyValue("--leaf-claro")).toBe("red");
    expect(gsap.getProperty(els.world, "z")).toBe(0);
  });

  it("depois de arrivedState, uma linha do tempo nova ainda reverte até o quadro inicial", () => {
    const els = makeEls();
    arrivedState(els, T);
    const tl = enterTimeline(els, T, () => {});
    tl.progress(1).reverse();
    tl.progress(0);
    expect(gsap.getProperty(els.world, "z")).toBe(0);
    expect(gsap.getProperty(els.leaves[0], "rotationY")).toBe(0);
  });

  it("fadeTimeline esmaece em 0,2 s e avisa no fim", () => {
    const el = div();
    const done = vi.fn();
    const tl = fadeTimeline(el, "in", done);
    expect(tl.duration()).toBeCloseTo(0.2, 3);
    tl.progress(1);
    expect(done).toHaveBeenCalledOnce();
    expect(Number(el.style.opacity)).toBe(1);
    const out = fadeTimeline(el, "out", () => {});
    out.progress(1);
    expect(Number(el.style.opacity)).toBe(0);
  });

  it("scrollIntoStage devolve null se o palco já está inteiro na tela", () => {
    const stage = div();
    stage.getBoundingClientRect = () =>
      ({ top: 0, bottom: window.innerHeight - 10, left: 0, right: 100, width: 100, height: 100 }) as DOMRect;
    expect(scrollIntoStage(stage)).toBeNull();
  });

  it("scrollIntoStage devolve um tween de 0,4 s se o palco está cortado", () => {
    const stage = div();
    stage.getBoundingClientRect = () =>
      ({ top: window.innerHeight - 50, bottom: window.innerHeight + 700, left: 0, right: 100, width: 100, height: 750 }) as DOMRect;
    const tw = scrollIntoStage(stage);
    expect(tw).not.toBeNull();
    expect(tw!.duration()).toBeCloseTo(0.4, 3);
    tw!.kill();
  });

  it("a rolagem da animação chega imediatamente ao alvo, mesmo com CSS smooth", () => {
    const stage = div();
    stage.getBoundingClientRect = () => ({ top: -500, bottom: 400, width: 100, height: 900 }) as DOMRect;
    Object.defineProperty(stage, "offsetTop", { configurable: true, value: 1200 });
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    document.documentElement.style.scrollBehavior = "smooth";
    const tw = scrollIntoStage(stage)!;
    tw.progress(1);
    expect(scroll).toHaveBeenLastCalledWith({ top: 1200, behavior: "instant" });
    tw.kill();
    document.documentElement.style.scrollBehavior = "";
  });
});
