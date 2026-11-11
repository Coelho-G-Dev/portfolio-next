"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { aimFrom, CENTER_AIM, charReducer, eyesOnScreen, gazeStep, initialChar, loopNeutral, NEUTRAL, spring, type Aim, type Axis, type Gaze, type CharState, type Point, type Reaction } from "@/lib/character";
import { heroManifest as manifest, heroUrl as url } from "./heroAssets";
import { verticalOf } from "@/lib/heroManifest";
import { frameForPos, frameFromMediaTime, frameTime } from "@/lib/gazeCurve";
import { atFrame, initialSeek, seekReduce, type SeekEvent, type SeekState } from "@/lib/videoSeeker";
import { useSiteCopy } from "./SiteCopyContext";

// Personagem 3D do hero (spec §5.2). Interativo: responde com scrub ao cursor
// e com reações vivas em 3 vídeos ao clique, alternando falas e animações.
// object-position do vídeo em fração ("68% 50%" → 0,68 e 0,5). Sem
// porcentagem legível, usa o centro, o padrão do CSS.
function objectPositionOf(el: HTMLElement | null): Point {
  const parts = el ? getComputedStyle(el).objectPosition.trim().split(/\s+/) : [];
  const pct = (v: string | undefined) => (v && /^-?[\d.]+%$/.test(v) ? parseFloat(v) / 100 : 0.5);
  return { x: pct(parts[0]), y: pct(parts[1] ?? parts[0]) };
}

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
const PRESENT_TIMEOUT_MS = 250;

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
  const [axis, setAxis] = useState<Axis>("h");
  const [verticalFailed, setVerticalFailed] = useState(false);

  const charRef = useRef<HTMLDivElement>(null);
  const entradaRef = useRef<HTMLVideoElement>(null);
  const olharRef = useRef<HTMLVideoElement>(null);
  const olharVRef = useRef<HTMLVideoElement>(null);
  // Posição do cursor na janela, em px; null até o primeiro movimento.
  const cursorRef = useRef<Point | null>(null);
  const gazeRef = useRef<Gaze>({ axis: "h", pos: NEUTRAL, vel: 0 });
  const loopCenterRef = useRef<{ pos: number; vel: number; target: number } | null>(null);
  const seekers = useRef<Record<Axis, { state: SeekState; settledAt: number | null }>>({
    h: { state: { ...initialSeek }, settledAt: null }, v: { state: { ...initialSeek }, settledAt: null },
  });
  const vertical = verticalFailed ? null : verticalOf(manifest);
  const loopRef = useRef<HTMLVideoElement>(null);
  const lastPlayingRef = useRef<HTMLVideoElement | null>(null);
  const reactionRefs = useRef(new Map<string, HTMLVideoElement>());
  const stateRef = useRef(state);
  stateRef.current = state;

  const live = mode === "desktop" || mode === "touch";
  const running = live && !failed && !paused && !hidden;

  const scrubVideo = (a: Axis) => a === "h" ? olharRef.current : olharVRef.current;
  const neutralOf = (a: Axis) => a === "h" ? manifest.olharNeutral : vertical?.neutral ?? 42;
  const sendSeek = (a: Axis, event: SeekEvent) => {
    const entry = seekers.current[a];
    const result = seekReduce(entry.state, event);
    entry.state = result.state;
    if (result.seekTo !== null) {
      entry.settledAt = null;
      const el = scrubVideo(a);
      if (el) el.currentTime = frameTime(result.seekTo);
    }
  };
  const wantFrame = (a: Axis, k: number) => {
    const el = scrubVideo(a);
    if (el && el.duration > 0) sendSeek(a, { type: "want", k });
  };
  const onScrubSeeked = (a: Axis) => {
    const entry = seekers.current[a];
    const finished = entry.state.requested;
    sendSeek(a, { type: "seeked" });
    if (!entry.state.inFlight) entry.settledAt = performance.now();
    if (!scrubVideo(a)?.requestVideoFrameCallback && finished !== null) sendSeek(a, { type: "presented", k: finished });
  };

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
          ? axis === "v" && !verticalFailed ? "olhar-v" : "olhar"
          : "loop";

  const elementFor = (key: string): HTMLVideoElement | null => {
    if (key === "entrada") return entradaRef.current;
    if (key === "olhar") return olharRef.current;
    if (key === "olhar-v") return olharVRef.current;
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

    // Nenhum vídeo escondido deve continuar tocando ou emitir um ended tardio.
    [entradaRef.current, olharRef.current, olharVRef.current, loopRef.current, ...reactionRefs.current.values()].forEach((videoEl) => {
      if (videoEl && videoEl !== el && !videoEl.paused) {
        videoEl.pause();
      }
    });
    // Toda reação escondida volta ao quadro 0. Parada
    // no meio, ela reapareceria nessa pose até o seek do próximo início acabar.
    reactionRefs.current.forEach((videoEl) => {
      if (videoEl !== el && videoEl.currentTime > 0) videoEl.currentTime = 0;
    });

    if (state.phase === "intro" || state.phase === "reaction") {
      if (state.phase === "reaction" && lastPlayingRef.current !== el) {
        el.currentTime = 0;
      }
      play(el);
    } else if (mode === "touch" && state.phase !== "centering") {
      loopCenterRef.current = null;
      el.loop = true;
      play(el);
    }
    lastPlayingRef.current = el;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, running, eager, lazy, state.phase]);

  // Balão de diálogo acionado a cada clique
  useEffect(() => {
    if (state.clicks === 0) return;
    setBubbleVisible(true);
    const timer = setTimeout(() => setBubbleVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [state.clicks]);

  const onEnded = (key: string) => () => {
    const current = stateRef.current;
    if (key === "entrada" && current.phase === "intro") dispatch({ type: "introEnded" });
    else if (current.phase === "reaction" && key === reactionFile(current)) dispatch({ type: "reactionEnded" });
  };

  // O cursor escolhe poses dos vídeos; o plano e o corpo não são inclinados.
  useEffect(() => {
    if (mode !== "desktop") return;
    const onMove = (e: PointerEvent) => {
      const x = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      cursorRef.current = { x: e.clientX, y: e.clientY };
      dispatch({ type: "pointer", x });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mode]);

  useEffect(() => {
    if (mode !== "desktop" || !running) return;
    let stopped = false;
    const callbacks: { el: HTMLVideoElement; id: number }[] = [];
    for (const a of ["h", "v"] as const) {
      const el = scrubVideo(a);
      if (!el?.requestVideoFrameCallback) continue;
      const token = { el, id: 0 };
      const presented: VideoFrameRequestCallback = (_now, meta) => {
        if (stopped) return;
        sendSeek(a, { type: "presented", k: frameFromMediaTime(meta.mediaTime) });
        token.id = el.requestVideoFrameCallback(presented);
      };
      token.id = el.requestVideoFrameCallback(presented);
      callbacks.push(token);
    }
    return () => { stopped = true; callbacks.forEach(({ el, id }) => el.cancelVideoFrameCallback(id)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, running, verticalFailed]);

  useEffect(() => {
    if (mode !== "desktop" || !running) return;
    let last = performance.now();
    let frame = 0;
    const decodedAt = (a: Axis, k: number) => {
      const el = scrubVideo(a), s = seekers.current[a].state;
      return !!el && el.readyState >= 2 && !el.seeking && !s.inFlight && s.pending === null && s.requested === k;
    };
    const presentedAt = (a: Axis, k: number, now: number) => {
      const entry = seekers.current[a];
      if (atFrame(entry.state, k)) return true;
      if (decodedAt(a, k) && entry.settledAt !== null && now - entry.settledAt >= PRESENT_TIMEOUT_MS) {
        sendSeek(a, { type: "presented", k });
        return true;
      }
      return false;
    };
    // Medido a cada quadro: a rolagem e o redimensionamento movem os olhos
    // mesmo com o cursor parado.
    const aimNow = (): Aim => {
      const cursor = cursorRef.current;
      if (!cursor) return CENTER_AIM;
      const box = charRef.current?.getBoundingClientRect();
      const view = { width: window.innerWidth, height: window.innerHeight };
      const eyes = box && box.width > 0 && box.height > 0
        ? eyesOnScreen(box, manifest, objectPositionOf(olharRef.current))
        : { x: view.width / 2, y: view.height / 2 };
      return aimFrom(cursor.x, cursor.y, eyes, view);
    };
    const seekPosition = (a: Axis, pos: number) => {
      if (a === "h") wantFrame(a, frameForPos(pos, manifest.olharFrames, manifest.olharNeutral));
      else if (vertical) wantFrame(a, frameForPos(pos, vertical.frames, vertical.neutral, vertical.curve));
    };
    const tick = (now: number) => {
      const s = stateRef.current;
      const dt = Math.min(now - last, 64);
      last = now;
      // Um tick anterior ao commit do erro pode ter recolocado o eixo V.
      // Sem esse vídeo, não há apresentação neutra para aguardar na troca.
      if (gazeRef.current.axis === "v" && !vertical) {
        gazeRef.current = { axis: "h", pos: NEUTRAL, vel: 0 };
        setAxis("h");
      }
      const current = gazeRef.current;
      if (s.phase === "scrub" || s.phase === "centering") {
        const target = s.phase === "centering" ? CENTER_AIM : aimNow();
        // readyState pode cair a HAVE_METADATA durante cada seek. Isso não
        // invalida o eixo: a disponibilidade dura até um erro do clipe.
        const vReady = !!vertical && !!olharVRef.current && olharVRef.current.duration > 0;
        let next = gazeStep(current, target, dt, vReady, s.phase === "centering");
        if (next.axis !== current.axis) {
          // Só troca depois de os dois vídeos terem de fato decodificado a
          // pose neutra, não apenas quando a posição lógica chegou nela.
          wantFrame(current.axis, neutralOf(current.axis));
          wantFrame(next.axis, neutralOf(next.axis));
          const oldReady = presentedAt(current.axis, neutralOf(current.axis), now);
          const newReady = decodedAt(next.axis, neutralOf(next.axis));
          if (oldReady && newReady) setAxis(next.axis);
          else next = { axis: current.axis, pos: NEUTRAL, vel: 0 };
        }
        gazeRef.current = next;
        const inactive = next.axis === "h" ? "v" : "h";
        if (inactive === "h" || vertical) wantFrame(inactive, neutralOf(inactive));
        if (s.phase === "centering" && Math.abs(next.pos - NEUTRAL) < 0.01) {
          gazeRef.current = { ...next, pos: NEUTRAL, vel: 0 };
          wantFrame(next.axis, neutralOf(next.axis));
          if (presentedAt(next.axis, neutralOf(next.axis), now)) dispatch({ type: "centered" });
        } else {
          seekPosition(next.axis, next.pos);
        }
      } else {
        // As reações começam e terminam na neutra. Ao retornar ao scrub não
        // reaparece uma pose antiga deixada escondida sob o vídeo da reação.
        gazeRef.current = { axis: current.axis, pos: NEUTRAL, vel: 0 };
        wantFrame("h", manifest.olharNeutral);
        if (vertical) wantFrame("v", vertical.neutral);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, running, verticalFailed]);

  useEffect(() => {
    if (mode !== "touch" || state.phase !== "centering" || !running) return;
    const el = loopRef.current;
    if (!el) return;
    el.pause();
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      if (!(el.duration > 0)) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!loopCenterRef.current) {
        const pos = el.currentTime / FRAME;
        loopCenterRef.current = { pos, vel: 0, target: loopNeutral(pos, Math.round(el.duration / FRAME)) };
      }
      const current = loopCenterRef.current;
      const next = spring(current.pos, current.vel, current.target, dt, 34);
      loopCenterRef.current = { ...next, target: current.target };
      const arrived = Math.abs(next.pos - current.target) < 1;
      const k = arrived ? current.target : Math.round(next.pos);
      // Uma escrita por seek; depois espera a decodificação da neutra visível.
      if (!el.seeking && el.readyState >= 2) {
        if (Math.floor(el.currentTime / FRAME) !== k) el.currentTime = frameTime(k);
        else if (arrived) {
          dispatch({ type: "centered" });
          return;
        }
      }
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
      ref={charRef}
      className="s-char"
      role="button"
      tabIndex={0}
      aria-label={copy.hero.characterAria}
      data-mode={mode}
      style={{ backgroundColor: manifest.bg }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => dispatch({ type: "leave" })}
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
            <>
            <video
              ref={olharRef}
              {...videoProps("olhar", eager ? url(manifest.olhar) : null)}
              onLoadedMetadata={() => wantFrame("h", manifest.olharNeutral)}
              onSeeked={() => onScrubSeeked("h")}
            />
            {vertical && (
              <video
                ref={olharVRef}
                {...videoProps("olhar-v", lazy ? url(vertical.file) : null)}
                onLoadedMetadata={() => wantFrame("v", vertical.neutral)}
                onSeeked={() => onScrubSeeked("v")}
                onError={() => {
                  sendSeek("v", { type: "reset" });
                  wantFrame("h", manifest.olharNeutral);
                  gazeRef.current = { axis: "h", pos: NEUTRAL };
                  setAxis("h");
                  setVerticalFailed(true);
                }}
              />
            )}
            </>
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
