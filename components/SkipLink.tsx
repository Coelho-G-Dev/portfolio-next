"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:z-50 focus:bg-navy focus:text-cream focus:p-2 focus:m-2 focus:border focus:border-cream focus:rounded"
    >
      {t.nav.skipLink}
    </a>
  );
}
