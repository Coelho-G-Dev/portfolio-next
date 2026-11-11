"use client";

import gsap from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { useEffect, type RefObject } from "react";
import { DIA600 } from "@/data/dia600";
import { dia600Frame } from "@/lib/dia600";
import { CORTINA_RELAYOUT, loadScrollTrigger } from "@/lib/scrollTrigger";
import { fromKeyboard } from "../cortinaFocus";
import { flowTop } from "../flowTop";

const ON = "data-dia600-on";
// Enquanto ligado, o trecho cuida da rolagem do foco (cortinaFocus o pula).
const OWN_FOCUS = "data-own-focus";
// Frase ativa (no invólucro, para o link da ponte) e estados "no ar".
const LINE = "data-line";
const UP = "data-up";
// Progresso para onde o foco no link da ponte leva: a última frase e os nomes
// do código já estão na tela.
const BRIDGE_AT = 0.97;
const COLUMNS = 5;
// Desfoque máximo da troca de nomes, em px.
const BLUR = 6;
// Folga do palco (padding de cima e de baixo) na altura da janela.
const ROOM = 32;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

// Troca só o texto, sem trocar o nó de texto que o React guarda.
function setText(el: HTMLElement | null, text: string) {
  if (!el) return;
  const node = el.firstChild;
  if (node && node.nodeType === Node.TEXT_NODE) {
    if (node.nodeValue !== text) node.nodeValue = text;
  } else el.textContent = text;
}

// Troca de nomes: quem sai desfoca e some, quem entra faz o contrário.
function crossfade(el: HTMLElement, shown: number) {
  el.style.opacity = shown.toFixed(3);
  if (shown > 0 && shown < 1) el.style.filter = `blur(${((1 - shown) * BLUR).toFixed(2)}px)`;
  else el.style.removeProperty("filter");
}

function startDia600(el: HTMLElement, ScrollTrigger: typeof ScrollTriggerType): () => void {
  const inner = el.querySelector<HTMLElement>("[data-dia600-inner]");
  const tons = el.querySelector<HTMLElement>("[data-dia600-tons]");
  const trucks = el.querySelector<HTMLElement>("[data-dia600-trucks]");
  const track = el.querySelector<HTMLElement>("[data-dia600-track]");
  const bridge = el.querySelector<HTMLElement>("[data-dia600-bridge]");
  const chips = Array.from(el.querySelectorAll<HTMLElement>("[data-dia600-chip]"));
  const logs = Array.from(el.querySelectorAll<HTMLElement>("[data-dia600-log]"));
  const codes = Array.from(el.querySelectorAll<HTMLElement>("[data-dia600-code]"));
  const lines = Array.from(el.querySelectorAll<HTMLElement>("[data-dia600-line]"));
  if (!inner || !track) return () => {};

  let on = false;
  const state = { p: 0 };
  // Trilho: comprimento de uma coluna e direção (no celular, as caixas ficam
  // em linhas e as fichas descem).
  let step = 0;
  let vertical = false;
  let lastLine = -1;

  const measure = () => {
    vertical = track.clientHeight > track.clientWidth;
    step = (vertical ? track.clientHeight : track.clientWidth) / COLUMNS;
  };

  const clear = () => {
    setText(tons, `${DIA600.peakTons} t`);
    setText(trucks, String(DIA600.trucks));
    for (const chip of chips) {
      chip.style.removeProperty("transform");
      chip.style.removeProperty("opacity");
    }
    for (const n of [...logs, ...codes]) {
      n.style.removeProperty("opacity");
      n.style.removeProperty("filter");
    }
    for (const line of lines) line.removeAttribute("data-on");
    el.removeAttribute(LINE);
    el.removeAttribute(UP);
    lastLine = -1;
  };

  const apply = () => {
    if (!on) return;
    const f = dia600Frame(state.p);
    setText(tons, `${f.tons} t`);
    setText(trucks, String(f.trucks));
    chips.forEach((chip, k) => {
      const c = f.chips[k];
      const along = Math.min(COLUMNS, Math.max(0, c.pos)) * step;
      const across = -(k % 3) * 4;
      // Centrada na posição: −50% é metade da largura (ou altura) da ficha.
      chip.style.transform = vertical
        ? `translate3d(${across}px, calc(${along.toFixed(1)}px - 50%), 0)`
        : `translate3d(calc(${along.toFixed(1)}px - 50%), ${across}px, 0)`;
      chip.style.opacity = c.visible ? clamp01(Math.min(c.pos, COLUMNS - c.pos) * 2).toFixed(3) : "0";
    });
    logs.forEach((n) => crossfade(n, 1 - f.morph));
    codes.forEach((n) => crossfade(n, f.morph));
    el.toggleAttribute(UP, f.morph > 0.5);
    if (f.line !== lastLine) {
      lastLine = f.line;
      lines.forEach((line, i) => line.toggleAttribute("data-on", i === f.line));
      el.setAttribute(LINE, String(f.line));
    }
  };

  // Só liga se a cena cabe na janela: presa, a parte de baixo nunca apareceria.
  const fits = () => {
    const had = el.hasAttribute(ON);
    el.setAttribute(ON, "");
    const ok = inner.offsetHeight <= window.innerHeight - ROOM;
    if (!had) el.removeAttribute(ON);
    return ok;
  };

  // O capítulo do Sobre gruda pela base e pode estar grudado num refresh:
  // mede em fluxo. O refresh lê start antes de end.
  let top = 0;
  const progress = gsap.to(state, {
    p: 1,
    ease: "none",
    scrollTrigger: {
      start: () => (top = flowTop(el)),
      end: () => top + Math.max(1, el.offsetHeight - window.innerHeight),
      scrub: 0.3,
    },
    onUpdate: apply,
  });

  // Depois de medir, a cena vai direto ao progresso de agora (um refresh
  // interrompe a suavização do scrub, e nada a retomaria até a próxima rolagem).
  const sync = () => {
    measure();
    const st = progress.scrollTrigger;
    if (st) progress.progress(st.progress);
    apply();
  };
  // Refaz só este gatilho (o refresh geral rola a página a 0).
  const remeasure = () => {
    progress.scrollTrigger?.refresh();
    ScrollTrigger.update();
    sync();
  };

  const decide = (refresh: boolean) => {
    const next = fits();
    if (next === on) return;
    on = next;
    el.toggleAttribute(ON, on);
    el.toggleAttribute(OWN_FOCUS, on);
    if (!on) clear();
    if (refresh) remeasure();
    else apply();
  };
  const onRefreshInit = () => decide(false);
  const onRelayout = () => {
    decide(false);
    remeasure();
  };

  // Teclado: o foco no link da ponte leva ao fim do trecho, onde ele aparece.
  // Espera um quadro: o navegador rola até o foco depois do focusin.
  let frame = 0;
  const onFocusIn = (e: FocusEvent) => {
    if (!on || !bridge || e.target !== bridge || !fromKeyboard(bridge)) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const range = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: flowTop(el) + BRIDGE_AT * range, behavior: "auto" });
    });
  };

  // A cena mudou de tamanho (fontes, idioma, largura): talvez não caiba mais,
  // e o trilho tem outra medida.
  const ro =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          decide(true);
          measure();
          apply();
        });
  ro?.observe(inner);
  ro?.observe(track);

  ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
  ScrollTrigger.addEventListener("refresh", sync);
  window.addEventListener(CORTINA_RELAYOUT, onRelayout);
  el.addEventListener("focusin", onFocusIn);
  decide(true);

  return () => {
    cancelAnimationFrame(frame);
    ro?.disconnect();
    ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
    ScrollTrigger.removeEventListener("refresh", sync);
    window.removeEventListener(CORTINA_RELAYOUT, onRelayout);
    el.removeEventListener("focusin", onFocusIn);
    el.removeAttribute(ON);
    el.removeAttribute(OWN_FOCUS);
    clear();
  };
}

// O dia de 600 toneladas (spec §7.2). Com JavaScript, sem movimento reduzido
// e com a cena cabendo na tela, o .s-dia600 ganha data-dia600-on: fica alto
// (380 vh), o palco gruda e dia600Frame conta o dia com a rolagem. O
// ScrollTrigger só dá o progresso (scrub, sem pin).
export function useDia600(root: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    let mm: ReturnType<typeof gsap.matchMedia> | null = null;
    let unmounted = false;
    loadScrollTrigger().then(
      (ScrollTrigger) => {
        if (unmounted) return;
        mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => startDia600(el, ScrollTrigger));
      },
      (err: unknown) => console.warn("Dia de 600 t: o ScrollTrigger não carregou; a cena fica no estado final.", err),
    );

    return () => {
      unmounted = true;
      mm?.revert();
    };
  }, [root]);
}
