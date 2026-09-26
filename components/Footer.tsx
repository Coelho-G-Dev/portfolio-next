"use client";

import { ArrowUp, Github, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const EMAIL = "gabrielbiellosousa@gmail.com";
const GITHUB_URL = "https://github.com/Coelho-G-Dev";
const LINKEDIN_URL = "https://www.linkedin.com/in/gabriel-coelho-7184a32a3/";

export default function Footer() {
  const { t } = useLanguage();

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-navy text-cream border-t border-cream/10 px-6 md:px-10 py-16 overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        {/* Topo do Footer: Identidade, Status e Ação de Voltar ao Topo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-cream/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-full border border-cream/40 flex items-center justify-center font-mono text-xs font-bold text-lime">
                GC
              </span>
              <span className="font-display font-black text-2xl tracking-tight">Gabriel Coelho</span>
            </div>
            <p className="font-mono text-xs text-cream/70 tracking-widest uppercase">
              // {t.footer.tagline}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime/30 bg-lime/10 font-mono text-xs text-lime">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" aria-hidden="true" />
              <span>{t.footer.status}</span>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-cream/80 hover:text-lime transition-colors group"
              aria-label={t.footer.backToTop}
            >
              <span>{t.footer.backToTop}</span>
              <ArrowUp size={14} className="transition-transform group-hover:-translate-y-1" />
            </button>
          </div>
        </div>

        {/* Meio: Links Rápidos & Redes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cream/20 font-mono text-xs tracking-wider uppercase text-cream/80 hover:text-navy hover:bg-lime hover:border-lime transition-all duration-300"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cream/20 font-mono text-xs tracking-wider uppercase text-cream/80 hover:text-navy hover:bg-lime hover:border-lime transition-all duration-300"
            >
              <Linkedin size={14} />
              <span>LinkedIn</span>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              aria-label="E-mail"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cream/20 font-mono text-xs tracking-wider uppercase text-cream/80 hover:text-navy hover:bg-lime hover:border-lime transition-all duration-300"
            >
              <Mail size={14} />
              <span>E-mail</span>
            </a>
          </div>

          <p className="font-mono text-xs text-cream/50 tracking-wide">
            {t.footer.builtWith}
          </p>
        </div>

        {/* Base: Copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-cream/40 pt-6 border-t border-cream/5">
          <p>© {currentYear} Gabriel Coelho. {t.footer.rights}</p>
          <p>São Luís · Maranhão — Brasil</p>
        </div>
      </div>
    </footer>
  );
}
