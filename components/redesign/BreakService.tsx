"use client";

import { useEffect, useReducer } from "react";
import type { RedesignCopy } from "@/lib/i18n/redesign";
import { countByStage, flowReducer, initialFlow, type ServiceId, type Stage } from "@/lib/messageFlow";

const TICK_MS = 750;
const SERVICES: ServiceId[] = ["api", "queue", "worker", "db"];
const COLUMN: Record<Exclude<Stage, "dlq" | "delivered">, number> = {
  interface: 0,
  api: 1,
  queue: 2,
  worker: 3,
};
const AUTHGUARD_URL = "https://github.com/Coelho-G-Dev/authguard";

export default function BreakService({ c }: { c: RedesignCopy }) {
  const b = c.breakService;
  const [state, dispatch] = useReducer(flowReducer, initialFlow);
  const counts = countByStage(state);
  const moving = counts.inFlight > 0;

  useEffect(() => {
    if (!moving) return;
    const id = setInterval(() => dispatch({ type: "tick" }), TICK_MS);
    return () => clearInterval(id);
  }, [moving]);

  const lastRetry = state.events[0]?.kind === "retry" ? state.events[0].id : null;
  const inPipe = state.messages.filter((m) => m.stage !== "dlq" && m.stage !== "delivered");
  const inDlq = state.messages.filter((m) => m.stage === "dlq");

  return (
    <section id="derrube" className="rd-section rd-break" data-layer="api" aria-labelledby="derrube-title">
      <div className="rd-break__grid">
        <div className="rd-break__intro">
          <h2 id="derrube-title" className="rd-head" data-rise>
            {b.title}
          </h2>
          <p className="rd-lead" data-rise style={{ ["--i" as string]: 1 }}>
            {b.sentence}
          </p>
          <div className="rd-break__actions" data-rise style={{ ["--i" as string]: 2 }}>
            <button type="button" className="rd-btn" onClick={() => dispatch({ type: "send" })}>
              {b.send}
            </button>
            <button
              type="button"
              className="rd-btn rd-btn--quiet"
              onClick={() => dispatch({ type: "replay" })}
              disabled={counts.dlq === 0}
            >
              {b.replay}
            </button>
            <button type="button" className="rd-break__reset" onClick={() => dispatch({ type: "reset" })}>
              {b.reset}
            </button>
          </div>
          <div data-rise style={{ ["--i" as string]: 3 }}>
            <p className="rd-log__title">{b.logTitle}</p>
            <ol className="rd-log" aria-live="polite">
              {state.events.length === 0 ? (
                <li>{b.emptyLog}</li>
              ) : (
                state.events.map((e, i) => <li key={`${e.kind}-${e.id}-${state.events.length - i}`}>{b.event(e)}</li>)
              )}
            </ol>
          </div>
          <p className="rd-break__note">
            {b.note}{" "}
            <a className="rd-link" href={AUTHGUARD_URL} target="_blank" rel="noopener noreferrer">
              {b.noteLink}
            </a>
          </p>
        </div>

        <div className="rd-pipe" data-rise style={{ ["--i" as string]: 2 }}>
          <div className="rd-pipe__row">
            <div className="rd-station">
              <p className="rd-station__name">{b.interface}</p>
              <span />
              <span className="rd-station__fixed">{b.up}</span>
            </div>
            {SERVICES.map((s) => {
              const up = state.services[s];
              return (
                <div key={s} className="rd-station" data-down={!up}>
                  <p className="rd-station__name">{b.services[s]}</p>
                  <span />
                  <button
                    type="button"
                    className="rd-toggle"
                    aria-pressed={up}
                    aria-label={b.toggleAria(b.services[s], up)}
                    onClick={() => dispatch({ type: "toggle", service: s })}
                  >
                    <span className="rd-toggle__lamp" aria-hidden="true" />
                    <span className="rd-toggle__label">{up ? b.up : b.down}</span>
                  </button>
                </div>
              );
            })}

            <div className="rd-tokens" aria-hidden="true">
              {inPipe.map((m) => {
                const col = COLUMN[m.stage as keyof typeof COLUMN];
                const row = inPipe.filter((o) => o.stage === m.stage && o.id < m.id).length;
                return (
                  <div
                    key={m.id}
                    className="rd-token"
                    data-stage={m.stage}
                    data-retry={lastRetry === m.id}
                    style={{ transform: `translate(calc(${col * 100}% + ${col * 6}px), ${56 + (row % 3) * 36}px)` }}
                  >
                    <span>#{m.id}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rd-dlq">
            <div className="rd-dlq__box">
              <strong>{b.dlq}</strong>
              {inDlq.map((m) => (
                <span key={m.id} className="rd-dlq__token">
                  #{m.id}
                </span>
              ))}
            </div>
          </div>

          <dl className="rd-score tnum">
            <div>
              <dt>{b.sent}</dt>
              <dd>{counts.sent}</dd>
            </div>
            <div>
              <dt>{b.delivered}</dt>
              <dd>{counts.delivered}</dd>
            </div>
            <div>
              <dt>{b.lost}</dt>
              <dd>{counts.lost}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
