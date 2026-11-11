"use client";

import gsap from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { useEffect, type RefObject } from "react";
import { deckEntrance, deckLayout, deckProgressFor, deckMode, type DeckMode } from "@/lib/deck";
import { CORTINA_RELAYOUT, loadScrollTrigger } from "@/lib/scrollTrigger";
import { fromKeyboard } from "../cortinaFocus";
import { flowTop } from "../flowTop";

const ON = "data-deck-on";
// Enquanto ligado, o baralho cuida da rolagem do foco (cortinaFocus o pula).
const OWN_FOCUS = "data-own-focus";
const COMPACT = "data-deck-compact";
const CARD_VARS = ["--cy", "--cr", "--cs", "--cshade"];

function startDeck(el: HTMLElement, ScrollTrigger: typeof ScrollTriggerType): () => void {
  const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-deck-card]"));
  const n = cards.length;
  if (n === 0) return () => {};

  let on = false;
  let mode: DeckMode | null = null;
  const state = { p: 0 };

  const clear = () => {
    for (const card of cards) {
      for (const v of CARD_VARS) card.style.removeProperty(v);
      card.style.removeProperty("filter");
      card.style.removeProperty("opacity");
    }
  };

  // Escreve as variáveis de cada carta; quem ainda entra vem desfocada e
  // esmaecida, e o inline sai quando ela chega.
  const apply = () => {
    if (!on) return;
    const layout = deckLayout(state.p, n, window.innerHeight);
    const entrance = deckEntrance(state.p, n);
    cards.forEach((card, j) => {
      const c = layout[j];
      const s = card.style;
      s.setProperty("--cy", `${+c.y.toFixed(2)}px`);
      s.setProperty("--cr", `${+c.rotate.toFixed(3)}deg`);
      s.setProperty("--cs", String(+c.scale.toFixed(4)));
      s.setProperty("--cshade", String(+c.shade.toFixed(3)));
      const e = entrance[j];
      if (j > 0 && e < 0.999) {
        s.filter = `blur(${((1 - e) * 10).toFixed(2)}px)`;
        s.opacity = (0.35 + 0.65 * e).toFixed(3);
      } else {
        s.removeProperty("filter");
        s.removeProperty("opacity");
      }
    });
  };

  // Mede os dois layouts no palco preso antes de escolher full, compact ou
  // list. Restaura os atributos para a medição não mudar o modo por si só.
  const fits = () => {
    const had = el.hasAttribute(ON);
    const wasCompact = el.hasAttribute(COMPACT);
    el.setAttribute(ON, "");
    el.removeAttribute(COMPACT);
    const stageH = Math.min(window.innerHeight, el.querySelector<HTMLElement>(".s-deck__stage")?.clientHeight ?? window.innerHeight);
    const fullMax = Math.max(...cards.map((card) => card.offsetHeight));
    el.setAttribute(COMPACT, "");
    const compactMax = Math.max(...cards.map((card) => card.offsetHeight));
    el.toggleAttribute(ON, had);
    el.toggleAttribute(COMPACT, wasCompact);
    return deckMode(mode, fullMax, compactMax, stageH);
  };

  // O refresh lê start antes de end: mede o topo uma vez e end o reaproveita.
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

  // Depois de medir, as cartas vão direto ao progresso de agora. Um refresh
  // interrompe a suavização do scrub no meio; como a rolagem não mudou,
  // nenhuma nova começa, e as cartas ficariam paradas num ponto velho até a
  // pessoa rolar.
  const sync = () => {
    const st = progress.scrollTrigger;
    if (st) progress.progress(st.progress);
    apply();
  };
  // Refaz só este gatilho (o refresh geral rola a página a 0 e cancelaria
  // rolagens em andamento).
  const remeasure = () => {
    progress.scrollTrigger?.refresh();
    ScrollTrigger.update();
    sync();
  };

  // Decide de novo; se mudou, liga ou desliga. Dentro do refresh geral o
  // próprio refresh mede o gatilho; fora dele, refaz só este.
  const decide = (refresh: boolean) => {
    const next = fits();
    if (next === mode) return;
    mode = next;
    on = mode !== "list";
    el.toggleAttribute(ON, on);
    el.toggleAttribute(COMPACT, mode === "compact");
    el.toggleAttribute(OWN_FOCUS, on);
    if (!on) clear();
    if (refresh) remeasure();
    else apply();
  };
  // Refresh geral (janela redimensionada, load): decide antes da medição e
  // acerta as cartas depois dela.
  const onRefreshInit = () => decide(false);
  // A Cortina mediu os capítulos de novo.
  const onRelayout = () => {
    decide(false);
    remeasure();
  };

  // Teclado: o foco numa carta traz o trecho em que ela está na frente. Espera
  // um quadro: o navegador rola até o foco depois do focusin, e esta rolagem
  // tem de vir por último.
  let frame = 0;
  const onFocusIn = (e: FocusEvent) => {
    if (!on || !(e.target instanceof HTMLElement) || !fromKeyboard(e.target)) return;
    const j = cards.findIndex((card) => card.contains(e.target as Node));
    if (j < 0) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const range = el.offsetHeight - window.innerHeight;
      // "auto" segue o scroll-behavior do CSS.
      window.scrollTo({ top: flowTop(el) + deckProgressFor(j, n) * range, behavior: "auto" });
    });
  };

  // O texto da carta mudou de altura (fontes, idioma): talvez não caiba mais.
  const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => decide(true));
  cards.forEach((card) => ro?.observe(card));

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
    el.removeAttribute(COMPACT);
    el.removeAttribute(OWN_FOCUS);
    clear();
  };
}

// Baralho do "Como eu trabalho" (spec §6). Com JavaScript, sem movimento
// reduzido, usa full ou compact quando as cartas cabem; caso contrário, list.
// Nos dois modos sobrepostos, o .s-deck ganha data-deck-on:
// fica alto (340 vh), o palco gruda e as cartas entram uma sobre a outra
// conforme o progresso do trecho. O ScrollTrigger só dá o progresso (scrub,
// sem pin); o JS escreve variáveis CSS em cada carta.
export function useDeck(deck: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = deck.current;
    if (!el) return;

    let mm: ReturnType<typeof gsap.matchMedia> | null = null;
    let unmounted = false;
    loadScrollTrigger().then(
      (ScrollTrigger) => {
        if (unmounted) return;
        mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => startDeck(el, ScrollTrigger));
      },
      (err: unknown) => console.warn("Baralho: o ScrollTrigger não carregou; os passos ficam em lista.", err),
    );

    return () => {
      unmounted = true;
      mm?.revert();
    };
  }, [deck]);
}
