"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Terminal,
  Search,
  X,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Cpu,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type TechDomainKey = "ia" | "backend" | "messaging" | "database" | "infra";

export interface TechDomainDef {
  key: TechDomainKey;
  dotColor: string;
  textColor: string;
  borderColor: string;
  tags: string[];
}

export const TECH_DOMAINS: TechDomainDef[] = [
  {
    key: "ia",
    dotColor: "bg-lavender",
    textColor: "text-lavender",
    borderColor: "border-lavender/30",
    tags: ["pgvector", "Gemini AI"],
  },
  {
    key: "backend",
    dotColor: "bg-lime",
    textColor: "text-lime",
    borderColor: "border-lime/30",
    tags: ["Python", "FastAPI", "Node.js", "TypeScript", "Express"],
  },
  {
    key: "messaging",
    dotColor: "bg-orange",
    textColor: "text-orange",
    borderColor: "border-orange/30",
    tags: ["RabbitMQ", "Redis"],
  },
  {
    key: "database",
    dotColor: "bg-blue-400",
    textColor: "text-blue-300",
    borderColor: "border-blue-400/30",
    tags: ["PostgreSQL", "MongoDB", "Mongoose"],
  },
  {
    key: "infra",
    dotColor: "bg-cream",
    textColor: "text-cream/90",
    borderColor: "border-cream/30",
    tags: ["Docker", "Jest", "JWT", "Google Maps Platform"],
  },
];

interface StackFilterConsoleProps {
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: string[];
  tagCounts: Record<string, number>;
  totalProjects: number;
}

export default function StackFilterConsole({
  selectedTag,
  onSelectTag,
  allTags,
  tagCounts,
  totalProjects,
}: StackFilterConsoleProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown, true);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  // Filtered domains and tags based on search
  const filteredDomains = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TECH_DOMAINS.map((domain) => {
      const matchingTags = domain.tags.filter((tag) => {
        const matchesQuery = q === "" || tag.toLowerCase().includes(q);
        const existsInProject = allTags.includes(tag);
        return matchesQuery && existsInProject;
      });
      return {
        ...domain,
        matchingTags,
      };
    }).filter((domain) => domain.matchingTags.length > 0);
  }, [searchQuery, allTags]);

  const totalMatchingTags = useMemo(() => {
    return filteredDomains.reduce((acc, curr) => acc + curr.matchingTags.length, 0);
  }, [filteredDomains]);

  const handleSelect = (tag: string) => {
    if (selectedTag === tag) {
      onSelectTag(null);
    } else {
      onSelectTag(tag);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    onSelectTag(null);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      {selectedTag === null ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all duration-200 shadow-sm cursor-pointer group ${
            isOpen
              ? "bg-navy text-lime border-navy font-bold shadow-md"
              : "border-navy/35 bg-navy/10 hover:bg-navy hover:text-cream text-navy font-semibold"
          }`}
        >
          <Cpu size={13} className={`transition-colors ${isOpen ? "text-lime" : "text-navy group-hover:text-lime"}`} />
          <span>{t.projects.stackFilter.triggerLabel}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            isOpen ? "bg-lime/20 text-lime" : "bg-navy/15 group-hover:bg-cream/20 text-navy group-hover:text-cream"
          }`}>
            {allTags.length}
          </span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 opacity-70 group-hover:opacity-100 ${
              isOpen ? "rotate-180 text-lime" : ""
            }`}
          />
        </button>
      ) : (
        <div className="inline-flex items-center gap-1.5 p-1 pl-3 pr-1.5 rounded-full bg-navy text-cream font-mono text-xs shadow-md border border-navy animate-in fade-in duration-200">
          <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse shrink-0" />
          <span className="text-lime font-bold">{selectedTag}</span>
          <span className="opacity-75 text-[11px] font-normal">
            ({tagCounts[selectedTag] || 1})
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded-full hover:bg-cream/20 text-cream/80 hover:text-cream transition-colors cursor-pointer"
            title={t.projects.stackFilter.clearFilter}
            aria-label={t.projects.stackFilter.clearFilter}
          >
            <X size={12} />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-full hover:bg-cream/20 text-cream/70 hover:text-cream transition-colors cursor-pointer"
            title={t.projects.stackFilter.triggerLabel}
            aria-label={t.projects.stackFilter.triggerLabel}
          >
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}

      {/* Dev Console Popover Panel */}
      {isOpen && (
        <>
          {/* Mobile Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            style={{ backgroundColor: "#12222D" }}
            className="fixed inset-x-3 top-24 bottom-auto max-h-[82vh] z-50 sm:absolute sm:inset-auto sm:right-0 sm:left-auto sm:top-full sm:mt-2 sm:w-[420px] sm:max-w-md bg-navy border-2 border-cream/30 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-4 text-cream flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Top Bar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cream/20 shrink-0">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-lime shrink-0" />
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-cream">
                  {t.projects.stackFilter.consoleTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-cream/15 text-cream border border-cream/20 font-semibold">
                  {t.projects.stackFilter.countBadge(allTags.length, totalProjects)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-cream/15 text-cream/70 hover:text-cream transition-colors cursor-pointer"
                  title={t.projects.stackFilter.closeConsole}
                  aria-label={t.projects.stackFilter.closeConsole}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Quick Search Input */}
            <div className="relative mt-3">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.projects.stackFilter.searchPlaceholder}
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-black/40 border border-cream/25 focus:border-lime focus:outline-none text-cream placeholder:text-cream/50 font-mono text-xs transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cream/50 hover:text-cream p-0.5 rounded cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Quick Reset All Action (when filter is applied) */}
            {selectedTag && (
              <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-lime/15 border border-lime/40 text-lime font-mono text-xs">
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles size={12} />
                  <span>{selectedTag} ativo</span>
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-lime text-navy font-bold text-[11px] hover:bg-lime/90 transition-colors cursor-pointer shadow-sm"
                >
                  <RotateCcw size={11} />
                  <span>{t.projects.stackFilter.clearFilter}</span>
                </button>
              </div>
            )}

            {/* Domain Groups Container */}
            <div className="mt-3.5 space-y-3.5 max-h-[340px] overflow-y-auto pr-1 custom-dark-scrollbar">
              {totalMatchingTags === 0 ? (
                <div className="py-6 text-center font-mono text-xs text-cream/60">
                  <p>{t.projects.stackFilter.emptySearch}</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-lime hover:underline font-semibold cursor-pointer"
                  >
                    Limpar busca
                  </button>
                </div>
              ) : (
                filteredDomains.map((domain) => {
                  const domainTitle = t.projects.stackFilter.domains[domain.key];
                  return (
                    <div key={domain.key} className="space-y-1.5">
                      {/* Domain Subheading */}
                      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider font-bold px-0.5">
                        <span className={`w-2 h-2 rounded-full ${domain.dotColor} shadow-sm`} />
                        <span className={domain.textColor}>{domainTitle}</span>
                      </div>

                      {/* Tags Grid */}
                      <div className="flex flex-wrap gap-1.5">
                        {domain.matchingTags.map((tag) => {
                          const isSelected = selectedTag === tag;
                          const count = tagCounts[tag] || 0;

                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleSelect(tag)}
                              aria-pressed={isSelected}
                              className={`group inline-flex items-center gap-2 font-mono text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? "bg-lime text-navy border-lime font-bold shadow-md"
                                  : "bg-black/40 text-cream border-cream/25 hover:bg-cream/15 hover:border-cream/50 hover:text-white font-medium"
                              }`}
                            >
                              <span>{tag}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-bold transition-colors ${
                                  isSelected
                                    ? "bg-navy/25 text-navy"
                                    : "bg-cream/20 text-cream group-hover:bg-cream/30"
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Bar */}
            <div className="mt-3.5 pt-2.5 border-t border-cream/15 flex items-center justify-between font-mono text-[10px] text-cream/60">
              <span className="font-medium">Gabriel Coelho · Portfolio Dev</span>
              <kbd className="px-1.5 py-0.5 rounded bg-cream/15 border border-cream/20 text-cream font-mono font-bold">
                {t.projects.stackFilter.escShortcut}
              </kbd>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
