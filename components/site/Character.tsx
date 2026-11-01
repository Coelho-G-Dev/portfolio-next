"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import { approach, charReducer, initialChar, NEUTRAL, type CharState, type Reaction } from "@/lib/character";
import { heroManifest as manifest, heroUrl as url } from "./heroAssets";

// Personagem 3D do hero (spec §5.2). Decorativo: aria-hidden, e nada depende
// de clicar nele. O poster fica sempre por baixo; os vídeos se sobrepõem com
// opacidade e, se qualquer um falhar, o personagem fica no poster.

const CLICKS = (["clique-1", "clique-2", "clique-3"] as const).filter((k) => manifest.reactions[k]);
const REACTIONS = (["hover", ...CLICKS] as Reaction[]).map((k) => [k, manifest.reactions[k] as string] as const);

// Um clique pendente cujo clipe ainda não existe usa os disponíveis em rodízio.
function reactionFile(state: Extract<CharState, { phase: "reaction" }>): string {
  if (state.clip === "hover") return manifest.reactions.hover as string;
  const own = manifest.reactions[state.clip];
  if (own) return own;
  return manifest.reactions[CLICKS[(state.clicks - 1) % CLICKS.length]] as string;
}

type Mode = "pending" | "reduced" | "desktop" | "touch";

const FRAME = 1 / 24;

export default function Character({ paused }: { paused: boolean }) {
  const [state, dispatch] = useReducer(charReducer, initialChar);
  const [mode, setMode] = useState<Mode>("pending");
  const [lazy, setLazy] = useState(false);
  // O src dos vídeos imediatos entra num segundo render: medido no Chrome, um
  // <video> que já nasce com src pelo React baixa o arquivo duas vezes.
  const [eager, setEager] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hidden, setHidden] = useState(false);

  const entradaRef = useRef<HTMLVideoElement>(null);
  const olharRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const reactionRefs = useRef(new Map<string, HTMLVideoElement>());
  const stateRef = useRef(state);
  stateRef.current = state;

  const live = mode === "desktop" || mode === "touch";
  const running = live && !failed && !paused && !hidden;

  const fail = (why: unknown) => {
    console.debug("[hero] personagem fica no poster:", why);
    setFailed(true);
  };

  // AbortError só significa que pausamos antes do play() resolver (rolagem,
  // aba oculta, troca de clipe): não é falha. Autoplay bloqueado é.
  const play = (el: HTMLVideoElement) => {
    const p = el.play();
    // Navegadores antigos (e o jsdom) não devolvem Promise.
    if (!p || typeof p.catch !== "function") return;
    p.catch((err: unknown) => {
      if ((err as { name?: string })?.name === "AbortError") return;
      fail(err);
    });
  };

  // Modo: movimento reduzido → só o poster; mouse fino → scrub; toque → vaivém.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setMode("reduced");
    else if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setMode("desktop");
    else setMode("touch");
  }, []);

  useEffect(() => {
    if (mode === "desktop" || mode === "touch") setEager(true);
  }, [mode]);

  // Aba oculta pausa tudo.
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // As reações só carregam depois da página (ou na primeira interação).
  useEffect(() => {
    if (!live) return;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setLazy(true));
      else timer = setTimeout(() => setLazy(true), 1000);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer) clearTimeout(timer);
    };
  }, [live]);

  // Qual vídeo está à vista. O elemento é resolvido dentro dos efeitos, quando
  // as refs já existem.
  const activeKey = !live || failed
    ? "poster"
    : state.phase === "intro"
      ? "entrada"
      : state.phase === "reaction"
        ? reactionFile(state)
        : mode === "desktop"
          ? "olhar"
          : "loop";

  const elementFor = (key: string): HTMLVideoElement | null => {
    if (key === "entrada") return entradaRef.current;
    if (key === "olhar") return olharRef.current;
    if (key === "loop") return loopRef.current;
    return reactionRefs.current.get(key) ?? null;
  };

  // Toca o vídeo ativo (ou pausa quando não deve rodar).
  useEffect(() => {
    if (!live || failed) return;
    const el = elementFor(activeKey);
    // Sem src ainda (vídeo imediato ou reação a carregar): espera o próximo render.
    if (!el || !el.getAttribute("src")) return;
    if (!running) {
      el.pause();
      return;
    }
    if (state.phase === "intro" || state.phase === "reaction") {
      if (state.phase === "reaction") el.currentTime = 0;
      play(el);
    } else if (mode === "touch") {
      el.loop = true;
      play(el);
    }
    // No desktop, o Olhar não toca: o scrub move currentTime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, running, eager, lazy]);

  // Fim da Entrada e das reações.
  const onEnded = (key: string) => () => {
    if (key === "entrada" && stateRef.current.phase === "intro") dispatch({ type: "introEnded" });
    else if (stateRef.current.phase === "reaction") dispatch({ type: "reactionEnded" });
  };

  // Desktop: o cursor na horizontal define o alvo.
  useEffect(() => {
    if (mode !== "desktop") return;
    const onMove = (e: PointerEvent) => dispatch({ type: "pointer", x: e.clientX / window.innerWidth });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mode]);

  // Desktop: scrub suave do Olhar, sem pedir novo salto antes do anterior.
  useEffect(() => {
    if (mode !== "desktop" || !running) return;
    const el = olharRef.current;
    if (!el) return;
    let pos = NEUTRAL;
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const s = stateRef.current;
      const dt = now - last;
      last = now;
      if ((s.phase === "scrub" || s.phase === "centering") && el.duration > 0) {
        const goal = s.phase === "centering" ? NEUTRAL : s.target;
        pos = approach(pos, goal, dt);
        if (s.phase === "centering" && Math.abs(pos - NEUTRAL) < 0.01) {
          // Só reage com o quadro neutro já na tela: espera o seek terminar.
          pos = NEUTRAL;
          const neutralTime = NEUTRAL * el.duration;
          if (!el.seeking) {
            if (Math.abs(el.currentTime - neutralTime) > FRAME / 2) el.currentTime = neutralTime;
            else dispatch({ type: "centered" });
          }
        } else if (!el.seeking && Math.abs(el.currentTime - pos * el.duration) > FRAME / 2) {
          el.currentTime = pos * el.duration;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode, running]);

  // Toque: espera o vaivém passar pela pose neutra (0 ou metade) e só então reage.
  useEffect(() => {
    if (mode !== "touch" || state.phase !== "centering" || !running) return;
    const el = loopRef.current;
    if (!el) return;
    let prev = el.currentTime;
    let frame = 0;
    const tick = () => {
      if (!(el.duration > 0)) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const t = el.currentTime;
      const half = el.duration / 2;
      const wrapped = t < prev;
      const crossedHalf = prev < half && t >= half;
      const nearNeutral = t < FRAME || Math.abs(t - half) < FRAME;
      if (wrapped || crossedHalf || nearNeutral) {
        el.pause();
        dispatch({ type: "centered" });
        return;
      }
      prev = t;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode, state.phase, running]);

  // A primeira interação também libera o carregamento das reações, para um
  // clique antes do fim do carregamento não tocar um vídeo sem src.
  const onPointerEnter = () => {
    if (mode !== "desktop") return;
    setLazy(true);
    dispatch({ type: "hover" });
  };
  const onClick = () => {
    if (!live || failed) return;
    setLazy(true);
    dispatch({ type: "click" });
  };

  const videoProps = (key: string, src: string | null) => ({
    className: "s-char__video",
    "data-clip": key.replace(/\.mp4$/, ""),
    "data-active": activeKey === key || undefined,
    src: src ?? undefined,
    muted: true,
    playsInline: true,
    preload: src ? "auto" : "none",
    disablePictureInPicture: true,
    onError: src ? fail : undefined,
    onEnded: onEnded(key),
  });

  return (
    <div
      className="s-char"
      aria-hidden="true"
      data-mode={mode}
      style={{ backgroundColor: manifest.bg }}
      onPointerEnter={onPointerEnter}
      onClick={onClick}
    >
      <Image
        className="s-char__poster"
        src={url(manifest.poster)}
        alt=""
        fill
        priority
        sizes="(max-width: 899px) 100vw, 60vw"
      />
      {live && !failed && (
        <>
          <video ref={entradaRef} {...videoProps("entrada", eager ? url(manifest.entrada) : null)} />
          {/* Cada modo usa só um dos dois: o Olhar (scrub) ou o vaivém (toque). */}
          {mode === "desktop" ? (
            <video
              ref={olharRef}
              {...videoProps("olhar", eager ? url(manifest.olhar) : null)}
              // Já espera na pose neutra (meio do clipe): a troca da Entrada
              // para o Olhar não pode mostrar a cabeça virada.
              onLoadedMetadata={(e) => {
                e.currentTarget.currentTime = NEUTRAL * e.currentTarget.duration;
              }}
            />
          ) : (
            <video ref={loopRef} {...videoProps("loop", eager ? url(manifest.olharLoop) : null)} />
          )}
          {REACTIONS.map(([key, file]) => (
            <video
              key={key}
              ref={(el) => {
                if (el) reactionRefs.current.set(file, el);
                else reactionRefs.current.delete(file);
              }}
              {...videoProps(file, lazy ? url(file) : null)}
            />
          ))}
        </>
      )}
    </div>
  );
}
