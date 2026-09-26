"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, translations, Translations } from "./translations";

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "preferred-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>("pt");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (savedLang === "pt" || savedLang === "en") {
        setLanguageState(savedLang);
      } else if (typeof navigator !== "undefined" && navigator.language) {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("en")) {
          setLanguageState("en");
        }
      }
    } catch {
      // Ignorar erros de acesso a localStorage
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignorar erros de gravação em localStorage
    }

    const expectedTitle = translations[language].pageTitle;
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";

    const syncTitle = () => {
      if (document.title !== expectedTitle) {
        document.title = expectedTitle;
      }
    };

    syncTitle();

    // Reafirma após a reconciliação assíncrona de metadados do Next.js
    const timer1 = setTimeout(syncTitle, 50);
    const timer2 = setTimeout(syncTitle, 200);
    const timer3 = setTimeout(syncTitle, 600);

    let observer: MutationObserver | null = null;
    try {
      const headEl = document.head;
      if (headEl && typeof MutationObserver !== "undefined") {
        observer = new MutationObserver(() => {
          if (document.title !== expectedTitle) {
            document.title = expectedTitle;
          }
        });
        observer.observe(headEl, {
          subtree: true,
          characterData: true,
          childList: true,
        });
      }
    } catch {
      // Fallback seguro
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      observer?.disconnect();
    };
  }, [language, mounted]);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "pt" ? "en" : "pt"));
  };

  const t = translations[language] as Translations;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage deve ser utilizado dentro de um LanguageProvider");
  }
  return context;
}
