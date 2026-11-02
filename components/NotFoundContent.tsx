"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Nav from "@/components/site/Nav";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";

export default function NotFoundContent() {
  const { language, t } = useLanguage();
  const c = siteCopy[language];

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
          {t.notFound.cutTag}
        </div>

        <h1 className="font-black leading-tight text-4xl md:text-6xl" style={{ color: "var(--c-ebano, #0E0F13)" }}>
          {t.notFound.title}
        </h1>

        <p className="font-serif italic font-normal text-2xl md:text-3xl mt-2" style={{ color: "var(--c-nogueira, #8A6A4A)" }}>
          {t.notFound.highlight}
        </p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mt-8 gap-8">
          <p className="max-w-md opacity-85 text-base md:text-lg leading-relaxed">
            {t.notFound.description}
          </p>

          <Link
            href="/"
            className="s-pill cursor-pointer w-fit"
            data-variant="primary"
            data-surface="light"
          >
            <ArrowLeft size={14} /> <span className="s-pill__label">{t.notFound.backHome}</span>
          </Link>
        </div>
      </main>
    </SiteCopyContext.Provider>
  );
}
