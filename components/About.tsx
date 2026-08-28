"use client";
import { Github, Linkedin } from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import SectionCut from "@/components/SectionCut";

export default function About() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="sobre" className="relative min-h-screen bg-lime text-navy px-6 md:px-10 py-32 overflow-hidden">
      <SectionCut label="terceiro corte" color="lavender" side="right" />
      {/* losango vazando do canto - visto no mockup de referência */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-lavender rotate-45" aria-hidden />
      <div ref={ref} className="reveal max-w-5xl mx-auto grid md:grid-cols-[0.9fr_1.1fr] gap-16 items-start">
        <div className="relative aspect-square bg-navy rounded-md overflow-hidden flex flex-col justify-end p-6">
          <div className="absolute inset-0">
            <div className="absolute w-[140%] h-10 bg-orange/80 rotate-45 top-1/3 -left-10" />
            <div className="absolute w-[140%] h-10 bg-blue/80 -rotate-45 top-1/3 -left-10" />
          </div>
          <span className="relative font-mono text-[10px] tracking-widest uppercase text-cream/70">
            Arquivo pessoal
          </span>
          <span className="relative font-serif italic text-2xl text-cream">não é só código.</span>
        </div>

        <div>
          <p className="font-mono text-xs tracking-widest uppercase mb-4">03 — Sobre mim</p>
          <h2 className="font-display font-black text-[8vw] md:text-4xl leading-tight mb-8">
            Venho da logística antes do código — gosto de sistemas que têm ordem por trás, mesmo
            quando a superfície parece simples.
          </h2>

          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-navy/20">
            <div>
              <p className="font-mono text-[11px] tracking-widest uppercase mb-2">Na bancada</p>
              <p className="text-sm leading-relaxed">
                Node.js, TypeScript, PostgreSQL, MongoDB, Java/Spring Boot, Docker.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest uppercase mb-2">Fora da tela</p>
              <p className="text-sm leading-relaxed">
                Sou praticante de Powerlifting e xadrez, aprendendo sobre  progressão disciplinada e a pensar
                várias jogadas à frente.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <a
              href="https://github.com/Coelho-G-Dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-10 h-10 rounded-full border border-navy/40 flex items-center justify-center hover:bg-navy hover:text-lime transition-colors"
            >
              <Github size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/gabriel-coelho-7184a32a3/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full border border-navy/40 flex items-center justify-center hover:bg-navy hover:text-lime transition-colors"
            >
              <Linkedin size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
