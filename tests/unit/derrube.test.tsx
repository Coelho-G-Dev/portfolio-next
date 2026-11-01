import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CortinaContext } from "@/components/site/CortinaContext";
import Derrube from "@/components/site/derrube/Derrube";
import { SiteCopyContext } from "@/components/site/SiteCopyContext";
import { siteCopy } from "@/lib/i18n/site";

const d = siteCopy.pt.derrube;
const TICK = 750;

function tree(covered: string[] = []) {
  return (
    <SiteCopyContext.Provider value={siteCopy.pt}>
      <CortinaContext.Provider value={new Set(covered)}>
        <Derrube />
      </CortinaContext.Provider>
    </SiteCopyContext.Provider>
  );
}

const ticks = async (n: number) => {
  await act(async () => {
    vi.advanceTimersByTime(TICK * n);
  });
};

const click = async (name: string) => {
  await act(async () => {
    screen.getByRole("button", { name }).click();
  });
};

function score(label: string) {
  const dt = screen.getByText(label, { selector: "dt" });
  return dt.nextElementSibling?.textContent;
}

describe("Derrube um serviço", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("começa no modo com fila", () => {
    render(tree());
    expect(screen.getByRole("button", { name: d.modes.queue })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: d.modes.direct })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(d.modeNote.queue)).toBeInTheDocument();
    expect(screen.getByText(d.app.status.idle)).toBeInTheDocument();
  });

  it("com fila e o worker fora, a conta é criada e o e-mail espera, sem erro", async () => {
    render(tree());
    await click(d.toggleAria(d.nodes.worker, true));
    await click(d.send);
    await ticks(3);
    expect(screen.getByText(d.app.status.processing)).toBeInTheDocument();
    expect(screen.queryByText(d.app.status.error)).toBeNull();
    expect(score(d.score.lost)).toBe("0");

    await click(d.toggleAria(d.nodes.worker, false));
    await ticks(3);
    expect(screen.getByText(d.app.status.delivered)).toBeInTheDocument();
    expect(score(d.score.delivered)).toBe("1");
  });

  it("sem fila e o worker fora, o app mostra erro e o e-mail se perde", async () => {
    render(tree());
    await click(d.modes.direct);
    expect(screen.getByText(d.modeNote.direct)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: d.toggleAria(d.nodes.queue, true) })).toBeNull();

    await click(d.toggleAria(d.nodes.worker, true));
    await click(d.send);
    await ticks(3);
    expect(screen.getByText(d.app.status.error)).toBeInTheDocument();
    expect(score(d.score.lost)).toBe("1");
    expect(screen.getByText(d.event({ kind: "lost", id: 1, service: "worker" }))).toBeInTheDocument();
  });

  it("trocar de modo no meio de uma mensagem não deixa nada para trás", async () => {
    render(tree());
    await click(d.toggleAria(d.nodes.db, true));
    await click(d.send);
    await ticks(2);
    await click(d.modes.direct);
    await ticks(10);
    expect(score(d.score.sent)).toBe("0");
    expect(score(d.score.delivered)).toBe("0");
    expect(score(d.score.lost)).toBe("0");
    expect(screen.getByText(d.emptyLog)).toBeInTheDocument();
    expect(screen.getByText(d.app.status.idle)).toBeInTheDocument();
    // E todas as peças voltam ao ar.
    expect(screen.getByRole("button", { name: d.toggleAria(d.nodes.db, true) })).toBeInTheDocument();
  });

  it("com o capítulo coberto, o relógio para e retoma de onde parou", async () => {
    const view = render(tree(["derrube"]));
    await click(d.send);
    await ticks(5);
    expect(screen.getByText(d.app.status.connecting)).toBeInTheDocument();

    view.rerender(tree([]));
    await ticks(1);
    expect(screen.getByText(d.app.status.processing)).toBeInTheDocument();
    await ticks(3);
    expect(screen.getByText(d.app.status.delivered)).toBeInTheDocument();
  });

  it("sem JavaScript, mostra a explicação estática e nenhum botão", () => {
    const html = renderToString(tree());
    expect(html).toContain(d.noJs);
    expect(html).not.toContain("<button");
  });
});
