"use client";
import { useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { projects, type TileColor } from "@/data/projects";
import { useReveal } from "@/lib/useReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import SectionCut from "@/components/SectionCut";

const shapeClass: Record<TileColor, string> = {
  lime: "bg-lime",
  blue: "bg-blue",
  orange: "bg-orange",
  lavender: "bg-lavender",
};

export default function Projects() {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<"all" | "backend" | "ia">("all");
  const ref = useReveal<HTMLDivElement>();
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const filters = [
    { key: "all", label: t.projects.filters.all },
    { key: "backend", label: t.projects.filters.backend },
    { key: "ia", label: t.projects.filters.ia },
  ] as const;

  return (
    <section id="trabalho" className="relative min-h-screen bg-orange text-navy px-6 md:px-10 py-32">
      <SectionCut label={t.projects.cutLabel} color="cream" side="right" />
      <div ref={ref} className="reveal max-w-5xl mx-auto">
        <p className="font-mono text-xs tracking-widest uppercase mb-4">{t.projects.sectionNumber}</p>
        <h2 className="font-display font-black text-[10vw] md:text-5xl leading-[0.95] mb-4">
          {t.projects.titleLine1}
          <br />
          <span className="font-serif italic font-normal">{t.projects.titleHighlight}</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-10 mb-2">
          <div className="flex gap-6 font-mono text-xs tracking-widest uppercase">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`pb-1 border-b-2 transition-colors ${
                  filter === f.key ? "border-navy" : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase opacity-75 border border-navy/20 rounded-full px-3 py-1 bg-navy/5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-navy animate-pulse" aria-hidden="true" />
            <span>{t.projects.clickHint}</span>
          </div>
        </div>

        <div className="divide-y divide-navy/20 border-t border-navy/20 mt-8">
          {visible.map((project) => (
            <div
              key={project.id}
              className="relative group grid grid-cols-1 md:grid-cols-[auto_1.2fr_1fr_auto] gap-6 items-center py-8 px-4 -mx-4 overflow-hidden cursor-pointer"
            >
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={-1}
                aria-hidden="true"
                className="absolute inset-0 z-0"
              />

              <span
                aria-hidden="true"
                className="absolute inset-0 bg-navy/[0.06] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out -z-10 pointer-events-none"
              />

              <div
                aria-hidden="true"
                className="hidden lg:block absolute right-2 top-1/2 -translate-y-1/2 w-28 h-28 bg-navy/90 rounded-md overflow-hidden transition-all duration-500 ease-out opacity-20 group-hover:opacity-100 group-hover:scale-105 group-hover:-rotate-3 pointer-events-none -z-0"
              >
                <div
                  className={`absolute -left-4 top-1/2 -translate-y-1/2 w-20 h-20 ${shapeClass[project.shapeColors[1]]} rotate-45`}
                />
                <div
                  className={`absolute right-6 top-6 w-16 h-16 rounded-full ${shapeClass[project.shapeColors[0]]}`}
                />
              </div>

              <span className="relative font-mono text-xs opacity-50 z-10">
                {String(project.id).padStart(2, "0")}
              </span>

              <div className="relative z-10">
                <h3 className="relative inline-block font-display font-bold text-3xl md:text-4xl transition-colors duration-300 group-hover:text-lime">
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.projects.viewGithubAria(project.title)}
                    className="inline-flex items-center gap-2 hover:underline focus:outline-none focus-visible:underline"
                  >
                    <span>{project.title}</span>
                    <ArrowUpRight
                      size={20}
                      className="opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                  <span
                    aria-hidden="true"
                    className="absolute left-0 -bottom-1 h-[3px] w-full bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out pointer-events-none"
                  />
                </h3>
                <p className="font-mono text-sm tracking-widest uppercase opacity-60 mt-1">
                  {project.type[language]} · {project.year}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.tags.map((tTag) => (
                    <span
                      key={tTag}
                      className="font-mono text-sm tracking-wide uppercase border border-navy/30 rounded-full px-3 py-1.5"
                    >
                      {tTag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="relative text-sm leading-relaxed max-w-xs z-10">{project.description[language]}</p>

              <div className="relative z-20 flex flex-wrap md:flex-col items-start md:items-end gap-2.5">
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.projects.viewGithubAria(project.title)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-navy/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 bg-navy/10 text-navy hover:bg-navy hover:text-cream group-hover:bg-navy group-hover:text-cream shadow-sm hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                >
                  <Github size={14} className="shrink-0" />
                  <span>{t.projects.viewGithub}</span>
                  <ArrowUpRight size={13} className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>

                {project.demoLink && (
                  <a
                    href={project.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.projects.viewDemoAria(project.title)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-navy/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 bg-lime text-navy hover:bg-navy hover:text-lime shadow-sm hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                  >
                    <span>{t.projects.viewDemo}</span>
                    <ArrowUpRight size={13} className="shrink-0" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://github.com/Coelho-G-Dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase mt-10 border-b border-navy pb-1 hover:opacity-70 transition-opacity"
        >
          {t.projects.viewAll} <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}