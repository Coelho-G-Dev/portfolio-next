import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import About from "@/components/site/sobre/About";
import Contact from "@/components/site/sobre/Contact";
import Footer from "@/components/site/Footer";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { EMAIL, mailtoFor } from "@/lib/contact";

function wrap(ui: React.ReactNode, lang: "pt" | "en" = "pt") {
  localStorage.setItem("preferred-language", lang);
  // O dia de 600 t, dentro do Sobre, lê o texto do SiteCopyContext (como na SitePage).
  return render(
    <LanguageProvider>
      <SiteCopyContext.Provider value={siteCopy[lang]}>{ui}</SiteCopyContext.Provider>
    </LanguageProvider>,
  );
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

  it("não mostra mais o painel dos commits", () => {
    wrap(<About />);
    expect(screen.queryByText(siteCopy.pt.about.tilesFallback)).toBeNull();
    expect(screen.queryByText(siteCopy.pt.about.tilesTitle)).toBeNull();
  });

  it("tem o parágrafo de abertura e o bloco Skills", () => {
    wrap(<About />);
    expect(screen.getByText(siteCopy.pt.about.intro)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Skills" })).toBeInTheDocument();
  });

  it("o Sobre está no presente: nenhum texto diz 'Vim da logística'", () => {
    const { container } = wrap(<About />);
    expect(container.textContent).not.toContain("Vim da logística");
  });

  it("em inglês, mostra a abertura e o título Skills", () => {
    wrap(<About />, "en");
    expect(screen.getByText(siteCopy.en.about.intro)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Skills" })).toBeInTheDocument();
  });
});

describe("Contato", () => {
  it.each(["pt", "en"] as const)("abre o WhatsApp no número informado (%s)", (lang) => {
    wrap(<Contact />, lang);
    const link = screen.getByRole("link", { name: /WhatsApp/ });
    expect(link).toHaveAttribute("href", "https://wa.me/5598988255626");
    expect(link).toHaveTextContent("(98) 98825-5626");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

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
