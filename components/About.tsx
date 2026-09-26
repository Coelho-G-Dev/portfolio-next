"use client";
import { Github, Linkedin } from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import SectionCut from "@/components/SectionCut";

export default function About() {
  const { t } = useLanguage();
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="sobre" className="relative min-h-screen bg-lime text-navy px-6 md:px-10 py-32 overflow-hidden">
      <SectionCut label={t.about.cutLabel} color="lavender" side="right" />
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-lavender rotate-45" aria-hidden />
      <div ref={ref} className="reveal max-w-5xl mx-auto grid md:grid-cols-[0.9fr_1.1fr] gap-16 items-start">
        <div className="relative aspect-square bg-navy rounded-md overflow-hidden flex flex-col justify-between p-6 md:p-8">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute w-[140%] h-12 bg-orange/80 rotate-45 top-1/3 -left-10" />
            <div className="absolute w-[140%] h-12 bg-blue/80 -rotate-45 top-1/3 -left-10" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(242,234,220,0.2) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" aria-hidden="true" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-cream/90">
                UFMA · C&T
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded border border-cream/20 text-cream/80 bg-navy/70 backdrop-blur-sm">
              BACKEND & IA
            </span>
          </div>

          <div className="relative z-10 bg-navy/80 backdrop-blur-md p-4 rounded border border-cream/20">
            <span className="block font-mono text-[10px] tracking-widest uppercase text-lime mb-1">
              {t.about.badgeTag}
            </span>
            <span className="font-serif italic text-2xl text-cream block leading-snug">
              {t.about.badgeHighlight}
            </span>
          </div>
        </div>

        <div>
          <p className="font-mono text-xs tracking-widest uppercase mb-4">{t.about.sectionNumber}</p>
          <h2 className="font-display font-black text-[8vw] md:text-4xl leading-tight mb-8">
            {t.about.highlight}
          </h2>

          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-navy/20">
            <div>
              <p className="font-mono text-sm tracking-widest uppercase mb-2">{t.about.workshopTitle}</p>
              <p className="text-base leading-relaxed">
                {t.about.workshopText}
              </p>
            </div>
            <div>
              <p className="font-mono text-sm tracking-widest uppercase mb-2">{t.about.offScreenTitle}</p>
              <p className="text-base leading-relaxed">
                {t.about.offScreenText}
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
