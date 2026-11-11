import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Dia600 from "@/components/site/sobre/Dia600";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { siteCopy } from "@/lib/i18n/site";

const TEAM = /\b\d+\+?\s*(auxiliares|conferentes|pessoas|assistants|checkers|people)\b|\b(auxiliares|conferentes|assistants|checkers)\b/i;

describe("privacidade dos dados da equipe", () => {
  it.each(["pt", "en"] as const)("não envia quantitativos ao DOM ou aos dados em %s", lang => {
    const copy = siteCopy[lang];
    const { container } = render(<SiteCopyContext.Provider value={copy}><Dia600 /></SiteCopyContext.Provider>);
    // Só o resultado booleano sai no log, sem reproduzir dados privados na falha.
    expect(TEAM.test(container.textContent ?? "")).toBe(false);
    expect(TEAM.test(JSON.stringify(copy))).toBe(false);
    const d = copy.about.dia600;
    expect(d.summary).toContain("600");
    expect(d.summary).toContain("40");
    expect(d.lines).toHaveLength(5);
    expect(d.states.carregamento).toBe(lang === "pt" ? "40+ caminhões" : "40+ trucks");
    expect("separacao" in d.states).toBe(false);
    expect("conferencia" in d.states).toBe(false);
  });

  it("não inclui dados da equipe nos metadados ou dados dos projetos", () => {
    for (const file of ["app/layout.tsx", "app/opengraph-image.alt.txt","data/dia600.ts", "data/projects.ts", "data/nodeSpecs.ts"]) {
      expect(TEAM.test(readFileSync(file, "utf8")), file).toBe(false);
    }
  });
});
