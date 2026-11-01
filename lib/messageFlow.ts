// Máquina de estados da simulação "Derrube um serviço".
// Lógica pura: nenhum estado leva a uma mensagem perdida. Cada falha
// mantém a mensagem onde ela está, ou a leva para a DLQ, de onde volta.

export type ServiceId = "api" | "queue" | "worker" | "db";

export type Stage = "interface" | "api" | "queue" | "worker" | "dlq" | "delivered";

export type Message = {
  id: number;
  stage: Stage;
  attempts: number;
  // Ticks que faltam até a próxima tentativa (espera crescente).
  wait: number;
};

export type FlowEvent =
  | { kind: "sent"; id: number }
  | { kind: "waitingApi"; id: number }
  | { kind: "outbox"; id: number }
  | { kind: "waitingWorker"; id: number }
  | { kind: "retry"; id: number; attempt: number; max: number; delay: number }
  | { kind: "toDlq"; id: number }
  | { kind: "replayed"; id: number }
  | { kind: "delivered"; id: number };

export type FlowState = {
  services: Record<ServiceId, boolean>;
  messages: Message[];
  nextId: number;
  events: FlowEvent[];
};

export const MAX_ATTEMPTS = 3;

// Espera depois da tentativa `attempt` que falhou: 1, 2, 4… ticks.
export function backoffTicks(attempt: number): number {
  return 2 ** (attempt - 1);
}

// A maior espera possível antes da última tentativa.
export const MAX_BACKOFF = backoffTicks(MAX_ATTEMPTS - 1);

export const initialFlow: FlowState = {
  services: { api: true, queue: true, worker: true, db: true },
  messages: [],
  nextId: 1,
  events: [],
};

export type FlowAction =
  | { type: "send" }
  | { type: "toggle"; service: ServiceId }
  | { type: "tick" }
  | { type: "replay" }
  | { type: "reset" };

const MAX_EVENTS = 6;

function pushEvents(events: FlowEvent[], added: FlowEvent[]): FlowEvent[] {
  return [...added.reverse(), ...events].slice(0, MAX_EVENTS);
}

// Um passo do relógio: cada mensagem anda no máximo uma camada.
function advance(state: FlowState): FlowState {
  const { services } = state;
  const added: FlowEvent[] = [];

  const messages = state.messages.map((m): Message => {
    switch (m.stage) {
      case "interface":
        if (services.api) return { ...m, stage: "api" };
        added.push({ kind: "waitingApi", id: m.id });
        return m;
      case "api":
        if (services.queue) return { ...m, stage: "queue" };
        added.push({ kind: "outbox", id: m.id });
        return m;
      case "queue":
        if (services.worker) return { ...m, stage: "worker" };
        added.push({ kind: "waitingWorker", id: m.id });
        return m;
      case "worker": {
        if (m.wait > 0) return { ...m, wait: m.wait - 1 };
        if (services.db) {
          added.push({ kind: "delivered", id: m.id });
          return { ...m, stage: "delivered" };
        }
        const attempt = m.attempts + 1;
        if (attempt >= MAX_ATTEMPTS) {
          added.push({ kind: "toDlq", id: m.id });
          return { ...m, stage: "dlq", attempts: attempt };
        }
        const delay = backoffTicks(attempt);
        added.push({ kind: "retry", id: m.id, attempt, max: MAX_ATTEMPTS, delay });
        return { ...m, attempts: attempt, wait: delay };
      }
      default:
        return m;
    }
  });

  return { ...state, messages, events: pushEvents(state.events, added) };
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "send": {
      const id = state.nextId;
      return {
        ...state,
        nextId: id + 1,
        messages: [...state.messages, { id, stage: "interface", attempts: 0, wait: 0 }],
        events: pushEvents(state.events, [{ kind: "sent", id }]),
      };
    }
    case "toggle":
      return {
        ...state,
        services: { ...state.services, [action.service]: !state.services[action.service] },
      };
    case "tick":
      return advance(state);
    case "replay": {
      const replayed = state.messages.filter((m) => m.stage === "dlq");
      if (replayed.length === 0) return state;
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.stage === "dlq" ? { ...m, stage: "queue", attempts: 0, wait: 0 } : m,
        ),
        events: pushEvents(
          state.events,
          replayed.map((m) => ({ kind: "replayed", id: m.id })),
        ),
      };
    }
    case "reset":
      return initialFlow;
  }
}

export function countByStage(state: FlowState) {
  const delivered = state.messages.filter((m) => m.stage === "delivered").length;
  const dlq = state.messages.filter((m) => m.stage === "dlq").length;
  return {
    sent: state.messages.length,
    delivered,
    dlq,
    inFlight: state.messages.length - delivered - dlq,
    // Toda mensagem enviada está em algum estágio conhecido; nada sai do sistema.
    lost: state.messages.length - state.messages.filter((m) => m.stage).length,
  };
}
