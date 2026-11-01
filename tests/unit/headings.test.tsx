import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import RedesignPage from "@/components/redesign/RedesignPage";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { redesignCopy } from "@/lib/i18n/redesign";

function renderPage() {
  return render(
    <LanguageProvider>
      <RedesignPage contributions={null} />
    </LanguageProvider>,
  );
}

function levels(container: HTMLElement) {
  return Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));
}

describe.each(["pt", "en"] as const)("hierarquia de títulos (%s)", (lang) => {
  // O LanguageProvider lê a língua salva; o jsdom anuncia "en-US", então
  // fixamos a língua antes de montar e esperamos o h1 trocar.
  async function setup() {
    localStorage.setItem("preferred-language", lang);
    const view = renderPage();
    await screen.findByRole("heading", { level: 1, name: redesignCopy[lang].hero.titleSr });
    return view;
  }

  it("tem um único h1, com o nome e espaços corretos", async () => {
    await setup();
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    // Nome acessível: ignora a faixa decorativa (aria-hidden) e lê só o texto sr-only.
    expect(h1s[0]).toHaveAccessibleName(redesignCopy[lang].hero.titleSr);
    expect(redesignCopy[lang].hero.titleSr).toMatch(/^Gabriel Coelho, /);
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
    expect(sections.length).toBeGreaterThanOrEqual(6);
    sections.forEach((section) => {
      expect(within(section).getAllByRole("heading", { level: 2 }).length, `#${section.id}`).toBeGreaterThan(0);
    });
  });

  it("o rodapé tem o seu h2", async () => {
    await setup();
    expect(within(screen.getByRole("contentinfo")).getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});

it("o botão de idioma troca PT ↔ EN", async () => {
  localStorage.setItem("preferred-language", "pt");
  renderPage();
  await screen.findByRole("heading", { level: 1, name: redesignCopy.pt.hero.titleSr });
  await userEvent.click(screen.getByRole("button", { name: redesignCopy.pt.nav.langSwitchAria }));
  expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(redesignCopy.en.hero.titleSr);
});
