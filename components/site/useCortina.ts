"use client";

import gsap from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { useEffect, useState, type RefObject } from "react";
import { chapterEffect, COVERED_AT, stickTop } from "@/lib/cortina";
import { CORTINA_RELAYOUT, loadScrollTrigger } from "@/lib/scrollTrigger";
import { watchFocus } from "./cortinaFocus";
import { docTop, followAnchors } from "./flowTop";

// Enquanto a máquina das portas entra ou sai, o capítulo dela fica congelado.
const DOOR_BUSY = ".s-portas[data-door-busy]";

type Conditions = { compact: boolean; reduced: boolean };

// Liga a Cortina nos capítulos de `root` para uma combinação de mídia
// (celular, movimento reduzido). Devolve a limpeza.
function startCortina(
  root: HTMLElement,
  chapters: HTMLElement[],
  ScrollTrigger: typeof ScrollTriggerType,
  { compact, reduced }: Conditions,
  onCovered: (ids: ReadonlySet<string>) => void,
): () => void {
  const progress = chapters.map(() => 0);
  let tops: number[] = [];
  let lastKey = "";

  // Medição em fluxo normal: sem data-stick, nada está grudado (docTop direto).
  const unstick = () => {
    for (const chapter of chapters) chapter.removeAttribute("data-stick");
    tops = chapters.map(docTop);
  };
  const stick = () => {
    const vh = window.innerHeight;
    for (const chapter of chapters) {
      chapter.style.setProperty("--stick-top", `${stickTop(chapter.offsetHeight, vh)}px`);
      chapter.setAttribute("data-stick", "");
    }
  };

  const write = (i: number) => {
    const chapter = chapters[i];
    if (chapter.querySelector(DOOR_BUSY)) return;
    const p = progress[i];
    const { scale, shade, round } = chapterEffect(p, { compact, reduced });
    chapter.style.setProperty("--scale", String(scale));
    chapter.style.setProperty("--shade", shade.toFixed(4));
    chapter.style.setProperty("--round", `${round.toFixed(2)}px`);
    // O transform só entra com escala: sem ele (celular, só o véu), o capítulo
    // não vira o bloco de contenção dos position: fixed de dentro (a barra da
    // sala aberta). --shade e --round valem sem o atributo.
    chapter.toggleAttribute("data-sinking", p > 0 && scale < 1);
  };
  const writeAll = () => chapters.forEach((_, i) => write(i));

  const report = () => {
    const ids = chapters.filter((_, i) => progress[i] >= COVERED_AT).map((c) => c.dataset.chapter ?? "");
    const key = ids.join(",");
    if (key === lastKey) return;
    lastKey = key;
    onCovered(new Set(ids));
  };

  // Os gatilhos leem tops ao serem criados.
  unstick();

  // p do capítulo i: o topo do seguinte vai da base da tela ao topo.
  const triggers = chapters.slice(0, -1).map((_, i) => {
    const state = { p: 0 };
    return gsap.to(state, {
      p: 1,
      ease: "none",
      scrollTrigger: {
        start: () => tops[i + 1] - window.innerHeight,
        end: () => tops[i + 1],
        scrub: 0.3,
      },
      onUpdate: () => {
        progress[i] = state.p;
        write(i);
        report();
      },
    });
  });

  // Depois de medir, cada capítulo vai direto ao progresso de agora (como o
  // baralho): o refresh corta a suavização do scrub no meio e, como a rolagem
  // não mudou, nenhuma nova começa; o capítulo ficaria com escala e véu velhos
  // até a pessoa rolar. Avisa também o conjunto coberto.
  const snap = () => {
    triggers.forEach((t, i) => {
      const st = t.scrollTrigger;
      if (!st) return;
      progress[i] = st.progress;
      t.progress(st.progress);
    });
    writeAll();
    report();
  };

  // Refresh geral do ScrollTrigger (janela redimensionada, load): mede em
  // fluxo normal no início e regruda no fim.
  const onRefresh = () => {
    stick();
    snap();
  };
  ScrollTrigger.addEventListener("refreshInit", unstick);
  ScrollTrigger.addEventListener("refresh", onRefresh);

  // Nova medição só destes gatilhos. O ScrollTrigger.refresh() geral leva a
  // rolagem a 0 para medir e só a devolve se ela não era 0: chamado logo
  // depois do clique numa âncora (o menu do celular fecha e a abertura muda de
  // altura), ele cancela a rolagem suave até o destino. O refresh de cada
  // gatilho, sem pin, não mexe na rolagem.
  const remeasure = () => {
    unstick();
    stick();
    for (const t of triggers) t.scrollTrigger?.refresh();
    ScrollTrigger.update();
    snap();
    // Os trechos presos de dentro dos capítulos refazem os próprios gatilhos.
    window.dispatchEvent(new Event(CORTINA_RELAYOUT));
  };

  // Altura dos capítulos mudou (sala aberta, menu, Derrube interativo): mede
  // de novo, no máximo uma vez por quadro.
  let frame = 0;
  const scheduleRemeasure = () => {
    if (!frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        remeasure();
      });
  };
  const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleRemeasure);
  chapters.forEach((chapter) => ro?.observe(chapter));
  let alive = true;
  document.fonts?.ready.then(() => alive && remeasure());

  // A porta terminou de entrar ou sair: o capítulo volta a seguir a cobertura
  // atual (nada de --scale velho).
  const mo = new MutationObserver(writeAll);
  mo.observe(root, { subtree: true, attributes: true, attributeFilter: ["data-door-busy"] });

  // Foco nunca fica sob a folha seguinte (WCAG 2.4.11).
  const stopFocus = watchFocus(root, chapters, () => tops, () => !!root.querySelector(DOOR_BUSY));

  remeasure();

  return () => {
    alive = false;
    if (frame) cancelAnimationFrame(frame);
    stopFocus();
    ro?.disconnect();
    mo.disconnect();
    ScrollTrigger.removeEventListener("refreshInit", unstick);
    ScrollTrigger.removeEventListener("refresh", onRefresh);
    for (const chapter of chapters) {
      chapter.removeAttribute("data-stick");
      chapter.removeAttribute("data-sinking");
      for (const v of ["--stick-top", "--scale", "--shade", "--round"]) chapter.style.removeProperty(v);
    }
  };
}

// Cortina (spec §5). Cada capítulo gruda (pela base, se for mais alto que a
// tela) e o seguinte sobe por cima; o de trás encolhe, arredonda e escurece
// conforme a cobertura p. O ScrollTrigger só dá o progresso (scrub, sem pin);
// o JS escreve variáveis CSS e atributos, sem re-render por quadro. Devolve os
// capítulos cobertos (p ≥ COVERED_AT), atualizados só quando o conjunto muda.
export function useCortina(root: RefObject<HTMLElement | null>): ReadonlySet<string> {
  const [covered, setCovered] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const chapters = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"));
    if (chapters.length === 0) return;

    // Âncoras da página até a posição em fluxo do destino (spec §5.4): a do
    // navegador para no meio do caminho quando o destino está grudado.
    const stopAnchors = followAnchors(el);

    // O ScrollTrigger chega sob demanda (fora do First Load). Até lá nada
    // gruda: data-stick só entra depois da medição, em startCortina.
    let mm: ReturnType<typeof gsap.matchMedia> | null = null;
    let unmounted = false;
    loadScrollTrigger().then(
      (ScrollTrigger) => {
        if (unmounted) return;
        mm = gsap.matchMedia();
        mm.add({ all: "all", compact: "(max-width: 719px)", reduced: "(prefers-reduced-motion: reduce)" }, (ctx) =>
          startCortina(el, chapters, ScrollTrigger, ctx.conditions as Conditions, setCovered),
        );
      },
      // Sem o ScrollTrigger a página fica como sem JavaScript (nada gruda),
      // mas a falha não passa calada.
      (err: unknown) => console.warn("Cortina: o ScrollTrigger não carregou; os capítulos não grudam.", err),
    );

    return () => {
      unmounted = true;
      stopAnchors();
      mm?.revert();
    };
  }, [root]);

  return covered;
}
