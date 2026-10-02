"use client";
import { useState } from "react";
import { Mail, Copy, Check, MapPin, Github, Linkedin } from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import SectionCut from "@/components/SectionCut";

const EMAIL = "gabrielbiellosousa@gmail.com";
const GITHUB_URL = "https://github.com/Coelho-G-Dev";
const LINKEDIN_URL = "https://www.linkedin.com/in/gabriel-coelho-7184a32a3/";

export default function Contact() {
  const { t } = useLanguage();
  const ref = useReveal<HTMLDivElement>();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  };

  return (
    <section
      id="contato"
      className="relative min-h-screen bg-lavender text-navy px-6 md:px-10 py-32 flex items-center overflow-hidden"
    >
      <SectionCut label={t.contact.cutLabel} color="cream" side="left" />
      <div
        className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full border-[10px] border-orange"
        aria-hidden="true"
      />
      <div ref={ref} className="reveal max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase mb-4">{t.contact.sectionNumber}</p>
          <h2 className="font-display font-black text-[13vw] md:text-6xl leading-[0.95]">
            {t.contact.titleLine1}{" "}
            <br />
            <span className="font-serif italic font-normal">{t.contact.titleHighlight}</span>
          </h2>
        </div>

        <div>
          <p className="text-lg leading-relaxed max-w-sm mb-8">
            {t.contact.text}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${EMAIL}`}
              aria-label={t.contact.emailAria}
              className="flex items-center gap-2 bg-navy text-cream rounded-full px-5 py-3 font-mono text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              <Mail size={14} /> {EMAIL}
            </a>
            <button
              onClick={copyEmail}
              aria-label={copyState === "copied" ? t.contact.copiedEmail : t.contact.copyEmail}
              className="w-11 h-11 rounded-full border border-navy/40 flex items-center justify-center hover:bg-navy hover:text-lavender transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy cursor-pointer"
            >
              <span aria-live="polite" className="sr-only">
                {copyState === "copied" && t.contact.copiedEmail}
                {copyState === "failed" && t.contact.failedCopy}
              </span>
              {copyState === "copied" ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.contact.githubAria}
              className="inline-flex items-center gap-2 border border-navy/40 rounded-full px-4 py-2 font-mono text-xs tracking-widest uppercase hover:bg-navy hover:text-lavender transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              <Github size={14} /> GitHub
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.contact.linkedinAria}
              className="inline-flex items-center gap-2 border border-navy/40 rounded-full px-4 py-2 font-mono text-xs tracking-widest uppercase hover:bg-navy hover:text-lavender transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              <Linkedin size={14} /> LinkedIn
            </a>
          </div>

          <p className="flex items-center gap-1.5 font-mono text-sm tracking-widest uppercase text-navy/90 font-medium mt-8">
            <MapPin size={12} /> {t.contact.location}
          </p>
        </div>
      </div>
    </section>
  );
}
