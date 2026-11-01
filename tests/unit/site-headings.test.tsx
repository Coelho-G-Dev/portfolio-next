import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import SitePage from "@/components/site/SitePage";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";

function renderPage() {
  return render(
    <LanguageProvider>
      <SitePage />
    </LanguageProvider>,
  );
}

function levels(container: HTMLElement) {
  return Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));
}

describe.each(["pt", "en"] as const)("hierarquia de títulos do site novo (%s)", (lang) => {
  // O h1 é igual nas duas línguas; esperamos o texto da apresentação trocar.
  async function setup() {
    localStorage.setItem("preferred-language", lang);
    const view = renderPage();
    await screen.findByText(siteCopy[lang].hero.intro);
    return view;
  }

  it('tem um único h1, chamado "Gabriel Coelho"', async () => {
    await setup();
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveAccessibleName("Gabriel Coelho");
  });

  it("não pula nenhum nível", async () => {
    const { container } = await setup();
    const seq = levels(container);
    expect(seq[0]).toBe(1);
    for (let i = 1; i < seq.length; i++) {
      expect(seq[i] - seq[i - 1], `h${seq[i - 1]} seguido de h${seq[i]}`).toBeLessThanOrEqual(1);
    }
  });

  it("toda section de main tem um h2", async () => {
    await setup();
    const sections = screen.getByRole("main").querySelectorAll("section");
    expect(sections.length).toBeGreaterThanOrEqual(5);
    sections.forEach((section) => {
      expect(within(section).getAllByRole("heading", { level: 2 }).length, `#${section.id}`).toBeGreaterThan(0);
    });
  });

  it("o rodapé tem o seu h2", async () => {
    await setup();
    expect(within(screen.getByRole("contentinfo")).getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("os links do menu apontam para seções que existem", async () => {
    const { container } = await setup();
    for (const link of siteCopy[lang].nav.links) {
      expect(container.querySelector(link.href), link.href).not.toBeNull();
    }
  });
});

it("o botão de idioma troca a apresentação PT → EN", async () => {
  localStorage.setItem("preferred-language", "pt");
  renderPage();
  await screen.findByText(siteCopy.pt.hero.intro);
  await userEvent.click(screen.getByRole("button", { name: siteCopy.pt.nav.langSwitchAria }));
  expect(screen.getByText(siteCopy.en.hero.intro)).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("Gabriel Coelho");
});
