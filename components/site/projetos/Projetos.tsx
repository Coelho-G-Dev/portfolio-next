"use client";

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { DOORS, isDoor, type Door } from "@/data/doors";
import { cameraTarget } from "@/lib/doorCamera";
import { doorFromHash, doorReducer, hashFor, type DoorEvent, type DoorState } from "@/lib/doorMachine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "../Chapter";
import { useSiteCopy } from "../SiteCopyContext";
import DoorRoom from "./DoorRoom";
import DoorWall, { type DoorScene, type WallDoor } from "./DoorWall";
import Featured from "./Featured";
import {
  arrivedState,
  enterTimeline,
  fadeTimeline,
  PERSPECTIVE,
  prefersReducedMotion,
  restState,
  scrollIntoStage,
} from "./doorMotion";

type Timeline = ReturnType<typeof enterTimeline>;
type Tween = NonNullable<ReturnType<typeof scrollIntoStage>>;

const CLOSED: DoorState = { phase: "closed" };

// A cena fica montada embaixo da sala aberta, invisível e inerte, para a volta
// partir do mesmo quadro em que a entrada chegou.
const HIDDEN_SCENE = { visibility: "hidden", position: "absolute", inset: "0 0 auto 0" } as const;

export default function Projetos({ lang: langProp }: { lang?: "pt" | "en" }) {
  const { language } = useLanguage();
  const lang = langProp ?? language;
  const c = useSiteCopy().projetos;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Section id="projetos" title={c.title}>
      <Featured lang={lang} />
      {mounted ? (
        <DoorChapter lang={lang} />
      ) : (
        // Sem JavaScript: todas as salas abertas, uma embaixo da outra.
        <div className="s-rooms-static">
          {DOORS.map((door, index) => (
            <DoorRoom key={door} door={door} index={index} lang={lang} staticMode />
          ))}
        </div>
      )}
    </Section>
  );
}

// Só existe no cliente (depois de montar): a parede, a sala e as linhas do tempo.
function DoorChapter({ lang }: { lang: "pt" | "en" }) {
  const c = useSiteCopy().projetos;
  const [state, dispatch] = useReducer(doorReducer, CLOSED);
  // Movimento reduzido na abertura/volta em curso: a sala esmaece no lugar do palco.
  const [fade, setFade] = useState(false);

  const stateRef = useRef<DoorState>(CLOSED);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<DoorScene>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const sceneWrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tlRef = useRef<Timeline | null>(null);
  const scrollRef = useRef<Tween | null>(null);
  const leavingRef = useRef(false);
  const jumpedRef = useRef(false);
  const focusDoorRef = useRef<string | null>(null);
  const prevPhase = useRef<DoorState["phase"]>("closed");

  // O estado anda junto do reducer, para os ouvintes (Esc, popstate, GSAP)
  // nunca lerem uma fase velha entre um evento e a renderização.
  const send = useCallback((e: DoorEvent) => {
    stateRef.current = doorReducer(stateRef.current, e);
    dispatch(e);
  }, []);

  const finishLeft = useCallback(() => {
    tlRef.current = null;
    leavingRef.current = false;
    send({ type: "left" });
  }, [send]);

  const arrive = useCallback(() => {
    tlRef.current = null;
    send({ type: "arrived" });
  }, [send]);

  const jump = useCallback(
    (id: Door) => {
      if (stateRef.current.phase !== "closed") return;
      jumpedRef.current = true;
      setFade(false);
      send({ type: "jump", door: id });
    },
    [send],
  );

  const select = useCallback(
    (id: string) => {
      if (stateRef.current.phase !== "closed" || !isDoor(id)) return;
      history.pushState({ door: id }, "", hashFor(id));
      const reduced = prefersReducedMotion();
      setFade(reduced);
      send({ type: "select", door: id });
      const stage = stageRef.current;
      const scroll = stage ? scrollIntoStage(stage) : null;
      if (reduced) {
        // Sem rolagem animada; o esmaecer começa quando a sala estiver na tela.
        scroll?.progress(1);
        return;
      }
      const start = () => {
        if (stateRef.current.phase !== "entering") return;
        scrollRef.current = null;
        const els = sceneRef.current?.getEls(id);
        const rects = sceneRef.current?.getRects(id);
        if (!els || !rects) {
          arrive();
          return;
        }
        const tl = enterTimeline(els, cameraTarget(rects.stage, rects.reveal, PERSPECTIVE), arrive);
        tlRef.current = tl;
        tl.play();
      };
      if (scroll) {
        scrollRef.current = scroll;
        scroll.eventCallback("onComplete", start);
      } else {
        start();
      }
    },
    [arrive, send],
  );

  // Começa a volta a partir de onde a cena estiver.
  const goBack = useCallback(() => {
    const s = stateRef.current;
    if (leavingRef.current || (s.phase !== "entering" && s.phase !== "open")) return;
    leavingRef.current = true;
    if (s.phase === "entering") {
      scrollRef.current?.kill();
      scrollRef.current = null;
      const tl = tlRef.current;
      send({ type: "back" });
      if (tl && tl.progress() > 0) {
        tl.eventCallback("onReverseComplete", finishLeft);
        tl.reverse();
      } else {
        tl?.kill();
        finishLeft();
      }
      return;
    }
    // Sala aberta: primeiro volta ao topo dela, onde o palco está escondido.
    const reduced = prefersReducedMotion();
    const leave = () => {
      scrollRef.current = null;
      setFade(reduced);
      send({ type: "back" });
    };
    const stage = stageRef.current;
    const scroll = stage ? scrollIntoStage(stage) : null;
    if (scroll && !reduced) {
      scrollRef.current = scroll;
      scroll.eventCallback("onComplete", leave);
    } else {
      scroll?.progress(1);
      leave();
    }
  }, [finishLeft, send]);

  // Voltar pela interface (botões ou Esc). Com entrada no histórico, ela sai
  // também; o popstate que vem depois encontra a volta já em curso.
  const backFromUi = useCallback(() => {
    const s = stateRef.current;
    if (leavingRef.current || (s.phase !== "entering" && s.phase !== "open")) return;
    const pushed = isDoor((history.state as { door?: unknown } | null)?.door);
    goBack();
    if (pushed) history.back();
    else history.replaceState(null, "", location.pathname + location.search);
  }, [goBack]);

  // Link direto: a sala já aberta, sem entrada nem histórico novo.
  useLayoutEffect(() => {
    const id = doorFromHash(location.hash, DOORS);
    if (isDoor(id)) jump(id);
  }, [jump]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      // A tela cheia do tabuleiro tem prioridade sobre o Esc.
      if (document.querySelector("dialog[open]")) return;
      backFromUi();
    };
    const onPopState = (e: PopStateEvent) => {
      const s = stateRef.current;
      if (s.phase === "entering" || s.phase === "open") {
        goBack();
        return;
      }
      const id = (e.state as { door?: unknown } | null)?.door;
      if (s.phase === "closed" && isDoor(id) && location.hash === hashFor(id)) jump(id);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, [backFromUi, goBack, jump]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
      scrollRef.current?.kill();
    },
    [],
  );

  const door = state.phase !== "closed" && isDoor(state.door) ? state.door : null;
  const roomShown = door !== null && (state.phase === "open" || fade);
  const busy = state.phase === "entering" || state.phase === "leaving";

  // `inert` direto no DOM: o React 18 (testes) e o 19 do Next (site) tratam a
  // prop de jeitos diferentes, e no 19 `inert=""` some. Vem antes do efeito de
  // fase, que devolve o foco a uma porta desta cena.
  useLayoutEffect(() => {
    sceneWrapRef.current?.toggleAttribute("inert", roomShown);
  }, [roomShown]);

  // Efeitos de cada mudança de fase, antes da pintura: a troca entre a cena e
  // a sala acontece no mesmo quadro.
  useLayoutEffect(() => {
    const from = prevPhase.current;
    const to = state.phase;
    prevPhase.current = to;
    if (from === to) return;
    const scene = sceneRef.current;
    const stage = stageRef.current;

    if (to === "entering" && fade && door) {
      focusDoorRef.current = door;
      const room = roomRef.current;
      if (!room) return arrive();
      const tl = fadeTimeline(room, "in", arrive);
      if (stateRef.current.phase === "entering") tlRef.current = tl;
      return;
    }

    if (to === "entering" && door) {
      focusDoorRef.current = door;
      return;
    }

    if (to === "open" && door) {
      focusDoorRef.current = door;
      if (jumpedRef.current) {
        jumpedRef.current = false;
        // Com movimento reduzido a volta é só o esmaecer: a cena fica em repouso.
        const els = scene?.getEls(door);
        const rects = scene?.getRects(door);
        if (els && rects && !prefersReducedMotion()) {
          arrivedState(els, cameraTarget(rects.stage, rects.reveal, PERSPECTIVE));
        }
        if (stage) scrollIntoStage(stage)?.progress(1);
      }
      headingRef.current?.focus({ preventScroll: true });
      return;
    }

    if (to === "leaving" && from === "open" && door) {
      if (fade) {
        const room = roomRef.current;
        if (!room) return finishLeft();
        const tl = fadeTimeline(room, "out", finishLeft);
        if (stateRef.current.phase === "leaving") tlRef.current = tl;
        return;
      }
      // A cena acabou de voltar para a tela: remonta o quadro de chegada com o
      // alvo medido agora (a janela pode ter mudado com a sala aberta), sem
      // eventos e antes da pintura, e toca ao contrário.
      const els = scene?.getEls(door);
      const rects = scene?.getRects(door);
      if (!els || !rects) return finishLeft();
      const tl = enterTimeline(els, cameraTarget(rects.stage, rects.reveal, PERSPECTIVE), () => {});
      tl.progress(1, true);
      tlRef.current = tl;
      tl.eventCallback("onReverseComplete", finishLeft);
      tl.reverse();
      return;
    }

    if (to === "closed") {
      const id = focusDoorRef.current;
      focusDoorRef.current = null;
      // A volta por esmaecer não desfaz câmera nem folhas que uma entrada ou
      // `arrivedState` tenham deixado na cena: volta ela ao repouso.
      const els = fade && id ? scene?.getEls(id) : null;
      if (els) restState(els);
      if (id) scene?.focusDoor(id);
    }
  }, [state.phase, door, fade, arrive, finishLeft]);

  const wallDoors: WallDoor[] = DOORS.map((id, index) => ({
    id,
    index,
    name: c.doors[id].name,
    teaser: c.doors[id].teaser,
  }));

  return (
    // data-door-busy congela a Cortina deste capítulo durante a entrada e a saída.
    <div className="s-portas" data-door-busy={busy || undefined}>
      {roomShown && door && (
        <div ref={roomRef}>
          <DoorRoom
            door={door}
            index={DOORS.indexOf(door)}
            lang={lang}
            headingRef={headingRef}
            onBack={backFromUi}
          />
        </div>
      )}
      <div ref={sceneWrapRef} style={roomShown ? HIDDEN_SCENE : undefined}>
        <DoorWall
          doors={wallDoors}
          activeId={door}
          busy={busy}
          onSelect={select}
          lang={lang}
          stageRef={stageRef}
          sceneRef={sceneRef}
        />
      </div>
    </div>
  );
}
