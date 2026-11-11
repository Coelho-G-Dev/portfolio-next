import gsap from "gsap";
import type { CameraTarget } from "@/lib/doorCamera";
import { flowTop } from "../flowTop";

export type DoorSceneEls = {
  world: HTMLElement;
  leaves: [HTMLElement, HTMLElement];
  shades: HTMLElement[];
  spill: HTMLElement;
  /** As outras portas e os rótulos. */
  dim: HTMLElement[];
};

export const PERSPECTIVE = 1200;

export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const LEAF_ANGLE = 92;
const SHADE_OPACITY = 0.55;
const DIM_OPACITY = 0.12;
const NEAR_Z = 200;

// Curvas do protótipo B (cubic-bezier) aproximadas pelas nomeadas do GSAP.
const EASE_IN_OUT = "power3.inOut"; // .65,0,.35,1
const EASE_SWING = "power3.out"; // .3,.9,.25,1
const EASE_OUT = "power3.out"; // .2,.75,.15,1
const EASE_WALK = "power2.out"; // .45,0,.2,1 : desacelera ao chegar

/**
 * Entrada: câmera até a porta, folhas abrindo, câmera caminhando até a sala (~1,6 s).
 * Os valores iniciais são explícitos (fromTo), então a linha do tempo também reverte
 * certo quando criada depois de `arrivedState`.
 */
export function enterTimeline(
  els: DoorSceneEls,
  t: CameraTarget,
  onArrive: () => void,
): gsap.core.Timeline {
  const [left, right] = els.leaves;
  const tl = gsap.timeline({ paused: true, onComplete: onArrive });

  // 1. câmera centraliza a porta e se aproxima (x, y em 0,7 s)
  tl.fromTo(
    els.world,
    { x: 0, y: 0 },
    { x: t.x, y: t.y, duration: 0.7, ease: EASE_IN_OUT },
    0,
  );
  // z: a aproximação (até 200) e a caminhada (até t.z, 1,25 s a partir de 0,35 s)
  // são um só movimento contínuo, para a câmera não dar salto no encontro dos dois.
  tl.fromTo(
    els.world,
    { z: 0 },
    { z: NEAR_Z, duration: 0.35, ease: "power2.in" },
    0,
  );
  tl.fromTo(
    els.world,
    { z: NEAR_Z },
    { z: t.z, duration: 1.25, ease: EASE_WALK, immediateRender: false },
    0.35,
  );

  // 2. folhas giram para fora, sombra na face, luz no chão
  tl.fromTo(
    left,
    { rotationY: 0 },
    { rotationY: -LEAF_ANGLE, duration: 0.95, ease: EASE_SWING },
    0.36,
  );
  tl.fromTo(
    right,
    { rotationY: 0 },
    { rotationY: LEAF_ANGLE, duration: 0.95, ease: EASE_SWING },
    0.4,
  );
  tl.fromTo(
    els.shades,
    { opacity: 0 },
    { opacity: SHADE_OPACITY, duration: 0.95, ease: EASE_SWING },
    0.38,
  );
  tl.fromTo(
    els.spill,
    { opacity: 0 },
    { opacity: 1, duration: 0.7, ease: EASE_OUT },
    0.42,
  );
  // outras portas e rótulos esmaecem
  tl.fromTo(
    els.dim,
    { opacity: 1 },
    { opacity: DIM_OPACITY, duration: 0.5, ease: EASE_OUT },
    0,
  );

  return tl;
}

/** Quadro final da entrada, sem animar (link direto e recriação da cena antes da volta). */
export function arrivedState(els: DoorSceneEls, t: CameraTarget): void {
  gsap.set(els.world, { x: t.x, y: t.y, z: t.z });
  gsap.set(els.leaves[0], { rotationY: -LEAF_ANGLE });
  gsap.set(els.leaves[1], { rotationY: LEAF_ANGLE });
  gsap.set(els.shades, { opacity: SHADE_OPACITY });
  gsap.set(els.spill, { opacity: 1 });
  gsap.set(els.dim, { opacity: DIM_OPACITY });
}

/**
 * Cena em repouso: tira o que as linhas do tempo e `arrivedState` deixaram no
 * style (o CSS volta a mandar). Usado quando a volta é só o esmaecer.
 */
export function restState(els: DoorSceneEls): void {
  gsap.set([els.world, ...els.leaves], { clearProps: "transform" });
  gsap.set([...els.shades, els.spill, ...els.dim], { clearProps: "opacity" });
}

/** Movimento reduzido: só esmaece (0,2 s), sem câmera nem giro. */
export function fadeTimeline(
  el: HTMLElement,
  dir: "in" | "out",
  onDone: () => void,
): gsap.core.Timeline {
  const tl = gsap.timeline({ onComplete: onDone });
  tl.fromTo(
    el,
    { opacity: dir === "in" ? 0 : 1 },
    { opacity: dir === "in" ? 1 : 0, duration: 0.2, ease: "none" },
  );
  return tl;
}

/** Rola até o topo do palco (0,4 s). `null` se ele já está inteiro na tela. */
export function scrollIntoStage(stage: HTMLElement): gsap.core.Tween | null {
  const r = stage.getBoundingClientRect();
  if (r.top >= -1 && r.bottom <= window.innerHeight + 1) return null;
  // O destino em fluxo ignora o sticky e a escala da Cortina. O CSS smooth
  // não pode animar de novo cada quadro do tween: ele terminaria antes de a
  // página chegar, removendo a sala enquanto a folha seguinte está na tela.
  const position = { y: window.scrollY };
  return gsap.to(position, {
    y: flowTop(stage),
    duration: 0.4,
    ease: "power2.inOut",
    onUpdate: () => window.scrollTo({ top: position.y, behavior: "instant" }),
  });
}
