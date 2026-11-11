"use client";

import { useEffect } from "react";
import { CORTINA_RELAYOUT } from "@/lib/scrollTrigger";
import { arriveAtHash } from "./flowTop";

// Corrige somente a chegada inicial, enquanto os trechos presos são medidos.
// Qualquer ação da pessoa encerra a correção para não disputar sua navegação.
export function useHashArrival(): void {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.length <= 1 || hash.startsWith("#porta-") || window.__portfolioHashInput) return;
    let stopped = false;
    let started = false;
    let first = 0;
    let second = 0;
    let timer = 0;
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      window.clearTimeout(timer);
      window.removeEventListener("load", start);
      window.removeEventListener(CORTINA_RELAYOUT, relayout);
      inputs.forEach(event => window.removeEventListener(event, stop, true));
    };
    const schedule = () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => {
          if (stopped) return;
          if (window.location.hash !== hash) { stop(); return; }
          arriveAtHash(hash);
        });
      });
    };
    const relayout = () => { if (started && !stopped) schedule(); };
    const start = () => {
      if (stopped || started) return;
      started = true;
      timer = window.setTimeout(stop, 2000);
      schedule();
    };
    inputs.forEach(event => window.addEventListener(event, stop, { capture: true, passive: true }));
    window.addEventListener(CORTINA_RELAYOUT, relayout);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return stop;
  }, []);
}
