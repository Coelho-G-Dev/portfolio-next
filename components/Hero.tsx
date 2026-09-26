"use client";
import { ArrowDown, Github, Linkedin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const GITHUB_URL = "https://github.com/Coelho-G-Dev";
const LINKEDIN_URL = "https://www.linkedin.com/in/gabriel-coelho-7184a32a3/";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 bg-navy text-cream overflow-hidden pt-20 md:pt-0"
      aria-label="Hero"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(242,234,220,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="hidden md:flex flex-col items-center absolute top-32 right-24 text-lime" aria-hidden="true">
        <span className="font-mono text-[10px] tracking-widest lowercase mb-3">{t.hero.badge}</span>
        <div className="w-32 h-32 rounded-full border border-dashed border-lime/60 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" aria-hidden="true" />
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-base tracking-widest uppercase text-cream/70 mb-8" aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-lime" aria-hidden="true" />
        {t.hero.location}
      </div>

      <h1 className="font-display font-black leading-[0.95] text-[15vw] md:text-[7vw]">
        {t.hero.titleLine1}
        <br />
        <span className="font-serif italic font-normal text-lime">{t.hero.titleHighlight}</span>
      </h1>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between mt-12 gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <a
            href="#trabalho"
            className="inline-flex items-center gap-2 bg-lime text-navy px-5 py-3 rounded-full font-mono text-xs font-bold tracking-widest uppercase hover:bg-cream transition-all duration-300 shadow-md group w-fit"
          >
            <span>{t.hero.ctaProjects}</span>
            <ArrowDown size={14} className="transition-transform group-hover:translate-y-0.5" />
          </a>

          <div className="flex items-center gap-2.5">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-cream/20 font-mono text-xs tracking-wider uppercase text-cream/80 hover:text-navy hover:bg-cream hover:border-cream transition-all duration-200"
            >
              <Github size={13} />
              <span>{t.hero.viewGithub}</span>
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-cream/20 font-mono text-xs tracking-wider uppercase text-cream/80 hover:text-navy hover:bg-cream hover:border-cream transition-all duration-200"
            >
              <Linkedin size={13} />
              <span>{t.hero.viewLinkedin}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3 max-w-sm">
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="block w-16 h-px bg-cream/40" />
            <span className="font-mono text-xs tracking-widest">{t.hero.counter}</span>
          </div>
          <p className="text-cream/80 text-base md:text-lg leading-relaxed md:text-right">
            {t.hero.bio}
          </p>
        </div>
      </div>
    </section>
  );
}
