"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { Chapter, Section } from "./Chapter";
import Nav from "./Nav";
import { SiteCopyContext } from "./SiteCopyContext";

export default function SitePage({ heroSlot }: { heroSlot?: ReactNode }) {
  const { language } = useLanguage();
  const c = siteCopy[language];
  const s = c.sections;

  return (
    <SiteCopyContext.Provider value={c}>
      <Nav />
      {heroSlot ?? (
        <header id="inicio" className="s-hero">
          <h1>{c.hero.name}</h1>
          <p>{c.hero.intro}</p>
        </header>
      )}
      <main id="main-content">
        {/* Capítulos e fundos na ordem da spec §5.3. */}
        <Chapter tone="nogueiraEscura">
          <Section id="derrube" title={s.derrube.title}>
            <p>{s.derrube.soon}</p>
          </Section>
        </Chapter>
        <Chapter tone="ebano">
          <Section id="projetos" title={s.projetos.title}>
            <p>{s.projetos.soon}</p>
          </Section>
        </Chapter>
        <Chapter tone="marfim">
          <Section id="como-trabalho" title={s.comoTrabalho.title}>
            <p>{s.comoTrabalho.soon}</p>
          </Section>
          <Section id="o-que-resolvo" title={s.oQueResolvo.title}>
            <p>{s.oQueResolvo.soon}</p>
          </Section>
        </Chapter>
        <Chapter tone="bordo">
          <Section id="sobre" title={s.sobre.title}>
            <p>{s.sobre.soon}</p>
          </Section>
          <Section id="contato" title={s.contato.title}>
            <p>{s.contato.soon}</p>
          </Section>
        </Chapter>
      </main>
      <footer className="s-footer">
        <h2 className="sr-only">{c.footer.title}</h2>
      </footer>
    </SiteCopyContext.Provider>
  );
}
