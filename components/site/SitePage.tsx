"use client";

import { useRef, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { Chapter, Section } from "./Chapter";
import { CortinaContext } from "./CortinaContext";
import Derrube from "./derrube/Derrube";
import Hero from "./Hero";
import { heroManifest } from "./heroAssets";
import Nav from "./Nav";
import { SiteCopyContext } from "./SiteCopyContext";
import { useCortina } from "./useCortina";

export default function SitePage({ heroSlot }: { heroSlot?: ReactNode }) {
  const { language } = useLanguage();
  const c = siteCopy[language];
  const s = c.sections;
  const root = useRef<HTMLDivElement>(null);
  const covered = useCortina(root);

  return (
    <SiteCopyContext.Provider value={c}>
      <CortinaContext.Provider value={covered}>
        <div className="s-cortina" ref={root}>
          {/* Menu e abertura dividem o fundo do vídeo do personagem. */}
          <Chapter
            id="abertura"
            tone="marfim"
            style={{ backgroundColor: heroManifest.bg }}
          >
            <Nav />
            {heroSlot ?? <Hero />}
          </Chapter>
          <main id="main-content">
            {/* Capítulos e fundos na ordem da spec §5.3. */}
            <Chapter id="derrube" tone="nogueiraEscura">
              <Derrube />
            </Chapter>
            <Chapter id="projetos" tone="ebano">
              <Section id="projetos" title={s.projetos.title}>
                <p>{s.projetos.soon}</p>
              </Section>
            </Chapter>
            <Chapter id="trabalho" tone="marfim">
              <Section id="como-trabalho" title={s.comoTrabalho.title}>
                <p>{s.comoTrabalho.soon}</p>
              </Section>
              <Section id="o-que-resolvo" title={s.oQueResolvo.title}>
                <p>{s.oQueResolvo.soon}</p>
              </Section>
            </Chapter>
            <Chapter id="sobre" tone="bordo">
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
        </div>
      </CortinaContext.Provider>
    </SiteCopyContext.Provider>
  );
}
