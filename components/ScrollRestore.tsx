"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";

const STORAGE_KEY = "portfolio:lastScrollY";
const MIN_SCROLL_TO_OFFER = 400;
const AUTO_DISMISS_MS = 8000;

export default function ScrollRestore() {
  const [savedY, setSavedY] = useState<number | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const previousY = Number(sessionStorage.getItem(STORAGE_KEY) ?? 0);
    window.scrollTo(0, 0);

    if (previousY > MIN_SCROLL_TO_OFFER) {
      setSavedY(previousY);
      dismissTimer.current = setTimeout(() => setSavedY(null), AUTO_DISMISS_MS);
    }

    let ticking = false;
    const trackScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
        ticking = false;
      });
    };
    window.addEventListener("scroll", trackScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", trackScroll);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const restore = () => {
    if (savedY === null) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: savedY, behavior: reducedMotion ? "auto" : "smooth" });
    setSavedY(null);
  };

  const dismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setSavedY(null);
  };

  if (savedY === null) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-navy text-cream border border-lime/40 rounded-full pl-4 pr-2 py-2 shadow-lg font-mono text-xs tracking-widest uppercase">
      <button
        onClick={restore}
        className="flex items-center gap-2 hover:text-lime transition-colors"
      >
        <RotateCcw size={14} /> Voltar pra onde você estava
      </button>
      <button
        onClick={dismiss}
        aria-label="Dispensar"
        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-cream/10 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}
