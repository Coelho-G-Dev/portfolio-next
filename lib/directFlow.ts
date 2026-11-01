// Modelo do sistema SEM fila do "Derrube um serviço" (spec §5.4). Separado de
// messageFlow de propósito: lá, a propriedade "perdidas = 0" é a promessa;
// aqui, a mesma queda perde a mensagem, e isso tem os seus próprios testes.

export type DirectService = "api" | "worker" | "db";

export type DirectStage = "interface" | "api" | "worker" | "delivered" | "lost";

export type DirectMessage = { id: number; stage: DirectStage; lostAt?: DirectService };

export type DirectEvent =
  | { kind: "sent"; id: number }
  | { kind: "delivered"; id: number }
  | { kind: "lost"; id: number; service: DirectService };

export type DirectState = {
  services: Record<DirectService, boolean>;
  messages: DirectMessage[];
  nextId: number;
  events: DirectEvent[];
};

export type DirectAction =
  | { type: "send" }
  | { type: "toggle"; service: DirectService }
  | { type: "tick" }
  | { type: "reset" };

export const initialDirect: DirectState = {
  services: { api: true, worker: true, db: true },
  messages: [],
  nextId: 1,
  events: [],
};

const MAX_EVENTS = 6;

function pushEvents(events: DirectEvent[], added: DirectEvent[]): DirectEvent[] {
  return [...added.reverse(), ...events].slice(0, MAX_EVENTS);
}

// Próximo passo de cada estágio e a peça de que ele depende.
const HOP: Partial<Record<DirectStage, { to: DirectStage; needs: DirectService }>> = {
  interface: { to: "api", needs: "api" },
  api: { to: "worker", needs: "worker" },
  worker: { to: "delivered", needs: "db" },
};

function advance(state: DirectState): DirectState {
  const added: DirectEvent[] = [];
  const messages = state.messages.map((m): DirectMessage => {
    const hop = HOP[m.stage];
    if (!hop) return m;
    if (!state.services[hop.needs]) {
      added.push({ kind: "lost", id: m.id, service: hop.needs });
      return { ...m, stage: "lost", lostAt: hop.needs };
    }
    if (hop.to === "delivered") added.push({ kind: "delivered", id: m.id });
    return { ...m, stage: hop.to };
  });
  return { ...state, messages, events: pushEvents(state.events, added) };
}

export function directReducer(state: DirectState, action: DirectAction): DirectState {
  switch (action.type) {
    case "send": {
      const id = state.nextId;
      return {
        ...state,
        nextId: id + 1,
        messages: [...state.messages, { id, stage: "interface" }],
        events: pushEvents(state.events, [{ kind: "sent", id }]),
      };
    }
    case "toggle":
      return { ...state, services: { ...state.services, [action.service]: !state.services[action.service] } };
    case "tick":
      return advance(state);
    case "reset":
      return initialDirect;
  }
}

export function countDirect(state: DirectState) {
  const delivered = state.messages.filter((m) => m.stage === "delivered").length;
  const lost = state.messages.filter((m) => m.stage === "lost").length;
  return { sent: state.messages.length, delivered, lost, inFlight: state.messages.length - delivered - lost };
}
