import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Character from "@/components/site/Character";
import Projetos from "@/components/site/projetos/Projetos";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import Services from "@/components/site/trabalho/Services";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";

// Textos que já estiveram fixos em português dentro dos componentes.
const FIXED_PT = [
  "Explorar faceta",
  "Sistemas & Resiliência",
  "IA Aplicada & RAG",
  "Pronto para conferir as outras facetas de arquitetura?",
  "Voltar ao topo da seção",
  "Topo",
  "Vamos conversar",
];

function inEnglish(ui: React.ReactNode) {
  localStorage.setItem("preferred-language", "en");
  return (
    <LanguageProvider>
      <SiteCopyContext.Provider value={siteCopy.en}>{ui}</SiteCopyContext.Provider>
    </LanguageProvider>
  );
}

function expectNoFixedPt() {
  for (const text of FIXED_PT) {
    expect(screen.queryByText(text, { exact: false }), text).not.toBeInTheDocument();
  }
}

describe("em EN, nenhum texto fixo em português", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("portas fechadas", () => {
    render(inEnglish(<Projetos lang="en" />));
    expectNoFixedPt();
    expect(screen.getAllByText(siteCopy.en.projetos.explore).length).toBe(3);
  });

  it("painel aberto", () => {
    render(inEnglish(<Projetos lang="en" />));
    fireEvent.click(
      screen.getByRole("button", { name: siteCopy.en.projetos.open(siteCopy.en.projetos.doors.backend.name) }),
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expectNoFixedPt();
    expect(screen.getByText(siteCopy.en.projetos.panel.footerText)).toBeInTheDocument();
  });

  it("serviços", () => {
    render(inEnglish(<Services />));
    expectNoFixedPt();
    expect(screen.getByText(siteCopy.en.services.talk)).toBeInTheDocument();
  });

  it("rótulo do personagem", () => {
    render(inEnglish(<Character paused />));
    const label = siteCopy.en.hero.characterAria;
    expect(label).toMatch(/Gabriel Coelho/);
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
  });

  it("sem JavaScript, os painéis estáticos também não têm texto fixo em português", () => {
    const html = renderToString(inEnglish(<Projetos lang="en" />));
    for (const text of FIXED_PT) expect(html, text).not.toContain(text);
  });
});
