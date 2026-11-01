import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EmailPill from "@/components/site/EmailPill";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { EMAIL } from "@/lib/contact";
import { copyText } from "@/lib/clipboard";
import { siteCopy } from "@/lib/i18n/site";

vi.mock("@/lib/clipboard", () => ({ copyText: vi.fn() }));

const c = siteCopy.pt.hero;

function renderPill() {
  return render(
    <SiteCopyContext.Provider value={siteCopy.pt}>
      <EmailPill surface="light" />
    </SiteCopyContext.Provider>,
  );
}

describe("pílula de e-mail", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(copyText).mockReset();
  });

  it("o endereço é um link mailto visível", () => {
    renderPill();
    const link = screen.getByRole("link", { name: EMAIL });
    expect(link).toHaveAttribute("href", `mailto:${EMAIL}`);
  });

  it('copiar com sucesso anuncia "E-mail copiado"', async () => {
    vi.mocked(copyText).mockResolvedValue(true);
    renderPill();
    await userEvent.click(screen.getByRole("button", { name: c.copyEmail }));
    expect(copyText).toHaveBeenCalledWith(EMAIL);
    expect(screen.getByRole("status")).toHaveTextContent(c.copied);
  });

  it("se a cópia falhar, avisa a falha e nunca diz que copiou", async () => {
    vi.mocked(copyText).mockResolvedValue(false);
    renderPill();
    await userEvent.click(screen.getByRole("button", { name: c.copyEmail }));
    expect(screen.getByRole("status")).toHaveTextContent(c.copyFailed);
    expect(screen.queryByText(c.copied)).toBeNull();
  });

  it("a mensagem some depois de 2,5 s", async () => {
    vi.mocked(copyText).mockResolvedValue(true);
    renderPill();
    await userEvent.click(screen.getByRole("button", { name: c.copyEmail }));
    expect(screen.getByRole("status")).toHaveTextContent(c.copied);
    await act(async () => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});
