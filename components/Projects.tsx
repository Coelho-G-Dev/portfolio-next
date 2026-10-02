"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  Github,
  FileCode,
  Network,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { projects, type TileColor } from "@/data/projects";
import { useReveal } from "@/lib/useReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import SectionCut from "@/components/SectionCut";
import ArchitectureVisualizer from "@/components/ArchitectureVisualizer";

const shapeClass: Record<TileColor, string> = {
  lime: "bg-lime",
  blue: "bg-blue",
  orange: "bg-orange",
  lavender: "bg-lavender",
};

export default function Projects() {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<"all" | "backend" | "ia">("all");
  const [expandedArchId, setExpandedArchId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const ref = useReveal<HTMLDivElement>();
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const filters = [
    { key: "all", label: t.projects.filters.all },
    { key: "backend", label: t.projects.filters.backend },
    { key: "ia", label: t.projects.filters.ia },
  ] as const;

  const toggleArchitecture = (id: number) => {
    setExpandedArchId((prev) => (prev === id ? null : id));
  };

  const handleCopyDiagram = async (diagram: string, id: number) => {
    try {
      await navigator.clipboard.writeText(diagram);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback
    }
  };

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
                  filter === f.key ? "border-navy text-navy font-bold" : "border-transparent opacity-80 hover:opacity-100 font-medium"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase border border-navy/30 rounded-full px-3 py-1 bg-navy/10 text-navy font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-navy animate-pulse" aria-hidden="true" />
            <span>{t.projects.clickHint}</span>
          </div>
        </div>

        <div className="divide-y divide-navy/20 border-t border-navy/20 mt-8">
          {visible.map((project) => {
            const isArchExpanded = expandedArchId === project.id;

            return (
              <div
                key={project.id}
                className="relative group py-8 px-4 -mx-4 overflow-hidden transition-colors duration-300 hover:bg-navy/[0.04] rounded-xl"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-navy/[0.04] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out -z-10 pointer-events-none"
                />

                <div
                  aria-hidden="true"
                  className={`hidden lg:block absolute right-2 top-10 w-28 h-28 bg-navy/90 rounded-md overflow-hidden transition-all duration-500 ease-out pointer-events-none -z-0 ${
                    isArchExpanded
                      ? "opacity-0"
                      : "opacity-20 group-hover:opacity-100 group-hover:scale-105 group-hover:-rotate-3"
                  }`}
                >
                  <div
                    className={`absolute -left-4 top-1/2 -translate-y-1/2 w-20 h-20 ${shapeClass[project.shapeColors[1]]} rotate-45`}
                  />
                  <div
                    className={`absolute right-6 top-6 w-16 h-16 rounded-full ${shapeClass[project.shapeColors[0]]}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[auto_1.3fr_1fr_auto] gap-6 items-start">
                  <span className="relative font-mono text-xs opacity-75 font-bold pt-2 z-10 text-navy">
                    {String(project.id).padStart(2, "0")}
                  </span>

                  <div className="relative z-10">
                    <h3 className="relative inline-block font-display font-bold text-3xl md:text-4xl text-navy transition-all duration-300 group-hover:translate-x-1">
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
                          className="opacity-75 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                    </h3>
                    <p className="font-mono text-sm tracking-widest uppercase opacity-85 font-medium mt-1">
                      {project.type[language]} · {project.year}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tags.map((tTag) => (
                        <span
                          key={tTag}
                          className="font-mono text-xs tracking-wide uppercase border border-navy/35 rounded-full px-2.5 py-1 bg-navy/10 text-navy font-medium"
                        >
                          {tTag}
                        </span>
                      ))}
                    </div>

                    {project.metrics && project.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-navy/15">
                        {project.metrics.map((m, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy/10 border border-navy/25 font-mono text-xs text-navy"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-navy/80 shrink-0" />
                            <span className="opacity-90 font-medium">{m.label[language]}:</span>
                            <span className="font-semibold">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="relative text-sm leading-relaxed max-w-xs z-10 pt-2 text-navy/90 font-normal">
                    {project.description[language]}
                  </p>

                  <div className="project-actions relative z-20 flex flex-wrap md:flex-col items-start md:items-end gap-2.5 pt-2">
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.projects.viewGithubAria(project.title)}
                      className="project-primary-btn inline-flex items-center gap-2 px-4 py-2 rounded-full border border-navy/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 bg-navy/10 text-navy hover:bg-navy hover:text-cream group-hover:bg-navy group-hover:text-cream shadow-sm hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                    >
                      <Github size={14} className="shrink-0" />
                      <span>{t.projects.viewGithub}</span>
                      <ArrowUpRight size={13} className="shrink-0" />
                    </a>

                    {project.apiDocsLink && (
                      <a
                        href={project.apiDocsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t.projects.viewApiDocsAria(project.title)}
                        className="project-secondary-btn inline-flex items-center gap-2 px-4 py-2 rounded-full border border-navy/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 bg-navy/10 text-navy hover:bg-navy hover:text-cream shadow-sm hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                      >
                        <FileCode size={14} className="shrink-0" />
                        <span>{project.apiDocsLabel ? project.apiDocsLabel[language] : "API Docs"}</span>
                        <ArrowUpRight size={13} className="shrink-0" />
                      </a>
                    )}

                    {project.architecture && (
                      <button
                        onClick={() => toggleArchitecture(project.id)}
                        aria-expanded={isArchExpanded}
                        aria-controls={`arch-diagram-${project.id}`}
                        aria-label={t.projects.viewArchAria(project.title)}
                        className={`project-secondary-btn inline-flex items-center gap-2 px-4 py-2 rounded-full border border-navy/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy cursor-pointer ${
                          isArchExpanded
                            ? "bg-navy text-lime border-navy"
                            : "bg-lime text-navy hover:bg-navy hover:text-lime"
                        }`}
                      >
                        <Network size={14} className="shrink-0" />
                        <span>
                          {isArchExpanded
                            ? t.projects.hideArchitecture
                            : t.projects.viewArchitecture}
                        </span>
                        {isArchExpanded ? (
                          <ChevronUp size={13} className="shrink-0" />
                        ) : (
                          <ChevronDown size={13} className="shrink-0" />
                        )}
                      </button>
                    )}

                    {project.demoLink && (
                      <a
                        href={project.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t.projects.viewDemoAria(project.title)}
                        className="project-secondary-btn inline-flex items-center gap-2 px-4 py-2 rounded-full border border-navy/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 bg-lime text-navy hover:bg-navy hover:text-lime shadow-sm hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                      >
                        <span>{t.projects.viewDemo}</span>
                        <ArrowUpRight size={13} className="shrink-0" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Architecture Visualizer Drawer */}
                {isArchExpanded && project.architecture && (
                  <div
                    id={`arch-diagram-${project.id}`}
                    className="relative z-20 mt-6 p-6 rounded-xl bg-navy text-cream shadow-2xl border border-cream/20 animate-in fade-in slide-in-from-top-3 duration-300"
                  >
                    <div className="flex items-center gap-3 pb-4 border-b border-cream/15">
                      <div className="w-9 h-9 rounded-lg bg-lime/20 border border-lime/30 text-lime flex items-center justify-center">
                        <Network size={18} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-lg md:text-xl text-cream">
                          {project.architecture.title[language]}
                        </h4>
                        <p className="font-mono text-xs text-lime tracking-wider uppercase mt-0.5">
                          {t.projects.architectureFlowTitle} · Architecture Flow
                        </p>
                      </div>
                    </div>

                    {/* Interactive Visual & Monospace ASCII Architecture Flow */}
                    <ArchitectureVisualizer
                      project={project}
                      language={language}
                      copiedId={copiedId}
                      onCopyDiagram={() => handleCopyDiagram(project.architecture!.diagram, project.id)}
                      copyLabel={t.projects.copyDiagram}
                      copiedLabel={t.projects.copiedDiagram}
                    />

                    {/* Technical Highlights */}
                    {project.architecture.highlights && project.architecture.highlights.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-cream/15">
                        <h5 className="font-mono text-xs uppercase tracking-widest text-lime mb-3">
                          {t.projects.architectureHighlightsTitle}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {project.architecture.highlights.map((h, i) => (
                            <div
                              key={i}
                              className="p-3.5 rounded-lg bg-cream/[0.05] border border-cream/10 text-xs text-cream/85 leading-relaxed flex items-start gap-2.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-lime mt-1.5 shrink-0" />
                              <span>{h[language]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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