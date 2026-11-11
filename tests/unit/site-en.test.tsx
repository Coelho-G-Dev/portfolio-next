import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Character from "@/components/site/Character";
import Projetos from "@/components/site/projetos/Projetos";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import Services from "@/components/site/trabalho/Services";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";

// Linhas do tempo das portas simuladas: a sala abre na hora, sem animação.
vi.mock("@/components/site/projetos/doorMotion", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/components/site/projetos/doorMotion")>();
  type Tl = { play(): Tl; progress(): Tl; reverse(): Tl; eventCallback(): Tl; kill(): Tl };
  const done = (cb: () => void): Tl => {
    const tl: Tl = {
      play() {
        cb();
        return tl;
      },
      progress: () => tl,
      reverse: () => tl,
      eventCallback: () => tl,
      kill: () => tl,
    };
    return tl;
  };
  return {
    ...real,
    enterTimeline: (_els: unknown, _t: unknown, onArrive: () => void) => done(onArrive),
    arrivedState: () => {},
    fadeTimeline: (_el: unknown, _dir: unknown, onDone: () => void) => done(onDone).play(),
    scrollIntoStage: () => null,
  };
});

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

function leaves(value: unknown, path = ""): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof value === "string") out.set(path, value);
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      for (const [p, s] of leaves(v, path ? `${path}.${k}` : k)) out.set(p, s);
    }
  }
  return out;
}

// Todo texto PT de uma seção que é diferente do EN no mesmo caminho.
function ptOnly(section: "projetos" | "services"): string[] {
  const en = leaves(siteCopy.en[section]);
  return [...leaves(siteCopy.pt[section])]
    .filter(([path, s]) => s.length > 3 && en.get(path) !== s)
    .map(([, s]) => s);
}

function expectNoFixedPt() {
  for (const text of FIXED_PT) {
    expect(screen.queryByText(text, { exact: false }), text).not.toBeInTheDocument();
  }
}

function expectNoPtCopy(section: "projetos" | "services") {
  const body = document.body.textContent ?? "";
  for (const text of ptOnly(section)) expect(body, text).not.toContain(text);
}

describe("em EN, nenhum texto fixo em português", () => {
  afterEach(() => {
    history.replaceState(null, "", "/");
  });

  it("portas fechadas", () => {
    render(inEnglish(<Projetos lang="en" />));
    expectNoFixedPt();
    expectNoPtCopy("projetos");
    const { open, doors } = siteCopy.en.projetos;
    for (const id of ["backend", "frontend", "ia"] as const) {
      expect(screen.getByRole("button", { name: open(doors[id].name) })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button", { name: /^Open the / })).toHaveLength(3);
  });

  it("painel aberto", () => {
    render(inEnglish(<Projetos lang="en" />));
    fireEvent.click(
      screen.getByRole("button", { name: siteCopy.en.projetos.open(siteCopy.en.projetos.doors.backend.name) }),
    );
    expect(screen.getByRole("heading", { level: 3, name: siteCopy.en.projetos.doors.backend.name })).toBeInTheDocument();
    expectNoFixedPt();
    expectNoPtCopy("projetos");
    expect(screen.getByText(siteCopy.en.projetos.panel.footerText)).toBeInTheDocument();
  });

  it("serviços", () => {
    render(inEnglish(<Services />));
    expectNoFixedPt();
    expectNoPtCopy("services");
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
