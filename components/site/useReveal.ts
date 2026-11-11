"use client";

import gsap from "gsap";
import { useEffect, type RefObject } from "react";
import { CORTINA_RELAYOUT, loadScrollTrigger } from "@/lib/scrollTrigger";
import { flowTop, flowTops } from "./flowTop";

const ABERTURA = '[data-chapter="abertura"]';
// O bloco entra em foco enquanto o topo dele sobe de 95% a 57% da janela.
const START = 0.95;
const END = 0.57;

// Foco ao chegar (spec §5.1 item 4): cada [data-reveal] fora da Abertura chega
// desfocado, mais baixo e esmaecido, e entra em foco enquanto sobe entre 95% e
// 57% da janela, com o scrub. Ao terminar, os estilos inline saem (nenhum
// filter residual). O estado inicial só existe depois da hidratação e do
// carregamento do ScrollTrigger: sem JavaScript, tudo fica visível.
//
// Os gatilhos medem o bloco em fluxo, como o baralho e o Dia600: o
// cortina:relayout chega com os capítulos de antes já grudados (abrir uma
// porta no Projetos refaz os gatilhos com o Derrube grudado por baixo), e a
// posição grudada deixaria o bloco esmaecido quando a pessoa voltasse a ele.
export function useReveal(root: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    let mm: ReturnType<typeof gsap.matchMedia> | null = null;
    let unmounted = false;
    loadScrollTrigger().then(
      () => {
        if (unmounted) return;
        mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const tweens = new Map<HTMLElement, gsap.core.Tween>();
          // Posições em fluxo medidas de uma vez antes de criar ou refazer
          // gatilhos (um layout só, e não um por bloco). Fora disso, cada
          // gatilho mede o seu.
          const measured = new Map<HTMLElement, number>();
          const measure = (nodes: HTMLElement[]) => {
            const ys = flowTops(nodes);
            nodes.forEach((node, i) => measured.set(node, ys[i]));
          };

          const reveal = (target: HTMLElement) => {
            // onUpdate pode disparar ainda dentro do fromTo, antes de `tween` existir.
            const made: { tween?: gsap.core.Tween } = {};
            // O refresh lê start antes de end: mede uma vez e end reaproveita.
            let top = 0;
            const tween = gsap.fromTo(
              target,
              { filter: "blur(14px)", y: 44, opacity: 0.12 },
              {
                filter: "blur(0px)",
                y: 0,
                opacity: 1,
                ease: "power3.out",
                scrollTrigger: {
                  start: () => (top = measured.get(target) ?? flowTop(target)) - START * window.innerHeight,
                  end: () => top - END * window.innerHeight,
                  scrub: 0.3,
                },
                // Chegou: sai o inline. Voltando abaixo de 1, o tween reaplica.
                onUpdate: () => {
                  if (made.tween?.progress() === 1) gsap.set(target, { clearProps: "filter,opacity,transform" });
                },
              },
            );
            made.tween = tween;
            tweens.set(target, tween);
          };

          // Blocos que entraram depois da hidratação (o Derrube troca o
          // diagrama estático pelo interativo) também ganham o efeito; os que
          // saíram do DOM perdem o tween.
          const sync = () => {
            for (const [node, tween] of tweens)
              if (!node.isConnected) {
                tween.scrollTrigger?.kill();
                tween.kill();
                tweens.delete(node);
              }
            const fresh = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
              (node) => !tweens.has(node) && !node.closest(ABERTURA),
            );
            measure(fresh);
            fresh.forEach(reveal);
            measured.clear();
          };

          // A altura dos capítulos mudou: refaz só estes gatilhos (o refresh
          // geral rola a página a 0 e cancelaria rolagens em andamento).
          const relayout = () => {
            sync();
            measure([...tweens.keys()]);
            for (const tween of tweens.values()) tween.scrollTrigger?.refresh();
            measured.clear();
          };

          sync();
          window.addEventListener(CORTINA_RELAYOUT, relayout);
          return () => window.removeEventListener(CORTINA_RELAYOUT, relayout);
        });
      },
      (err: unknown) => console.warn("Foco ao chegar: o ScrollTrigger não carregou; os blocos ficam visíveis.", err),
    );

    return () => {
      unmounted = true;
      mm?.revert();
    };
  }, [root]);
}
