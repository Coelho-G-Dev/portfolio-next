"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import { useReveal } from "@/lib/useReveal";
import SectionCut from "@/components/SectionCut";

const shapeClass: Record<string, string> = {
  lime: "bg-lime",
  blue: "bg-blue",
  orange: "bg-orange",
  lavender: "bg-lavender",
};

function ProjectTile({ colors }: { colors: [string, string] }) {
  return (
    <div className="relative w-full h-full bg-navy overflow-hidden rounded-md">
      <div
        className={`absolute -left-4 top-1/2 -translate-y-1/2 w-20 h-20 ${shapeClass[colors[1]]} rotate-45`}
      />
      <div className={`absolute right-6 top-6 w-16 h-16 rounded-full ${shapeClass[colors[0]]}`} />
    </div>
  );
}

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
            <a
              key={project.id}
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto] gap-6 items-center py-8 px-4 -mx-4 overflow-hidden"
            >
              {/* sweep: um bloco sólido "corta" da esquerda pra direita no hover, ecoando o motivo de cor da identidade */}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-navy/[0.06] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out -z-10"
              />

              <span className="font-mono text-xs opacity-50">
                {String(project.id).padStart(2, "0")}
              </span>

              <div>
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

              <p className="text-sm leading-relaxed max-w-xs">{project.description}</p>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 hidden md:block transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3">
                  <ProjectTile colors={project.shapeColors} />
                </div>
                <span className="w-10 h-10 rounded-full border border-navy/40 flex items-center justify-center transition-all duration-300 group-hover:bg-navy group-hover:text-orange group-hover:rotate-45">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </a>
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
