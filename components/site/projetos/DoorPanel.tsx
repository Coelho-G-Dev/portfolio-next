import type { RefObject } from "react";
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

  return (
    <div
      id={`door-panel-${door}`}
      className="s-door-panel"
      data-door-panel={door}
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
    </div>
  );
}
