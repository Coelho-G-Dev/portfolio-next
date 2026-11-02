"use client";

import { useEffect, useState, type RefObject } from "react";
import { projects, type Door, type FacetLink } from "@/data/projects";
import { Arrow } from "../Pill";
import { useSiteCopy } from "../SiteCopyContext";
import ChessArchitecture from "./ChessArchitecture";

const LINK_FIELD: Record<
  FacetLink,
  "githubLink" | "frontendLink" | "demoLink" | "apiDocsLink"
> = {
  github: "githubLink",
  frontend: "frontendLink",
  demo: "demoLink",
  docs: "apiDocsLink",
};

export default function DoorPanel({
  door,
  lang,
  headingRef,
  onBack,
  staticMode = false,
}: {
  door: Door;
  lang: "pt" | "en";
  headingRef?: RefObject<HTMLHeadingElement>;
  onBack?: () => void;
  staticMode?: boolean;
}) {
  const c = useSiteCopy().projetos;
  const doorCopy = c.doors[door];
  const list = projects.filter((p) => p.doors?.includes(door));

  const [showFloating, setShowFloating] = useState(false);

  // Monitora rolagem para exibir barra flutuante de navegação rápida
  useEffect(() => {
    if (staticMode || !onBack) return;

    const handleScroll = () => {
      // Exibe a barra suspensa quando o usuário rolar 240px abaixo do topo do painel
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
    if (headingRef?.current) {
      headingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      id={`door-panel-${door}`}
      className="s-door-panel"
      data-door-panel={door}
      data-portal={!staticMode ? "true" : undefined}
    >
      <div className="s-door-panel__head">
        <div>
          <h3
            ref={headingRef}
            tabIndex={-1}
            className="s-door-panel__title"
          >
            {doorCopy.name}
          </h3>
          <p className="s-door-panel__teaser">{doorCopy.teaser}</p>
        </div>
        {!staticMode && onBack && (
          <button
            type="button"
            className="s-door-panel__back"
            onClick={onBack}
          >
            <span aria-hidden="true">← </span>
            {c.back}
          </button>
        )}
      </div>

      <div className="s-door-panel__list">
        {list.map((project) => {
          const facet = project.facets?.[door];
          if (!facet) return null;
          const metrics = facet.metrics ?? project.metrics ?? [];

          return (
            <article
              key={`${door}-${project.id}`}
              className="s-project-card"
              data-project-card={project.id}
            >
              <div className="s-project-card__header">
                <h4 className="s-project-card__title">{project.title}</h4>
                <span className="s-project-card__year">{project.year}</span>
              </div>

              <p className="s-project-card__line">{facet.line[lang]}</p>

              {metrics.length > 0 && (
                <dl className="s-project-card__metrics">
                  {metrics.map((m, i) => (
                    <div key={i} className="s-project-card__metric">
                      <dt>{m.label[lang]}</dt>
                      <dd>{m.value[lang]}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <ul className="s-project-card__stack">
                {facet.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>

              {facet.screens && facet.screens.length > 0 && (
                <div className="s-project-card__screens">
                  {facet.screens.map((s) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={s.src}
                      src={s.src}
                      alt={s.alt[lang]}
                      width={240}
                      height={520}
                      loading="lazy"
                      className="s-project-card__screen"
                    />
                  ))}
                </div>
              )}

              <div className="s-project-card__links">
                {facet.links.map((key, idx) => {
                  const href = project[LINK_FIELD[key]];
                  if (!href) return null;
                  const primary = idx === 0;
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="s-pill"
                      data-variant={primary ? "primary" : "secondary"}
                      data-surface="dark"
                    >
                      <span className="s-pill__label">{c.links[key]}</span>
                      {primary && (
                        <span className="s-pill__dot">
                          <Arrow />
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>

              {door === "backend" && (
                <ChessArchitecture
                  project={project}
                  lang={lang}
                  staticMode={staticMode}
                />
              )}
            </article>
          );
        })}
      </div>

      {/* Rodapé de fechamento no final do painel para evitar rolagem de volta com mouse */}
      {!staticMode && onBack && (
        <div className="s-door-panel__footer">
          <p className="s-door-panel__footer-text">
            {lang === "pt"
              ? "Pronto para conferir as outras facetas de arquitetura?"
              : "Ready to explore other architectural facets?"}
          </p>
          <div className="s-door-panel__footer-actions">
            <button
              type="button"
              className="s-door-panel__back s-door-panel__back--large"
              onClick={onBack}
            >
              <span aria-hidden="true">← </span>
              {lang === "pt"
                ? `Fechar ${doorCopy.name} e voltar aos portais`
                : `Close ${doorCopy.name} and view portals`}
            </button>
            <button
              type="button"
              className="s-door-panel__scroll-top"
              onClick={scrollToTop}
            >
              <span aria-hidden="true">↑ </span>
              {lang === "pt" ? "Voltar ao topo da seção" : "Back to top"}
            </button>
          </div>
        </div>
      )}

      {/* Barra de ação flutuante para navegação rápida de usuários no desktop com mouse */}
      {!staticMode && onBack && showFloating && (
        <aside
          className="s-door-floating-bar"
          role="toolbar"
          aria-label={lang === "pt" ? "Navegação rápida do projeto" : "Quick project navigation"}
        >
          <button
            type="button"
            className="s-door-floating-btn"
            onClick={scrollToTop}
            title={lang === "pt" ? "Rolar para o topo" : "Scroll to top"}
          >
            <span aria-hidden="true">↑</span>
            <span>Topo</span>
          </button>
          <button
            type="button"
            className="s-door-floating-btn s-door-floating-btn--primary"
            onClick={onBack}
            title={lang === "pt" ? "Fechar portal e voltar à visão geral (Esc)" : "Close portal and return (Esc)"}
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
