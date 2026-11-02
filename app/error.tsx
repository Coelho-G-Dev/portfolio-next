"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Nav from "@/components/site/Nav";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language, t } = useLanguage();
  const c = siteCopy[language];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SiteCopyContext.Provider value={c}>
      <Nav />
      <main
        id="main-content"
        className="relative min-h-[70vh] flex flex-col justify-center px-6 md:px-12 py-16"
        style={{ background: "var(--c-marfim, #F4EEE3)", color: "var(--c-ebano, #0E0F13)" }}
      >
        <div className="flex items-center gap-2 font-mono text-sm tracking-widest uppercase mb-6" style={{ color: "var(--c-nogueira, #8A6A4A)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--c-ambar, #F5A524)" }} />
          {t.error.cutTag}
        </div>

        <h1 className="font-black leading-tight text-4xl md:text-6xl" style={{ color: "var(--c-ebano, #0E0F13)" }}>
          {t.error.titleLine1}{" "}
          <span style={{ color: "var(--c-nogueira, #8A6A4A)" }}>{t.error.titleHighlight}</span>
        </h1>

        <p className="max-w-md opacity-85 text-base md:text-lg leading-relaxed mt-6">
          {t.error.description}
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <button
            onClick={reset}
            type="button"
            className="s-pill cursor-pointer"
            data-variant="primary"
            data-surface="light"
          >
            <RotateCcw size={14} /> <span className="s-pill__label">{t.error.retry}</span>
          </button>
          <Link
            href="/"
            className="s-pill cursor-pointer"
            data-variant="secondary"
            data-surface="light"
          >
            <ArrowLeft size={14} /> <span className="s-pill__label">{t.error.backHome}</span>
          </Link>
        </div>
      </main>
    </SiteCopyContext.Provider>
  );
}
