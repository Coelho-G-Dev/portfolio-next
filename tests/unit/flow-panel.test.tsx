import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FlowPanel from "@/components/site/derrube/FlowPanel";
import type { SimMessage } from "@/components/site/derrube/useSimulation";
import { siteCopy } from "@/lib/i18n/site";

const copy = siteCopy.pt.derrube;
const up = { api: true, queue: true, worker: true, db: true };

function tokens(messages: SimMessage[]) {
  const { container } = render(
    <FlowPanel copy={copy} mode="queue" services={up} messages={messages} onToggle={() => {}} />,
  );
  return Array.from(container.querySelectorAll<HTMLElement>(".s-flow__token")).map((el) => ({
    id: el.textContent,
    stage: el.dataset.stage,
    stack: el.style.getPropertyValue("--stack"),
  }));
}

describe("trilho do fluxo", () => {
  it("fichas já entregues não empurram o empilhamento das novas", () => {
    const t = tokens([
      { id: 1, stage: "delivered" },
      { id: 2, stage: "delivered" },
      { id: 3, stage: "delivered" },
      { id: 4, stage: "worker" },
    ]);
    expect(t.find((x) => x.id === "#4")?.stack).toBe("0");
    // Das finalizadas, só a mais recente fica (para a transição de saída).
    expect(t.filter((x) => x.stage === "delivered").map((x) => x.id)).toEqual(["#3"]);
    expect(t.find((x) => x.id === "#3")?.stack).toBe("0");
  });

  it("uma ficha reprocessada da DLQ aparece mesmo depois de muitas entregas", () => {
    const delivered: SimMessage[] = Array.from({ length: 13 }, (_, i) => ({ id: i + 2, stage: "delivered" }));
    const t = tokens([{ id: 1, stage: "queue" }, ...delivered]);
    expect(t.map((x) => x.id)).toContain("#1");
  });

  it("fichas ativas na mesma etapa se empilham em ordem", () => {
    const t = tokens([
      { id: 1, stage: "queue" },
      { id: 2, stage: "queue" },
      { id: 3, stage: "queue" },
    ]);
    expect(t.map((x) => x.stack)).toEqual(["0", "1", "2"]);
  });
});
