"use client";

import { useEffect, useRef, useState } from "react";
import { mailtoFor } from "@/lib/contact";
import Character from "./Character";
import EmailPill from "./EmailPill";
import Pill from "./Pill";
import { useSiteCopy } from "./SiteCopyContext";
import Typed from "./Typed";

// Abertura (spec §5.2): texto à esquerda, personagem à direita.
export default function Hero() {
  const c = useSiteCopy();
  const h = c.hero;
  const ref = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);

  // O personagem pausa quando menos de 10% da abertura está à vista.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPaused(entry.intersectionRatio < 0.1), {
      threshold: [0, 0.1, 0.2],
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <header id="inicio" ref={ref} className="s-hero">
      <div className="s-hero__text">
        <p className="s-hero__label">{h.label}</p>
        <h1 className="s-hero__name">{h.name}</h1>
        <p className="s-hero__intro">
          <Typed text={h.intro} />
        </p>
        <div className="s-hero__pills">
          <Pill href="#projetos" variant="primary" surface="light">
            {h.seeWork}
          </Pill>
          <Pill href={mailtoFor(c.contact, "project")} variant="secondary" surface="light">
            {h.project}
          </Pill>
          <Pill href={mailtoFor(c.contact, "role")} variant="secondary" surface="light">
            {h.role}
          </Pill>
          <EmailPill surface="light" />
        </div>
      </div>
      <div className="s-hero__char">
        <Character paused={paused} />
      </div>
    </header>
  );
}
