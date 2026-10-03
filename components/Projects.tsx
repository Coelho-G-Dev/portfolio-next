"use client";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowUpRight,
  Github,
  FileCode,
  Network,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
} from "lucide-react";
import { projects, type TileColor } from "@/data/projects";
import { useReveal } from "@/lib/useReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import SectionCut from "@/components/SectionCut";
import ArchitectureVisualizer from "@/components/ArchitectureVisualizer";
import StackFilterConsole from "@/components/StackFilterConsole";

const shapeClass: Record<TileColor, string> = {
  lime: "bg-lime",
  blue: "bg-blue",
  orange: "bg-orange",
  lavender: "bg-lavender",
};

export default function Projects() {
  const { language, t } = useLanguage();
  const [categoryFilter, setCategoryFilter] = useState<"all" | "backend" | "ia">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedArchId, setExpandedArchId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const ref = useReveal<HTMLDivElement>();

  // Extract all unique tags across projects
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tags.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, []);

  // Count projects per tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      p.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, []);

  // Count projects per category
  const categoryCounts = useMemo(() => {
    return {
      all: projects.length,
      backend: projects.filter((p) => p.category === "backend").length,
      ia: projects.filter((p) => p.category === "ia").length,
    };
  }, []);

  // Filter projects by category and tag
  const visible = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchesTag = selectedTag === null || p.tags.includes(selectedTag);
      return matchesCategory && matchesTag;
    });
  }, [categoryFilter, selectedTag]);

  // Opção 08: Global Esc shortcut to collapse active architecture drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expandedArchId !== null) {
        // If a fullscreen modal is open, let the modal handle its own Esc
        const hasOpenModal = document.querySelector('[role="dialog"]');
        if (!hasOpenModal) {
          setExpandedArchId(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedArchId]);

  const categoryFilters = [
    { key: "all", label: t.projects.filters.all },
    { key: "backend", label: t.projects.filters.backend },
    { key: "ia", label: t.projects.filters.ia },
  ] as const;

  const toggleArchitecture = (id: number) => {
    setExpandedArchId((prev) => (prev === id ? null : id));
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  };

  const resetAllFilters = () => {
    setCategoryFilter("all");
    setSelectedTag(null);
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

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-10 mb-5">
          {/* Category Tabs with Counts */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-mono text-xs tracking-widest uppercase">
            {categoryFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setCategoryFilter(f.key)}
                aria-pressed={categoryFilter === f.key}
                className={`pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  categoryFilter === f.key
                    ? "border-navy text-navy font-bold"
                    : "border-transparent opacity-80 hover:opacity-100 font-medium"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold transition-colors ${
                    categoryFilter === f.key ? "bg-navy text-cream" : "bg-navy/15 text-navy"
                  }`}
                >
                  {categoryCounts[f.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Right Toolbar Actions: Dev Console Stack Filter & Click Hint */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            <StackFilterConsole
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              allTags={allTags}
              tagCounts={tagCounts}
              totalProjects={projects.length}
            />

            <div className="hidden lg:inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase border border-navy/30 rounded-full px-3 py-1 bg-navy/10 text-navy font-medium shrink-0">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-navy animate-pulse" aria-hidden="true" />
              <span>{t.projects.clickHint}</span>
            </div>
          </div>
        </div>

        {/* Active Filter Notification Banner */}
        {selectedTag && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 px-4 py-2.5 rounded-xl bg-navy text-cream font-mono text-xs shadow-md border border-navy/20 animate-in fade-in duration-200 mb-6">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse shrink-0" />
              <span className="leading-snug break-words">
                {t.projects.stackFilter.activeFilterBanner(selectedTag, visible.length)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="self-end sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-cream/10 hover:bg-cream/20 text-cream transition-colors cursor-pointer shrink-0"
              aria-label={t.projects.stackFilter.clearFilter}
            >
              <X size={12} />
              <span>{t.projects.stackFilter.clearFilter}</span>
            </button>
          </div>
        )}

        {/* Project List */}
        <div className="divide-y divide-navy/20 border-t border-navy/20 mt-6">
          {visible.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center flex flex-col items-center gap-3">
              <p className="font-display font-bold text-2xl text-navy">{t.projects.noProjectsFoundTitle}</p>
              <p className="font-mono text-sm text-navy/70 max-w-md">{t.projects.noProjectsFoundDesc}</p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy text-lime font-mono text-xs uppercase tracking-wider font-bold hover:bg-navy/90 transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>{t.projects.resetAllFilters}</span>
              </button>
            </div>
          ) : (
            visible.map((project) => {
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

                      {/* Interactive Tags on Card */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.tags.map((tTag) => {
                          const isTagSelected = selectedTag === tTag;
                          return (
                            <button
                              key={tTag}
                              type="button"
                              onClick={() => handleTagClick(tTag)}
                              aria-pressed={isTagSelected}
                              title={language === "pt" ? `Filtrar por ${tTag}` : `Filter by ${tTag}`}
                              className={`font-mono text-xs tracking-wide uppercase border rounded-full px-2.5 py-1 transition-all duration-200 cursor-pointer ${
                                isTagSelected
                                  ? "bg-navy text-lime border-navy font-bold shadow-sm"
                                  : "border-navy/35 bg-navy/10 text-navy font-medium hover:bg-navy hover:text-cream hover:border-navy"
                              }`}
                            >
                              {tTag}
                            </button>
                          );
                        })}
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
                              <span className="font-semibold">
                                {typeof m.value === "string" ? m.value : m.value[language]}
                              </span>
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
                              ? `${t.projects.hideArchitecture} (${t.projects.escHint})`
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

                  {/* Opção 07: Architecture Visualizer Drawer with Smooth CSS Grid Transition */}
                  {project.architecture && (
                    <div
                      className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${
                        isArchExpanded
                          ? "grid-rows-[1fr] opacity-100 mt-6"
                          : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
                      }`}
                    >
                      <div className="overflow-hidden min-h-0">
                        <div
                          id={`arch-diagram-${project.id}`}
                          className="relative z-20 p-4 sm:p-6 rounded-xl bg-navy text-cream shadow-2xl border border-cream/20"
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
                                {t.projects.architectureFlowTitle}
                              </p>
                            </div>
                          </div>

                          {/* Interactive Visual & Monospace ASCII Architecture Flow */}
                          <ArchitectureVisualizer
                            project={project}
                            language={language}
                            copiedId={copiedId}
                            onCopyDiagram={() =>
                              handleCopyDiagram(
                                typeof project.architecture!.diagram === "string"
                                  ? project.architecture!.diagram
                                  : project.architecture!.diagram[language],
                                project.id
                              )
                            }
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
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}