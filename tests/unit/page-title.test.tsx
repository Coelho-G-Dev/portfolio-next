import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

describe("título da aba segue o posicionamento full-stack", () => {
  it.each([
    ["pt", "Gabriel Coelho | Desenvolvedor Full-stack"],
    ["en", "Gabriel Coelho | Full-stack Developer"],
  ] as const)("em %s", (lang, title) => {
    localStorage.setItem("preferred-language", lang);
    render(<LanguageProvider>{null}</LanguageProvider>);
    expect(document.title).toBe(title);
  });
});
