"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFoundContent() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 bg-navy text-cream overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(242,234,220,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div className="flex items-center gap-2 font-mono text-sm tracking-widest uppercase text-cream/70 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-lime" />
          {t.notFound.cutTag}
        </div>

        <h1 className="font-display font-black leading-[0.95] text-[22vw] md:text-[10vw]">
          {t.notFound.title}
        </h1>

        <p className="font-serif italic font-normal text-lime text-[10vw] md:text-[4vw] leading-none mt-2">
          {t.notFound.highlight}
        </p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mt-12 gap-8">
          <p className="max-w-sm text-cream/80 text-lg leading-relaxed">
            {t.notFound.description}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-lime text-lime rounded-full px-5 py-3 font-mono text-xs tracking-widest uppercase hover:bg-lime hover:text-navy transition-colors w-fit"
          >
            <ArrowLeft size={14} /> {t.notFound.backHome}
          </Link>
        </div>
      </main>
    </>
  );
}
