import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Dia600 from "@/components/site/sobre/Dia600";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { siteCopy } from "@/lib/i18n/site";

function renderDia600(lang: "pt" | "en" = "pt") {
  return render(
    <SiteCopyContext.Provider value={siteCopy[lang]}>
      <Dia600 />
    </SiteCopyContext.Provider>,
  );
}

describe("O dia de 600 toneladas", () => {
  const d = siteCopy.pt.about.dia600;

  it("tem o título como h3", () => {
    renderDia600();
    expect(screen.getByRole("heading", { level: 3, name: d.title })).toBeInTheDocument();
  });

  it("todas as cinco frases estão no DOM, em ordem", () => {
    const { container } = renderDia600();
    const text = container.textContent ?? "";
    const at = d.lines.map((line) => text.indexOf(line));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("a lista tem cinco etapas, cada uma com o nome da logística e o do código", () => {
    renderDia600();
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items[2]).toHaveTextContent("Conferência, no código: Fila (RabbitMQ)");
    // Os nomes visíveis (que trocam com a rolagem) ficam fora da leitura.
    const visible = items[2].querySelector(".s-dia600__name");
    expect(visible).toHaveAttribute("aria-hidden", "true");
  });

  it("os contadores animados ficam fora da leitura, e o resumo é texto", () => {
    const { container } = renderDia600();
    const counters = container.querySelector(".s-dia600__counters");
    expect(counters).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(d.summary)).toBeInTheDocument();
  });

  it("o link da ponte aponta para o Derrube", () => {
    renderDia600();
    expect(screen.getByRole("link", { name: d.bridgeLink })).toHaveAttribute("href", "#derrube");
  });

  it("em inglês", () => {
    renderDia600("en");
    expect(screen.getByRole("heading", { level: 3, name: "600 tonnes, one flow" })).toBeInTheDocument();
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items[2]).toHaveTextContent("Checking, in code: Queue (RabbitMQ)");
  });
});
