"use client";
import { useState } from "react";
import { Mail, Copy, Check, MapPin } from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import SectionCut from "@/components/SectionCut";

const EMAIL = "gabrielbiellosousa@gmail.com";

export default function Contact() {
  const ref = useReveal<HTMLDivElement>();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="contato"
      className="relative min-h-screen bg-lavender text-navy px-6 md:px-10 py-32 flex items-center overflow-hidden"
    >
      <SectionCut label="quarto corte" color="cream" side="left" />
      {/* arco decorativo, canto inferior direito - visto no mockup de referência */}
      <div
        className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full border-[10px] border-orange"
        aria-hidden="true"
      />
      <div ref={ref} className="reveal max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase mb-4">04 — Próximo capítulo</p>
          <h2 className="font-display font-black text-[13vw] md:text-6xl leading-[0.95]">
            Tem uma
            <br />
            <span className="font-serif italic font-normal text-cream">boa ideia?</span>
          </h2>
        </div>

        <div>
          <p className="text-lg leading-relaxed max-w-sm mb-8">
            Me conta o que você está tentando construir. Eu respondo com atenção, mesmo que a
            resposta seja um &ldquo;ainda não&rdquo;.
          </p>

          <div className="flex items-center gap-3">
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 bg-navy text-cream rounded-full px-5 py-3 font-mono text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              <Mail size={14} /> {EMAIL}
            </a>
            <button
              onClick={copyEmail}
              aria-label={copied ? "E-mail copiado" : "Copiar e-mail"}
              className="w-11 h-11 rounded-full border border-navy/40 flex items-center justify-center hover:bg-navy hover:text-lavender transition-colors"
            >
              <span aria-live="polite" className="sr-only">
                {copied ? "E-mail copiado" : ""}
              </span>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <p className="flex items-center gap-1.5 font-mono text-sm tracking-widest uppercase opacity-70 mt-8">
            <MapPin size={12} /> São Luís, Brasil · UTC-3
          </p>
        </div>
      </div>
    </section>
  );
}
