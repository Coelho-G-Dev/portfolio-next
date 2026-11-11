"use client";

import { useRef } from "react";
import { DIA600, DIA600_STAGES } from "@/data/dia600";
import { useSiteCopy } from "../SiteCopyContext";
import { useDia600 } from "./useDia600";

const chipNumber = (k: number) => String(k + 1).padStart(2, "0");

// O dia de 600 toneladas (spec §7.2). Sem JavaScript ou com movimento
// reduzido, a cena fica no estado final e em fluxo normal; com o useDia600
// ligado (data-dia600-on), o trecho fica alto, o palco gruda e a rolagem conta
// o dia. Todo o texto fica no DOM: a troca é só visual.
export default function Dia600() {
  const c = useSiteCopy();
  const d = c.about.dia600;
  const root = useRef<HTMLDivElement>(null);
  useDia600(root);

  return (
    <div className="s-dia600" data-dia600 ref={root}>
      <div className="s-dia600__stage">
        <div className="s-dia600__inner" data-dia600-inner>
          <div className="s-dia600__head">
            <div>
              <p className="s-dia600__label">{d.label}</p>
              <h3 className="s-dia600__title">{d.title}</h3>
            </div>
            {/* Os números andam com a rolagem; o leitor de tela lê o resumo. */}
            <div className="s-dia600__counters tnum" aria-hidden="true">
              <p className="s-dia600__counter">
                <b data-dia600-tons>{`${DIA600.peakTons} t`}</b>
                {d.counters.shipped}
              </p>
              <p className="s-dia600__counter">
                <b data-dia600-trucks>{String(DIA600.trucks)}</b>
                {d.counters.trucks}
              </p>
              <p className="s-dia600__counter s-dia600__counter--lost">
                <b>{String(DIA600.lost)}</b>
                {d.counters.lost}
              </p>
            </div>
            <p className="sr-only">{d.summary}</p>
          </div>

          <div className="s-dia600__flow">
            <ol className="s-dia600__nodes">
              {/* Chave fora do idioma: trocar PT/EN mantém os mesmos nós. */}
              {DIA600_STAGES.map((stage) => {
                const log = d.stages[stage.id];
                const code = c.derrube.nodes[stage.code];
                return (
                  <li key={stage.id} className="s-dia600__node" data-stage={stage.id}>
                    {/* A vírgula separa o nome do estado na leitura. */}
                    <span className="sr-only">{`${d.inCode(log, code)}, `}</span>
                    <span className="s-dia600__name" aria-hidden="true">
                      <span className="s-dia600__log" data-dia600-log>
                        {log}
                      </span>
                      <span className="s-dia600__sep"> · </span>
                      <span className="s-dia600__code" data-dia600-code>
                        {code}
                      </span>
                    </span>
                    <span className="s-dia600__state">
                      <span className="s-dia600__state-log">{d.states[stage.id] ?? c.derrube.up}</span>
                      <span className="s-dia600__state-up" aria-hidden="true">
                        {c.derrube.up}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="s-dia600__track" aria-hidden="true" data-dia600-track>
              {Array.from({ length: DIA600.chips }, (_, k) => (
                <span key={k} className="s-dia600__chip" data-dia600-chip>
                  {d.chip(chipNumber(k))}
                </span>
              ))}
            </div>
          </div>

          <div className="s-dia600__lines">
            {d.lines.map((line, i) => (
              <p key={i} className="s-dia600__line" data-dia600-line={i}>
                {line}
              </p>
            ))}
          </div>
          <a className="s-dia600__bridge" href="#derrube" data-dia600-bridge>
            {d.bridgeLink}
          </a>
        </div>
      </div>
    </div>
  );
}
