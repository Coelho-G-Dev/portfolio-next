"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";
import { projectsForDoor, type Door } from "@/data/doors";
import { useSiteCopy } from "../SiteCopyContext";
import { prefersReducedMotion } from "./doorMotion";
import ProjectCard from "./ProjectCard";
import RoomTop from "./RoomTop";

// A sala atrás de uma porta.
export default function DoorRoom({
  door,
  index,
  lang,
  headingRef,
  onBack,
  staticMode = false,
}: {
  door: Door;
  index: number;
  lang: "pt" | "en";
  headingRef?: RefObject<HTMLHeadingElement>;
  onBack?: () => void;
  staticMode?: boolean;
}) {
  const c = useSiteCopy().projetos;
  const doorCopy = c.doors[door];
  const entries = projectsForDoor(door);

  const [showFloating, setShowFloating] = useState(false);

  // Monitora rolagem para exibir barra flutuante de navegação rápida
  useEffect(() => {
    if (staticMode || !onBack) return;

    const handleScroll = () => {
      // Exibe a barra suspensa quando o título da sala passar 120px acima da janela
      if (headingRef?.current) {
        const top = headingRef.current.getBoundingClientRect().top;
        setShowFloating(top < -120);
      } else {
        setShowFloating(window.scrollY > 400);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [staticMode, onBack, headingRef]);

  const scrollToTop = () => {
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    if (headingRef?.current) {
      headingRef.current.scrollIntoView({ behavior, block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  };

  return (
    <div
      id={`door-panel-${door}`}
      className="s-room"
      data-door={door}
      data-door-panel={door}
      style={{ "--room-glow": `var(--c-porta-${door}-claro)` } as CSSProperties}
    >
      <RoomTop
        index={index}
        name={doorCopy.name}
        teaser={doorCopy.teaser}
        headingRef={headingRef}
      />
      {!staticMode && onBack && (
        <button type="button" className="s-room__back" onClick={onBack}>
          <span aria-hidden="true">← </span>
          {c.back}
        </button>
      )}

      <div className="s-room__list">
        {entries.map((entry) => (
          <ProjectCard
            key={`${door}-${entry.project.id}`}
            entry={entry}
            door={door}
            lang={lang}
            mode="full"
            staticMode={staticMode}
          />
        ))}
      </div>

      {/* Rodapé de fechamento no final do painel para evitar rolagem de volta com mouse */}
      {!staticMode && onBack && (
        <div className="s-room__footer">
          <p className="s-room__footer-text">
            {c.panel.footerText}
          </p>
          <div className="s-room__footer-actions">
            <button
              type="button"
              className="s-room__back s-room__back--large"
              onClick={onBack}
            >
              <span aria-hidden="true">← </span>
              {c.panel.closeAndBack(doorCopy.name)}
            </button>
            <button
              type="button"
              className="s-room__scroll-top"
              onClick={scrollToTop}
            >
              <span aria-hidden="true">↑ </span>
              {c.panel.scrollTop}
            </button>
          </div>
        </div>
      )}

      {/* Barra de ação flutuante para navegação rápida de usuários no desktop com mouse */}
      {!staticMode && onBack && showFloating && (
        <aside
          className="s-door-floating-bar"
          role="toolbar"
          aria-label={c.panel.navAria}
        >
          <button
            type="button"
            className="s-door-floating-btn"
            onClick={scrollToTop}
            title={c.panel.scrollTopTitle}
          >
            <span aria-hidden="true">↑</span>
            <span>{c.panel.scrollTopShort}</span>
          </button>
          <button
            type="button"
            className="s-door-floating-btn s-door-floating-btn--primary"
            onClick={onBack}
            title={c.panel.closeTitle}
          >
            <span aria-hidden="true">←</span>
            <span>{c.back}</span>
            <kbd className="s-door-floating-kbd">Esc</kbd>
          </button>
        </aside>
      )}
    </div>
  );
}
