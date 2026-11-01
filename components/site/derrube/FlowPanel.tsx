"use client";

import type { CSSProperties } from "react";
import type { Mode } from "@/lib/derrubeApp";
import type { ServiceId } from "@/lib/messageFlow";
import type { SiteCopy } from "@/lib/i18n/site";
import type { SimMessage } from "./useSimulation";

type NodeId = "interface" | ServiceId;

const NODES: Record<Mode, NodeId[]> = {
  queue: ["interface", "api", "queue", "worker", "db"],
  direct: ["interface", "api", "worker", "db"],
};

// Coluna de cada estágio no trilho (a ficha anda por transform).
function column(mode: Mode, m: SimMessage): number | null {
  const nodes = NODES[mode];
  switch (m.stage) {
    case "interface":
    case "api":
    case "queue":
    case "worker":
      return nodes.indexOf(m.stage);
    case "delivered":
      return nodes.indexOf("db");
    case "lost":
      return nodes.indexOf(m.lostAt ?? "api");
    default:
      return null; // dlq: fica na caixa da DLQ
  }
}

export default function FlowPanel({
  copy,
  mode,
  services,
  messages,
  onToggle,
}: {
  copy: SiteCopy["derrube"];
  mode: Mode;
  services: Partial<Record<ServiceId, boolean>>;
  messages: SimMessage[];
  onToggle: (service: ServiceId) => void;
}) {
  const nodes = NODES[mode];
  const stackAt = new Map<number, number>();
  const onTrack = messages
    .map((m) => ({ m, col: column(mode, m) }))
    .filter(
      (t): t is { m: SimMessage; col: number } => t.col !== null && t.col >= 0,
    )
    // Só as 12 fichas mais recentes ficam no trilho: a fila "enche" sem poluir.
    .slice(-12);
  const inDlq = messages.filter((m) => m.stage === "dlq");

  return (
    <div
      className="s-flow"
      data-mode={mode}
      style={{ "--n": nodes.length } as CSSProperties}
    >
      {/* Nós e trilho dividem o mesmo contêiner: na horizontal (desktop) ou na
          vertical (celular), cada ficha anda uma coluna por estágio. */}
      <div className="s-flow__lane">
        <ol className="s-flow__nodes">
          {nodes.map((node) => {
            const service = node === "interface" ? null : (node as ServiceId);
            const up = service ? services[service] !== false : true;
            return (
              <li
                key={node}
                className="s-flow__node"
                data-node={node}
                data-down={up ? undefined : ""}
              >
                <span className="s-flow__name">{copy.nodes[node]}</span>
                {service ? (
                  <button
                    type="button"
                    className="s-flow__toggle"
                    aria-pressed={up}
                    aria-label={copy.toggleAria(copy.nodes[node], up)}
                    onClick={() => onToggle(service)}
                  >
                    <span className="s-flow__switch" aria-hidden="true" />
                    {up ? copy.up : copy.down}
                  </button>
                ) : (
                  <span className="s-flow__state">{copy.up}</span>
                )}
              </li>
            );
          })}
        </ol>

        <div className="s-flow__track" aria-hidden="true">
          {onTrack.map(({ m, col }) => {
            const stack = stackAt.get(col) ?? 0;
            stackAt.set(col, stack + 1);
            return (
              <span
                key={m.id}
                className="s-flow__token"
                data-stage={m.stage}
                style={
                  {
                    "--col": col,
                    "--stack": Math.min(stack, 4),
                  } as CSSProperties
                }
              >
                <span className="s-flow__chip">#{m.id}</span>
              </span>
            );
          })}
        </div>
      </div>

      {mode === "queue" && (
        <div className="s-flow__dlq" data-full={inDlq.length > 0 || undefined}>
          <span className="s-flow__dlq-name">{copy.dlq}</span>
          <span className="s-flow__dlq-tokens">
            {inDlq.map((m) => (
              <span key={m.id} className="s-flow__chip s-flow__chip--dlq">
                #{m.id}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
