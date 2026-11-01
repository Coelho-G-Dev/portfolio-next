"use client";

import { useEffect, useState } from "react";
import { appStatus, type Mode } from "@/lib/derrubeApp";
import { Section } from "../Chapter";
import { useChapterCovered } from "../CortinaContext";
import { useSiteCopy } from "../SiteCopyContext";
import AppPanel from "./AppPanel";
import FlowPanel from "./FlowPanel";
import { useSimulation } from "./useSimulation";

const AUTHGUARD_URL = "https://github.com/Coelho-G-Dev/authguard";
const MODES: Mode[] = ["queue", "direct"];

function Source() {
  const d = useSiteCopy().derrube;
  return (
    <p className="s-derrube__source" data-derrube-end>
      {d.note}{" "}
      <a href={AUTHGUARD_URL} target="_blank" rel="noopener noreferrer">
        {d.noteLink}
      </a>
    </p>
  );
}

// Sem JavaScript (e no HTML do servidor): diagrama estático com a explicação
// em texto, sem botões que não fariam nada.
function StaticDerrube() {
  const d = useSiteCopy().derrube;
  return (
    <>
      <ol className="s-flow__nodes s-flow__nodes--static">
        {(["interface", "api", "queue", "worker", "db"] as const).map(
          (node) => (
            <li key={node} className="s-flow__node">
              <span className="s-flow__name">{d.nodes[node]}</span>
            </li>
          ),
        )}
      </ol>
      <p className="s-derrube__nojs">{d.noJs}</p>
    </>
  );
}

function Interactive() {
  const d = useSiteCopy().derrube;
  const covered = useChapterCovered("derrube");
  const sim = useSimulation(covered);
  const status = appStatus(sim.mode, sim.latestStage);

  return (
    <>
      <div className="s-derrube__modes" role="group" aria-label={d.modeLegend}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className="s-derrube__mode"
            aria-pressed={sim.mode === m}
            onClick={() => sim.mode !== m && sim.setMode(m)}
          >
            {d.modes[m]}
          </button>
        ))}
      </div>
      <p className="s-derrube__note" data-mode={sim.mode}>
        {d.modeNote[sim.mode]}
      </p>

      {/* Desktop: fluxo e resultados à esquerda, a tela do app à direita.
          Celular: fluxo, app e resultados, nessa ordem. */}
      <div className="s-derrube__grid">
        <FlowPanel
          copy={d}
          mode={sim.mode}
          services={sim.services}
          messages={sim.messages}
          onToggle={sim.toggle}
        />
        <AppPanel
          copy={{ ...d.app, send: d.send }}
          status={status}
          onCreate={sim.send}
        />

        <div className="s-derrube__bottom">
          <div className="s-derrube__actions">
            {sim.mode === "queue" && (
              <button
                type="button"
                className="s-derrube__action"
                onClick={sim.replay}
                disabled={sim.counts.dlq === 0}
              >
                {d.replay}
              </button>
            )}
            <button
              type="button"
              className="s-derrube__action"
              onClick={sim.reset}
            >
              {d.reset}
            </button>
          </div>
          <dl className="s-derrube__score">
            {(["sent", "delivered", "lost"] as const).map((k) => (
              <div key={k} data-key={k}>
                <dt>{d.score[k]}</dt>
                <dd>{sim.counts[k]}</dd>
              </div>
            ))}
          </dl>
          <div className="s-derrube__log">
            <p className="s-derrube__log-title">{d.logTitle}</p>
            <ol aria-live="polite">
              {sim.events.length === 0 ? (
                <li className="s-derrube__empty">{d.emptyLog}</li>
              ) : (
                sim.events.map((e, i) => (
                  <li key={`${e.kind}-${e.id}-${i}`}>{d.event(e)}</li>
                ))
              )}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Derrube() {
  const d = useSiteCopy().derrube;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Section id="derrube" title={d.title}>
      <p className="s-derrube__lead">{d.sentence}</p>
      {mounted ? <Interactive /> : <StaticDerrube />}
      <Source />
    </Section>
  );
}
