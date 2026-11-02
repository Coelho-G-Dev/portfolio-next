"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { approach, charReducer, initialChar, NEUTRAL, type CharState, type Reaction } from "@/lib/character";
import { heroManifest as manifest, heroUrl as url } from "./heroAssets";
import { useSiteCopy } from "./SiteCopyContext";

// Personagem 3D do hero (spec §5.2). Interativo: responde com scrub ao cursor
// e com reações vivas em 3 vídeos ao clique, alternando falas e animações.
const CLICKS = (["clique-1", "clique-2", "clique-3"] as const).filter((k) => manifest.reactions[k]);
const REACTIONS = (["hover", ...CLICKS] as Reaction[]).map((k) => [k, manifest.reactions[k] as string] as const);

function reactionFile(state: Extract<CharState, { phase: "reaction" }>): string {
  if (state.clip === "hover") return manifest.reactions.hover as string;
  const own = manifest.reactions[state.clip];
  if (own) return own;
  return manifest.reactions[CLICKS[(state.clicks - 1) % CLICKS.length]] as string;
}

type Mode = "pending" | "reduced" | "desktop" | "touch";

const FRAME = 1 / 24;

export default function Character({ paused }: { paused: boolean }) {
  const copy = useSiteCopy();
  const quotes = copy.hero.quotes;

  const [state, dispatch] = useReducer(charReducer, initialChar);
  const [mode, setMode] = useState<Mode>("pending");
  const [lazy, setLazy] = useState(false);
  const [eager, setEager] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const play = (el: HTMLVideoElement) => {
    const p = el.play();
    if (!p || typeof p.catch !== "function") return;
    p.catch((err: unknown) => {
      if ((err as { name?: string })?.name === "AbortError") return;
      fail(err);
    });
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setMode("reduced");
    else if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setMode("desktop");
    else setMode("touch");
  }, []);

  useEffect(() => {
    if (mode === "desktop" || mode === "touch") setEager(true);
  }, [mode]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

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

  // Toca o vídeo ativo e pausa qualquer outro que estivesse em execução
  useEffect(() => {
    if (!live || failed) return;
    const el = elementFor(activeKey);
    if (!el || !el.getAttribute("src")) return;
    if (!running) {
      el.pause();
      return;
    }

    // Pausa outros clipes de reação para garantir troca limpa
    reactionRefs.current.forEach((videoEl, file) => {
      if (file !== activeKey && !videoEl.paused) {
        videoEl.pause();
      }
    });

    if (state.phase === "intro" || state.phase === "reaction") {
      if (state.phase === "reaction") {
        el.currentTime = 0;
      }
      play(el);
    } else if (mode === "touch") {
      el.loop = true;
      play(el);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, running, eager, lazy]);

  // Balão de diálogo acionado a cada clique
  useEffect(() => {
    if (state.phase === "reaction" && state.clip.startsWith("clique")) {
      setBubbleVisible(true);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => {
        setBubbleVisible(false);
      }, 4000);
    }
    return () => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, [state]);

  const onEnded = (key: string) => () => {
    if (key === "entrada" && stateRef.current.phase === "intro") dispatch({ type: "introEnded" });
    else if (stateRef.current.phase === "reaction") dispatch({ type: "reactionEnded" });
  };

  useEffect(() => {
    if (mode !== "desktop") return;
    const onMove = (e: PointerEvent) => dispatch({ type: "pointer", x: e.clientX / window.innerWidth });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mode]);

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

  const onPointerEnter = () => {
    if (mode !== "desktop") return;
    setLazy(true);
    dispatch({ type: "hover" });
  };

  const triggerClick = () => {
    if (!live || failed) return;
    setLazy(true);
    dispatch({ type: "click" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerClick();
    }
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

  const currentQuote = quotes && state.clicks > 0
    ? quotes[(state.clicks - 1) % quotes.length]
    : null;

  return (
    <div
      className="s-char"
      role="button"
      tabIndex={0}
      aria-label="Gabriel Coelho (clique para interagir)"
      data-mode={mode}
      style={{ backgroundColor: manifest.bg }}
      onPointerEnter={onPointerEnter}
      onClick={triggerClick}
      onKeyDown={onKeyDown}
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
          {mode === "desktop" ? (
            <video
              ref={olharRef}
              {...videoProps("olhar", eager ? url(manifest.olhar) : null)}
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

      {/* Balão de fala interativo com falas técnicas */}
      {currentQuote && bubbleVisible && (
        <div className="s-char__bubble" role="status" aria-live="polite">
          <span className="s-char__bubble-dot" aria-hidden="true" />
          <p className="s-char__bubble-text">{currentQuote}</p>
        </div>
      )}
    </div>
  );
}
