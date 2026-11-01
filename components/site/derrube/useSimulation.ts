"use client";

import { useEffect, useReducer, useState } from "react";
import type { Mode } from "@/lib/derrubeApp";
import { countDirect, directReducer, initialDirect, type DirectService, type DirectStage } from "@/lib/directFlow";
import { countByStage, flowReducer, initialFlow, type ServiceId, type Stage } from "@/lib/messageFlow";

export const TICK_MS = 750;

export type SimMessage = { id: number; stage: Stage | DirectStage; lostAt?: DirectService };

// Junta os dois modelos (com e sem fila) atrás de uma interface só. Trocar de
// modo recomeça os dois, com todas as peças no ar: nada de um modo vaza para o
// outro e nenhum timer antigo continua. O relógio só anda com mensagem em
// trânsito, e para com o capítulo coberto ou a aba oculta.
export function useSimulation(paused: boolean) {
  const [mode, setModeState] = useState<Mode>("queue");
  const [queue, dispatchQueue] = useReducer(flowReducer, initialFlow);
  const [direct, dispatchDirect] = useReducer(directReducer, initialDirect);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const qc = countByStage(queue);
  const dc = countDirect(direct);
  const inFlight = mode === "queue" ? qc.inFlight : dc.inFlight;
  const running = inFlight > 0 && !paused && !hidden;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (mode === "queue") dispatchQueue({ type: "tick" });
      else dispatchDirect({ type: "tick" });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, mode]);

  const setMode = (next: Mode) => {
    dispatchQueue({ type: "reset" });
    dispatchDirect({ type: "reset" });
    setModeState(next);
  };

  const toggle = (service: ServiceId) => {
    if (mode === "queue") dispatchQueue({ type: "toggle", service });
    else if (service !== "queue") dispatchDirect({ type: "toggle", service });
  };

  const messages: SimMessage[] = mode === "queue" ? queue.messages : direct.messages;
  const services: Partial<Record<ServiceId, boolean>> = mode === "queue" ? queue.services : direct.services;

  return {
    mode,
    setMode,
    send: () => (mode === "queue" ? dispatchQueue({ type: "send" }) : dispatchDirect({ type: "send" })),
    toggle,
    replay: () => dispatchQueue({ type: "replay" }),
    reset: () => (mode === "queue" ? dispatchQueue({ type: "reset" }) : dispatchDirect({ type: "reset" })),
    messages,
    services,
    events: mode === "queue" ? queue.events : direct.events,
    counts:
      mode === "queue"
        ? { sent: qc.sent, delivered: qc.delivered, lost: qc.lost, dlq: qc.dlq }
        : { sent: dc.sent, delivered: dc.delivered, lost: dc.lost, dlq: 0 },
    latestStage: messages[messages.length - 1]?.stage,
  };
}
