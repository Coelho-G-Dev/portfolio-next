"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { redesignCopy } from "@/lib/i18n/redesign";
import type { Contributions } from "@/lib/github";
import Hero from "./Hero";
import BreakService from "./BreakService";
import Work from "./Work";
import HowIWork from "./HowIWork";
import Services from "./Services";
import About from "./About";
import Contact from "./Contact";
import Footer from "./Footer";

type Layer = "surface" | "api" | "queue" | "db";

const LAYER_TARGETS: { layer: Layer; href: string }[] = [
  { layer: "surface", href: "#inicio" },
  { layer: "api", href: "#derrube" },
  { layer: "queue", href: "#como-trabalho" },
  { layer: "db", href: "#sobre" },
];

export default function RedesignPage({ contributions }: { contributions: Contributions | null }) {
  const { language, toggleLanguage } = useLanguage();
  const c = redesignCopy[language];
  const rootRef = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<Layer>("surface");
  const [js, setJs] = useState(false);

  useEffect(() => setJs(true), []);

  // A camada atual é a da seção que cruza o meio da tela.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setLayer((e.target as HTMLElement).dataset.layer as Layer);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    root.querySelectorAll<HTMLElement>("[data-layer]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Entradas: título, texto e imagem sobem em sequência, uma vez.
  useEffect(() => {
    if (!js) return;
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    root.querySelectorAll("[data-rise]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [js, language]);

  return (
    <div ref={rootRef} className={`rd${js ? " js" : ""}`} data-layer={layer}>
      <nav aria-label={c.nav.layersAria}>
        <ul className="rd-gauge">
          {LAYER_TARGETS.map((t) => (
            <li key={t.layer}>
              <a href={t.href} aria-current={layer === t.layer ? "true" : undefined}>
                <span>{c.layers[t.layer]}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Hero c={c} onToggleLanguage={toggleLanguage} />
      <main id="main-content">
        <BreakService c={c} />
        <Work c={c} language={language} />
        <HowIWork c={c} />
        <Services c={c} />
        <About c={c} contributions={contributions} language={language} />
        <Contact c={c} />
      </main>
      <Footer c={c} />
    </div>
  );
}
