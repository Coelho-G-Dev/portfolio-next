"use client";

import { useEffect, useState, type RefObject } from "react";

// Observador de presença dos capítulos na tela.
// Informa quais capítulos estão fora da visão para pausar vídeos e simulações
// em segundo plano sem travar a rolagem contínua da página.
export function useCortina(root: RefObject<HTMLElement | null>): ReadonlySet<string> {
  const [covered, setCovered] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const chapters = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"));
    if (chapters.length === 0) return;

    let frame = 0;
    let lastKey = "";

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const ids: string[] = [];
      for (const chapter of chapters) {
        const rect = chapter.getBoundingClientRect();
        // Capítulo fora de vista (acima ou abaixo da tela)
        if (rect.bottom <= 0 || rect.top >= vh) {
          ids.push(chapter.dataset.chapter ?? "");
        }
      }
      const key = ids.join(",");
      if (key !== lastKey) {
        lastKey = key;
        setCovered(new Set(ids));
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [root]);

  return covered;
}
