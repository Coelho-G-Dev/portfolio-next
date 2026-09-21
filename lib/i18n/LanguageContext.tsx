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
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignorar erros de gravação em localStorage
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
    }
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
