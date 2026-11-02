"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:p-3 focus:rounded-lg focus:border focus:shadow-lg transition-all"
      style={{
        backgroundColor: "var(--c-ebano, #0E0F13)",
        color: "var(--c-marfim, #F4EEE3)",
        borderColor: "var(--c-ambar, #F5A524)",
      }}
    >
      {t.nav.skipLink}
    </a>
  );
}
