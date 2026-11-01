"use client";

import { useRef, type ReactNode } from "react";
import type { Contributions } from "@/lib/github";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { Chapter } from "./Chapter";
import { CortinaContext } from "./CortinaContext";
import Derrube from "./derrube/Derrube";
import Footer from "./Footer";
import Hero from "./Hero";
import { heroManifest } from "./heroAssets";
import Nav from "./Nav";
import Projetos from "./projetos/Projetos";
import About from "./sobre/About";
import Contact from "./sobre/Contact";
import HowIWork from "./trabalho/HowIWork";
import Services from "./trabalho/Services";
import { SiteCopyContext } from "./SiteCopyContext";
import { useCortina } from "./useCortina";

export default function SitePage({
  heroSlot,
  contributions,
}: {
  heroSlot?: ReactNode;
  contributions?: Contributions | null;
}) {
  const { language } = useLanguage();
  const c = siteCopy[language];
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
              <Projetos />
            </Chapter>
            <Chapter id="trabalho" tone="marfim">
              <HowIWork />
              <Services />
            </Chapter>
            <Chapter id="sobre" tone="bordo">
              <About contributions={contributions} />
              <Contact />
            </Chapter>
          </main>
          <Footer />
        </div>
      </CortinaContext.Provider>
    </SiteCopyContext.Provider>
  );
}
