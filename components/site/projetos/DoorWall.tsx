"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type PointerEvent, type Ref } from "react";
import { isDoor } from "@/data/doors";
import { cameraTarget } from "@/lib/doorCamera";
import { useSiteCopy } from "../SiteCopyContext";
import { PERSPECTIVE, type DoorSceneEls } from "./doorMotion";
import RoomPreview from "./RoomPreview";

export type WallDoor = { id: string; index: number; name: string; teaser: string };

export type DoorRects = { stage: DOMRect; reveal: DOMRect };

export type DoorScene = {
  /** Elementos que a linha do tempo anima. `dim` = as outras portas, o rótulo desta e o título da parede. `null` se a porta não existe. */
  getEls(id: string): DoorSceneEls | null;
  /**
   * Palco e abertura da porta medidos com a câmera em repouso (sem o transform do
   * mundo nem o avanço do hover). `null` se a porta não existe ou se a abertura
   * mede 0 de largura (palco com `display: none`, por exemplo): quem chama deve
   * pular a animação em vez de mirar num alvo falso.
   */
  getRects(id: string): DoorRects | null;
  /** Põe o foco no botão da porta (a volta devolve o foco a ela). */
  focusDoor(id: string): void;
};

const PHONE_QUERY = "(max-width: 599px)";
const SWIPE_PX = 40;

type Measure = { w: number; h: number; k: Record<string, number> };

// Mede com o transform do mundo e da porta desligados e os devolve sem disparar
// transição: o transform volta antes de a transição voltar, com um reflow no meio.
function restRects(stage: HTMLElement, door: HTMLElement): DoorRects | null {
  const reveal = door.querySelector<HTMLElement>(".s-door__reveal");
  const world = stage.querySelector<HTMLElement>(".s-world");
  if (!reveal || !world) return null;
  const held = [world, door].map((el) => ({ el, transform: el.style.transform, transition: el.style.transition }));
  // A fila do carrossel: só a transição é suspensa (um deslize em curso salta para o
  // fim) e o transform fica, para medir a porta que está na tela.
  const wall = door.parentElement;
  const wallTransition = wall?.style.transition ?? "";
  if (wall) wall.style.transition = "none";
  for (const { el } of held) {
    el.style.transition = "none";
    el.style.transform = "none";
  }
  const rects = { stage: stage.getBoundingClientRect(), reveal: reveal.getBoundingClientRect() };
  for (const h of held) h.el.style.transform = h.transform;
  void stage.offsetWidth;
  for (const h of held) h.el.style.transition = h.transition;
  if (wall) wall.style.transition = wallTransition;
  return rects.reveal.width > 0 && rects.stage.width > 0 ? rects : null;
}

export default function DoorWall({
  doors,
  activeId,
  busy,
  onSelect,
  lang,
  stageRef,
  sceneRef,
}: {
  doors: WallDoor[];
  activeId: string | null;
  busy: boolean;
  onSelect: (id: string) => void;
  lang: "pt" | "en";
  stageRef?: Ref<HTMLDivElement>;
  sceneRef?: Ref<DoorScene>;
}) {
  const c = useSiteCopy().projetos;
  const stageEl = useRef<HTMLDivElement>(null);
  const [measure, setMeasure] = useState<Measure | null>(null);

  useImperativeHandle(stageRef, () => stageEl.current as HTMLDivElement, []);

  const doorEl = useCallback(
    (id: string) =>
      Array.from(stageEl.current?.querySelectorAll<HTMLElement>(".s-door") ?? []).find((d) => d.dataset.door === id) ??
      null,
    [],
  );

  const getRects = useCallback(
    (id: string) => {
      const stage = stageEl.current;
      const door = doorEl(id);
      return stage && door ? restRects(stage, door) : null;
    },
    [doorEl],
  );

  const getEls = useCallback(
    (id: string): DoorSceneEls | null => {
      const stage = stageEl.current;
      const door = doorEl(id);
      if (!stage || !door) return null;
      const world = stage.querySelector<HTMLElement>(".s-world");
      const [left, right] = door.querySelectorAll<HTMLElement>(".s-leaf");
      const spill = door.querySelector<HTMLElement>(".s-door__spill");
      const label = door.querySelector<HTMLElement>(".s-door__label");
      const lead = stage.querySelector<HTMLElement>(".s-stage__lead");
      if (!world || !left || !right || !spill) return null;
      const others = Array.from(stage.querySelectorAll<HTMLElement>(".s-door")).filter((d) => d !== door);
      return {
        world,
        leaves: [left, right],
        shades: Array.from(door.querySelectorAll<HTMLElement>(".s-leaf__shade")),
        spill,
        dim: [...others, ...(label ? [label] : []), ...(lead ? [lead] : [])],
      };
    },
    [doorEl],
  );

  const focusDoor = useCallback((id: string) => doorEl(id)?.focus(), [doorEl]);

  useImperativeHandle(sceneRef, () => ({ getEls, getRects, focusDoor }), [getEls, getRects, focusDoor]);

  // A miniatura tem o tamanho do palco e escala 1/k: no fim da caminhada da
  // câmera (z = P·(1 − 1/k)) ela fica em escala 1, onde a sala real vai estar.
  const doorKey = doors.map((d) => d.id).join(" ");
  useEffect(() => {
    const stage = stageEl.current;
    if (!stage) return;
    const update = () => {
      const k: Record<string, number> = {};
      let size: DoorRects["stage"] | null = null;
      for (const id of doorKey.split(" ")) {
        const rects = getRects(id);
        if (!rects) return;
        size = rects.stage;
        k[id] = cameraTarget(rects.stage, rects.reveal, PERSPECTIVE).k;
      }
      if (!size) return;
      const next: Measure = { w: size.width, h: size.height, k };
      setMeasure((prev) =>
        prev && prev.w === next.w && prev.h === next.h && Object.keys(k).every((id) => prev.k[id] === k[id])
          ? prev
          : next,
      );
    };
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [doorKey, getRects]);

  const locked = busy || activeId !== null;

  // Carrossel (< 600px): a fila desliza por CSS (--wall-i); o JS só guarda a porta
  // atual. Os controles somem por CSS nas telas largas (display: none), então não
  // há diferença entre servidor e cliente. `narrow` só liga o gesto de arrastar.
  const [current, setCurrent] = useState(0);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(PHONE_QUERY);
    const sync = () => setNarrow(mql.matches);
    sync();
    mql.addEventListener?.("change", sync);
    return () => mql.removeEventListener?.("change", sync);
  }, []);

  const last = doors.length - 1;
  const go = (to: number) => {
    if (!locked) setCurrent(Math.min(last, Math.max(0, to)));
  };

  // A porta aberta é sempre a atual (hash, Voltar do navegador).
  useEffect(() => {
    const open = doors.findIndex((d) => d.id === activeId);
    if (open >= 0) setCurrent(open);
  }, [activeId, doors]);

  const prevBtn = useRef<HTMLButtonElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  // Ao chegar numa ponta o botão clicado desabilita e perderia o foco: passa ao outro.
  const step = (by: number) => {
    const to = Math.min(last, Math.max(0, current + by));
    go(to);
    if (to === 0 || to === last) (to === 0 ? nextBtn : prevBtn).current?.focus();
  };

  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const swiped = useRef(false);
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    drag.current = null;
    if (!start || start.id !== e.pointerId || e.type === "pointercancel") return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - start.y)) {
      swiped.current = true;
      go(current + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <div
      ref={stageEl}
      className="s-stage"
      data-locked={locked ? "" : undefined}
      style={{ perspective: `${PERSPECTIVE}px` }}
      onPointerDown={(e) => {
        swiped.current = false;
        if (narrow && !locked) drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      // O foco numa porta fora da tela (Tab, leitor de tela) rola o palco, e a
      // rolagem somaria ao deslize da fila: quem mostra a porta é o carrossel.
      onScroll={(e) => {
        e.currentTarget.scrollLeft = 0;
        e.currentTarget.scrollTop = 0;
      }}
    >
      <div className="s-world">
        <p className="s-stage__lead">{c.doorsTitle}</p>
        <div className="s-wall" style={{ "--wall-i": current } as CSSProperties}>
          {doors.map((door) => {
            const k = measure?.k[door.id];
            const leafTone = {
              "--leaf-claro": `var(--c-porta-${door.id}-claro)`,
              "--leaf-escuro": `var(--c-porta-${door.id}-escuro)`,
            } as CSSProperties;
            return (
              <button
                key={door.id}
                type="button"
                className="s-door"
                data-door={door.id}
                style={leafTone}
                aria-label={c.open(door.name)}
                // O nome acessível é só "Abrir a porta X"; o teaser vem como descrição.
                aria-describedby={`door-teaser-${door.id}`}
                aria-expanded={activeId === door.id}
                aria-controls={`door-panel-${door.id}`}
                onFocus={() => go(door.index)}
                onClick={(e) => {
                  // Só o clique que vem do gesto (detail > 0); Enter/Espaço têm detail 0.
                  if (swiped.current && e.detail > 0) {
                    swiped.current = false;
                    return;
                  }
                  swiped.current = false;
                  if (!busy) onSelect(door.id);
                }}
              >
                <span className="s-door__body">
                  <span className="s-door__floor" />
                  <span className="s-door__spill" />
                  <span className="s-door__jamb">
                    <span className="s-door__reveal">
                      {measure && k && isDoor(door.id) ? (
                        <span
                          className="s-door__mini"
                          style={{
                            width: measure.w,
                            height: measure.h,
                            transform: `translate(-50%, -50%) scale(${1 / k})`,
                          }}
                        >
                          <RoomPreview
                            door={door.id}
                            index={door.index}
                            lang={lang}
                            width={measure.w}
                            height={measure.h}
                          />
                        </span>
                      ) : null}
                    </span>
                    <Leaf side="l" />
                    <Leaf side="r" />
                    <span className="s-door__keystone">
                      <span className="s-door__plaque">{door.name.toUpperCase()}</span>
                    </span>
                  </span>
                  <span className="s-door__gap" />
                  <span className="s-door__label">
                    <span className="s-door__name">{door.name}</span>
                    <span id={`door-teaser-${door.id}`} className="s-door__line">
                      {door.teaser}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="s-carousel">
        <button
          type="button"
          ref={prevBtn}
          className="s-carousel__btn"
          aria-label={c.carousel.prev}
          onClick={() => step(-1)}
          disabled={locked || current === 0}
        >
          ‹
        </button>
        {/* O leitor de tela ouve "Porta 2 de 3"; na tela fica só "2 de 3". */}
        <span aria-live="polite">
          <span className="sr-only">{c.carousel.positionPrefix} </span>
          <span className="s-carousel__pos">{c.carousel.position(current + 1, doors.length)}</span>
        </span>
        <button
          type="button"
          ref={nextBtn}
          className="s-carousel__btn"
          aria-label={c.carousel.next}
          onClick={() => step(1)}
          disabled={locked || current === last}
        >
          ›
        </button>
      </div>
    </div>
  );
}

function Leaf({ side }: { side: "l" | "r" }) {
  return (
    <span className={`s-leaf s-leaf--${side}`}>
      <span className="s-leaf__face">
        <span className="s-leaf__panel s-leaf__panel--top" />
        <span className="s-leaf__panel s-leaf__panel--bot" />
        <span className="s-leaf__pull" />
        <span className="s-leaf__shade" />
      </span>
      <span className="s-leaf__back" />
      <span className="s-leaf__edge" />
    </span>
  );
}
