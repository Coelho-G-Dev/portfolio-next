"use client";

import { useEffect, useState, type RefObject } from "react";
import { chapterEffect, COVERED_AT, coverage, stickTop } from "@/lib/cortina";

// Cortina (spec §5.3). Mede cada [data-chapter] e escreve --stick-top (o
// capítulo gruda pela base se for mais alto que a tela); a cada quadro de
// rolagem escreve --scale e --shade no capítulo de trás. Só variáveis CSS:
// nenhum re-render por quadro. Devolve os capítulos cobertos, atualizados só
// quando algum cruza COVERED_AT.
export function useCortina(root: RefObject<HTMLElement | null>): ReadonlySet<string> {
  const [covered, setCovered] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const el = root.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const chapters = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"));
    if (chapters.length === 0) return;

    const compact = window.matchMedia("(max-width: 719px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastKey = "";

    const measure = () => {
      const vh = window.innerHeight;
      for (const chapter of chapters) {
        chapter.style.setProperty("--stick-top", `${stickTop(chapter.offsetHeight, vh)}px`);
        chapter.setAttribute("data-stick", "");
      }
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const ids: string[] = [];
      chapters.forEach((chapter, i) => {
        const next = chapters[i + 1];
        const cover = next ? coverage(next.getBoundingClientRect().top, vh) : 0;
        const { scale, shade } = chapterEffect(cover, { compact: compact.matches, reduced: reduced.matches });
        chapter.style.setProperty("--scale", String(scale));
        chapter.style.setProperty("--shade", String(shade));
        if (cover >= COVERED_AT) ids.push(chapter.dataset.chapter ?? "");
      });
      const key = ids.join(",");
      if (key !== lastKey) {
        lastKey = key;
        setCovered(new Set(ids));
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    const ro = new ResizeObserver(onResize);
    chapters.forEach((chapter) => ro.observe(chapter));
    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    compact.addEventListener("change", schedule);
    reduced.addEventListener("change", schedule);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      compact.removeEventListener("change", schedule);
      reduced.removeEventListener("change", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [root]);

  return covered;
}
