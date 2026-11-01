import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Projetos from "@/components/site/projetos/Projetos";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { projects } from "@/data/projects";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { siteCopy, type SiteCopy } from "@/lib/i18n/site";

function tree(copy: SiteCopy = siteCopy.pt, lang: "pt" | "en" = "pt") {
  localStorage.setItem("preferred-language", lang);
  return (
    <LanguageProvider>
      <SiteCopyContext.Provider value={copy}>
        <Projetos lang={lang} />
      </SiteCopyContext.Provider>
    </LanguageProvider>
  );
}

describe("Portas e capítulo de projetos", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("as três portas começam fechadas e o destaque do Cidade Energia está sempre presente", () => {
    render(tree());
    expect(screen.getByRole("heading", { level: 3, name: "Cidade Energia" })).toBeInTheDocument();
    expect(screen.getByText(siteCopy.pt.projetos.featured.badge)).toBeInTheDocument();
    expect(screen.getByText(siteCopy.pt.projetos.featured.fullStack)).toBeInTheDocument();

    for (const door of ["backend", "frontend", "ia"] as const) {
      const name = siteCopy.pt.projetos.doors[door].name;
      const btn = screen.getByRole("button", {
        name: siteCopy.pt.projetos.open(name),
      });
      expect(btn).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("abrir Front-end foca no h3 Front-end, lista apenas o Cidade Energia como h4, e Esc ou Voltar às portas devolvem o foco à porta", () => {
    render(tree());
    const frontBtn = screen.getByRole("button", {
      name: siteCopy.pt.projetos.open("Front-end"),
    });

    fireEvent.click(frontBtn);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const panelHeading = screen.getByRole("heading", { level: 3, name: "Front-end" });
    expect(panelHeading).toBeInTheDocument();
    expect(document.activeElement).toBe(panelHeading);

    const panel = panelHeading.closest("[data-door-panel]") as HTMLElement;
    const h4s = within(panel).getAllByRole("heading", { level: 4 });
    expect(h4s).toHaveLength(1);
    expect(h4s[0]).toHaveTextContent("Cidade Energia");

    // O destaque continua visível com a porta aberta.
    expect(screen.getByRole("heading", { level: 3, name: "Cidade Energia" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    const restoredBtn = screen.getByRole("button", {
      name: siteCopy.pt.projetos.open("Front-end"),
    });
    expect(restoredBtn).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(restoredBtn);

    // Abre de novo e fecha pelo botão "Voltar às portas".
    fireEvent.click(restoredBtn);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(screen.getByRole("button", { name: "Voltar às portas" }));
    const restoredAgain = screen.getByRole("button", {
      name: siteCopy.pt.projetos.open("Front-end"),
    });
    expect(document.activeElement).toBe(restoredAgain);
  });

  it("renderiza as telas de celular na faceta Front-end quando screens existe", () => {
    const ce = projects.find((p) => p.title === "Cidade Energia")!;
    const prevScreens = ce.facets!.frontend!.screens;
    ce.facets!.frontend!.screens = [
      {
        src: "/projects/cidade-energia-1.webp",
        alt: { pt: "Tela inicial do PWA Cidade Energia", en: "Cidade Energia PWA home screen" },
      },
      {
        src: "/projects/cidade-energia-2.webp",
        alt: { pt: "Simulador solar do PWA Cidade Energia", en: "Cidade Energia PWA solar simulator" },
      },
    ];
    try {
      render(tree());
      fireEvent.click(
        screen.getByRole("button", { name: siteCopy.pt.projetos.open("Front-end") }),
      );
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByAltText("Tela inicial do PWA Cidade Energia")).toBeInTheDocument();
      expect(screen.getByAltText("Simulador solar do PWA Cidade Energia")).toBeInTheDocument();
    } finally {
      ce.facets!.frontend!.screens = prevScreens;
    }
  });

  it("com a porta IA aberta, trocar o idioma mantém o painel aberto com o h3 em inglês", () => {
    const view = render(tree(siteCopy.pt, "pt"));
    const iaBtn = screen.getByRole("button", {
      name: siteCopy.pt.projetos.open("IA"),
    });
    fireEvent.click(iaBtn);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("heading", { level: 3, name: "IA" })).toBeInTheDocument();

    view.rerender(tree(siteCopy.en, "en"));
    expect(screen.getByRole("heading", { level: 3, name: "AI" })).toBeInTheDocument();
  });

  it("com a porta Back-end aberta, trocar o idioma mantém o painel Back-end aberto e traduzido", () => {
    const view = render(tree(siteCopy.pt, "pt"));
    const backBtn = screen.getByRole("button", {
      name: siteCopy.pt.projetos.open("Back-end"),
    });
    fireEvent.click(backBtn);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("heading", { level: 3, name: "Back-end" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar às portas" })).toBeInTheDocument();

    view.rerender(tree(siteCopy.en, "en"));
    expect(screen.getByRole("heading", { level: 3, name: "Back-end" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to doors" })).toBeInTheDocument();
  });

  it("sem JavaScript (renderToString), mostra os três painéis abertos, os tabuleiros estáticos e nenhum aria-expanded", () => {
    const html = renderToString(tree(siteCopy.pt, "pt"));
    expect(html).not.toContain("aria-expanded");
    expect(html).toContain(">Back-end</h3>");
    expect(html).toContain(">Front-end</h3>");
    expect(html).toContain(">IA</h3>");
    expect(html).toContain("Peças perdidas: 0");
  });
});
