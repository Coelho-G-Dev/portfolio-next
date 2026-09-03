"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { projects, type TileColor } from "@/data/projects";
import { useReveal } from "@/lib/useReveal";
import SectionCut from "@/components/SectionCut";

const shapeClass: Record<TileColor, string> = {
  lime: "bg-lime",
  blue: "bg-blue",
  orange: "bg-orange",
  lavender: "bg-lavender",
};

const filters = [
  { key: "all", label: "TUDO" },
  { key: "backend", label: "BACKEND" },
  { key: "ia", label: "IA" },
] as const;

export default function Projects() {
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const ref = useReveal<HTMLDivElement>();
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="trabalho" className="relative min-h-screen bg-orange text-navy px-6 md:px-10 py-32">
      <SectionCut label="primeiro corte" color="cream" side="right" />
      <div ref={ref} className="reveal max-w-5xl mx-auto">
        <p className="font-mono text-xs tracking-widest uppercase mb-4">01 — Sistemas recentes</p>
        <h2 className="font-display font-black text-[10vw] md:text-5xl leading-[0.95] mb-4">
          Sistemas que sobrevivem
          <br />
          <span className="font-serif italic font-normal">à primeira versão.</span>
        </h2>

        <div className="flex gap-6 font-mono text-xs tracking-widest uppercase mt-10 mb-2">
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

        <div className="divide-y divide-navy/20 border-t border-navy/20 mt-8">
          {visible.map((project) => (
            <div
              key={project.id}
              className="relative group grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto] gap-6 items-center py-8 px-4 -mx-4 overflow-hidden"
            >
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver ${project.title} no GitHub`}
                className="absolute inset-0"
              ></a>

              <span
                aria-hidden="true"
                className="absolute inset-0 bg-navy/[0.06] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out -z-10"
              />

              <div
                aria-hidden="true"
                className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 bg-navy rounded-md overflow-hidden transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3"
              >
                <div
                  className={`absolute -left-4 top-1/2 -translate-y-1/2 w-20 h-20 ${shapeClass[project.shapeColors[1]]} rotate-45`}
                />
                <div
                  className={`absolute right-6 top-6 w-16 h-16 rounded-full ${shapeClass[project.shapeColors[0]]}`}
                />
              </div>

              <span className="relative font-mono text-xs opacity-50">
                {String(project.id).padStart(2, "0")}
              </span>

              <div className="relative">
                <h3 className="relative inline-block font-display font-bold text-3xl md:text-4xl transition-colors duration-300 group-hover:text-lime">
                  {project.title}
                  <span className="absolute left-0 -bottom-1 h-[3px] w-full bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                </h3>
                <p className="font-mono text-sm tracking-widest uppercase opacity-60 mt-1">
                  {project.type} · {project.year}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-sm tracking-wide uppercase border border-navy/30 rounded-full px-3 py-1.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <p className="relative text-sm leading-relaxed max-w-xs">{project.description}</p>

              {project.demoLink && (
                <a
                  href={project.demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ver demonstração do projeto ${project.title}`}
                  className="relative md:absolute md:bottom-2 md:right-2 justify-self-end w-10 h-10 rounded-full border border-navy/40 flex items-center justify-center transition-all duration-300 hover:bg-navy hover:text-orange"
                >
                  <ArrowUpRight size={16} className="rotate-45" />
                </a>
              )}
            </div>
          ))}
        </div>

        <a
          href="https://github.com/Coelho-G-Dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase mt-10 border-b border-navy pb-1 hover:opacity-70 transition-opacity"
        >
          Ver todos os projetos <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}