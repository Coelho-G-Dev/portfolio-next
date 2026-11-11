"use client";

import type { Door, DoorEntry } from "@/data/doors";
import type { FacetLink } from "@/data/projects";
import { Arrow } from "../Pill";
import { useSiteCopy } from "../SiteCopyContext";
import ChessArchitecture from "./ChessArchitecture";

const LINK_FIELD: Record<FacetLink, "githubLink" | "frontendLink" | "demoLink" | "apiDocsLink"> = {
  github: "githubLink",
  frontend: "frontendLink",
  demo: "demoLink",
  docs: "apiDocsLink",
};

// Cartão de projeto da sala. `preview` é o gêmeo da miniatura: a mesma árvore
// de caixas, com tudo (prints, métricas, links e tabuleiro), para nada surgir
// na troca pela sala real. Na prévia, link vira span e o tabuleiro não reage.
export default function ProjectCard({
  entry,
  door,
  lang,
  mode,
  staticMode = false,
}: {
  entry: DoorEntry;
  door: Door;
  lang: "pt" | "en";
  mode: "full" | "preview";
  staticMode?: boolean;
}) {
  const c = useSiteCopy().projetos;
  const { project, facet, home } = entry;
  const full = mode === "full";
  const screens = facet.screens ?? [];
  const [first, ...rest] = screens;
  const metrics = facet.metrics ?? project.metrics ?? [];
  const Title = full ? "h4" : "p";

  return (
    <article className="s-pcard" data-project-card={full ? project.id : undefined}>
      {first && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={first.src}
          alt={full ? first.alt[lang] : ""}
          width={240}
          height={520}
          loading="eager"
          className="s-pcard__screen"
        />
      )}
      {home !== door && <p className="s-pcard__also">{c.alsoIn(c.doors[home].name)}</p>}
      <div className="s-pcard__header">
        <Title className="s-pcard__title">{project.title}</Title>
        <span className="s-pcard__year">{project.year}</span>
      </div>
      <p className="s-pcard__line">{facet.line[lang]}</p>
      <ul className="s-pcard__stack">
        {facet.stack.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>

      {rest.length > 0 && (
        <div className="s-pcard__more">
          {rest.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.src}
              src={s.src}
              alt={full ? s.alt[lang] : ""}
              width={240}
              height={520}
              loading="lazy"
              className="s-pcard__screen"
            />
          ))}
        </div>
      )}

      {metrics.length > 0 && (
        <dl className="s-pcard__metrics">
          {metrics.map((m, i) => (
            <div key={i} className="s-pcard__metric">
              <dt>{m.label[lang]}</dt>
              <dd>{m.value[lang]}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="s-pcard__links">
        {facet.links.map((key, idx) => {
          const href = project[LINK_FIELD[key]];
          if (!href) return null;
          const primary = idx === 0;
          const pill = {
            className: "s-pill",
            "data-variant": primary ? "primary" : "secondary",
            "data-surface": "dark",
            children: (
              <>
                <span className="s-pill__label">{c.links[key]}</span>
                {primary && (
                  <span className="s-pill__dot">
                    <Arrow />
                  </span>
                )}
              </>
            ),
          };
          return full ? (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer" {...pill} />
          ) : (
            <span key={key} {...pill} />
          );
        })}
      </div>

      {door === "backend" && (
        <ChessArchitecture project={project} lang={lang} staticMode={staticMode} preview={!full} />
      )}
    </article>
  );
}
