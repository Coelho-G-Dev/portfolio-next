import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import About from "@/components/site/sobre/About";
import Contact from "@/components/site/sobre/Contact";
import Footer from "@/components/site/Footer";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { EMAIL, mailtoFor } from "@/lib/contact";

function wrap(ui: React.ReactNode, lang: "pt" | "en" = "pt") {
  localStorage.setItem("preferred-language", lang);
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("Sobre e Retratos", () => {
  it("renderiza os 4 retratos com nomes e descrições", () => {
    wrap(<About />);
    const pt = siteCopy.pt.about;
    for (const p of pt.portraits) {
      expect(screen.getByText(p.name)).toBeInTheDocument();
      expect(screen.getByText(p.role)).toBeInTheDocument();
    }
  });

  it("mostra os azulejos quando há contribuições", () => {
    const mockContributions = {
      total: 350,
      weeks: [
        { start: "2026-01-04", count: 12, level: 2 as const },
        { start: "2026-01-11", count: 25, level: 4 as const },
      ],
    };
    wrap(<About contributions={mockContributions} />);
    expect(screen.getByRole("img", { name: siteCopy.pt.about.tilesText(350) })).toBeInTheDocument();
  });

  it("mostra o texto de fallback quando não há dados do GitHub", () => {
    wrap(<About contributions={null} />);
    expect(screen.getByText(siteCopy.pt.about.tilesFallback)).toBeInTheDocument();
  });
});

describe("Contato", () => {
  it("renderiza o e-mail, redes e badges de presença", () => {
    wrap(<Contact />);
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
    expect(screen.getByText(siteCopy.pt.contact.location)).toBeInTheDocument();
    expect(screen.getByText(siteCopy.pt.contact.reply)).toBeInTheDocument();
  });

  it("permite alternar entre vaga e projeto, atualizando o link mailto", async () => {
    const user = userEvent.setup();
    wrap(<Contact />);
    const c = siteCopy.pt.contact;

    const roleBtn = screen.getByRole("button", { name: c.kinds.role });
    const projBtn = screen.getByRole("button", { name: c.kinds.project });
    const sendLink = screen.getByRole("link", { name: new RegExp(c.write) });

    // Começa em 'role'
    expect(roleBtn).toHaveAttribute("aria-pressed", "true");
    expect(projBtn).toHaveAttribute("aria-pressed", "false");
    expect(sendLink).toHaveAttribute("href", mailtoFor(c, "role"));

    // Clica em 'project'
    await user.click(projBtn);
    expect(roleBtn).toHaveAttribute("aria-pressed", "false");
    expect(projBtn).toHaveAttribute("aria-pressed", "true");
    expect(sendLink).toHaveAttribute("href", mailtoFor(c, "project"));
  });
});

describe("Footer", () => {
  it("renderiza o h2 do rodapé e os links legais", () => {
    wrap(<Footer />);
    const f = siteCopy.pt.footer;
    expect(screen.getByRole("heading", { level: 2, name: f.title })).toBeInTheDocument();
    expect(screen.getByText(f.rights)).toBeInTheDocument();
    expect(screen.getByText(f.built)).toBeInTheDocument();
  });

  it("não mostra aviso de prévia no site publicado", () => {
    wrap(<Footer />);
    expect(screen.queryByText(/Prévia|não indexada|preview/i)).not.toBeInTheDocument();
  });
});
