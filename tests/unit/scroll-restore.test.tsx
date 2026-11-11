import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ScrollRestore from "@/components/ScrollRestore";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";

describe("restauração de rolagem e links diretos", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.setItem("preferred-language", "pt");
    sessionStorage.setItem("portfolio:lastScrollY", "900");
    history.replaceState(null, "", "/");
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });
  afterEach(() => {
    sessionStorage.clear();
    history.replaceState(null, "", "/");
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  const mount = () => render(<LanguageProvider><ScrollRestore /></LanguageProvider>);

  it("com #contato não disputa rolagem nem oferece restaurar posição antiga", () => {
    history.replaceState(null, "", "/#contato");
    mount();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: translations.pt.scrollRestore.message })).not.toBeInTheDocument();
  });

  it("sem hash começa no topo e permite voltar à posição anterior", () => {
    mount();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    fireEvent.click(screen.getByRole("button", { name: translations.pt.scrollRestore.message }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 900, behavior: "smooth" });
  });
});
