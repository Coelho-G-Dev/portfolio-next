"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";
import type { Locale } from "@/lib/i18n/translations";
import type { RedesignCopy } from "@/lib/i18n/redesign";

type Props = { c: RedesignCopy; language: Locale };

// Só o painel do projeto ativo fica ao alcance do teclado e do leitor de tela;
// os outros ficam empilhados atrás dele.
function Pane({
  p,
  c,
  language,
  shown,
  current,
}: {
  p: Project;
  c: RedesignCopy;
  language: Locale;
  shown?: boolean;
  current?: boolean;
}) {
  const cls = `rd-pane${shown ? " is-shown" : ""}`;
  // O React 18 não conhece o atributo inert; ele é aplicado direto no elemento.
  const away = {
    "aria-hidden": current ? undefined : true,
    ref: (el: HTMLElement | null) => {
      if (el) el.inert = !current;
    },
  };
  if (p.title === "Cidade Energia") {
    return (
      <div className={cls} {...away}>
        <Image
          src="/photos/web/premiacao-cidade-energia.webp"
          alt={c.work.photoAlt}
          width={1600}
          height={1200}
          sizes="(max-width: 900px) 100vw, 62vw"
        />
      </div>
    );
  }
  return (
    <figure className={`${cls} rd-pane--diagram`} data-ui style={{ margin: 0 }} {...away}>
      <p>{p.architecture?.title[language]}</p>
      <pre tabIndex={0} aria-label={c.work.diagramLabel(p.title)}>{p.architecture?.diagram[language]}</pre>
    </figure>
  );
}

function Detail({ p, c, language }: { p: Project; c: RedesignCopy; language: Locale }) {
  const copy = c.work.projects[p.title];
  return (
    <>
      {p.award && <p className="rd-work__award">{c.work.winner}</p>}
      <p className="rd-lead">{copy?.line ?? p.description[language]}</p>
      {p.metrics && (
        <dl className="rd-work__metrics">
          {p.metrics.slice(0, 3).map((m) => (
            <div key={m.label.pt}>
              <dt>{m.label[language]}</dt>
              <dd>{m.value[language]}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="rd-work__links">
        <a className="rd-link" href={p.githubLink} target="_blank" rel="noopener noreferrer">
          {c.work.code}
        </a>
        {p.frontendLink && (
          <a className="rd-link" href={p.frontendLink} target="_blank" rel="noopener noreferrer">
            {c.work.frontend}
          </a>
        )}
        {p.demoLink && (
          <a className="rd-link" href={p.demoLink} target="_blank" rel="noopener noreferrer">
            {c.work.demo}
          </a>
        )}
        {p.apiDocsLink && (
          <a className="rd-link" href={p.apiDocsLink} target="_blank" rel="noopener noreferrer">
            {c.work.docs}
          </a>
        )}
      </div>
    </>
  );
}

export default function Work({ c, language }: Props) {
  const [active, setActive] = useState(0);
  const markers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    markers.current.forEach((m) => m && io.observe(m));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    markers.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const current = projects[active];

  return (
    <section id="projetos" className="rd-work" data-layer="api" aria-labelledby="projetos-title">
      <div className="rd-work__pinned" style={{ height: `${projects.length * 100}svh` }}>
        <div className="rd-work__markers" aria-hidden="true">
          {projects.map((p, i) => (
            <div key={p.id} data-index={i} ref={(el) => { markers.current[i] = el; }} />
          ))}
        </div>
        <div className="rd-work__stage">
          <div className="rd-work__left">
            <h2 id="projetos-title" className="rd-head">
              {c.work.title}
            </h2>
            <div className="rd-work__detail" aria-live="polite">
              <Detail p={current} c={c} language={language} />
            </div>
            <ol className="rd-index">
              {projects.map((p, i) => (
                <li key={p.id}>
                  <h3>
                    <button type="button" aria-current={i === active ? "true" : undefined} onClick={() => goTo(i)}>
                      <span className="rd-index__name">{p.title}</span>
                      <span className="rd-index__disc">{c.work.projects[p.title]?.disciplines}</span>
                    </button>
                  </h3>
                </li>
              ))}
            </ol>
          </div>
          <div className="rd-work__right">
            {projects.map((p, i) => (
              <Pane key={p.id} p={p} c={c} language={language} shown={i <= active} current={i === active} />
            ))}
          </div>
        </div>
      </div>

      {/* No celular, cada projeto empilha: imagem e texto. */}
      <div className="rd-work__list rd-section">
        <h2 className="rd-head">{c.work.title}</h2>
        {projects.map((p) => (
          <article key={p.id}>
            <Pane p={p} c={c} language={language} shown current />
            <h3>{p.title}</h3>
            <Detail p={p} c={c} language={language} />
          </article>
        ))}
      </div>
    </section>
  );
}
