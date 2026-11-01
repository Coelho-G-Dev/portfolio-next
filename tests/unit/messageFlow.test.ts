import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  backoffTicks,
  countByStage,
  flowReducer,
  initialFlow,
  MAX_ATTEMPTS,
  MAX_BACKOFF,
  type FlowAction,
  type FlowState,
  type ServiceId,
} from "@/lib/messageFlow";

function run(actions: FlowAction[], from: FlowState = initialFlow) {
  return actions.reduce(flowReducer, from);
}

const ticks = (n: number): FlowAction[] => Array.from({ length: n }, () => ({ type: "tick" }));
const toggle = (service: ServiceId): FlowAction => ({ type: "toggle", service });

describe("Derrube um serviço: máquina de estados", () => {
  it("com tudo no ar, a mensagem é entregue em 4 passos", () => {
    const state = run([{ type: "send" }, ...ticks(4)]);
    expect(state.messages[0].stage).toBe("delivered");
    expect(countByStage(state)).toMatchObject({ sent: 1, delivered: 1, dlq: 0, inFlight: 0, lost: 0 });
    expect(state.events[0]).toEqual({ kind: "delivered", id: 1 });
  });

  it("com a API fora, a mensagem espera na interface", () => {
    const state = run([toggle("api"), { type: "send" }, ...ticks(5)]);
    expect(state.messages[0].stage).toBe("interface");
    expect(state.events[0]).toEqual({ kind: "waitingApi", id: 1 });
  });

  it("com a fila fora, a mensagem fica na outbox da API", () => {
    const state = run([toggle("queue"), { type: "send" }, ...ticks(5)]);
    expect(state.messages[0].stage).toBe("api");
    expect(state.events[0]).toEqual({ kind: "outbox", id: 1 });
  });

  it("com o worker fora, a mensagem fica na fila e segue quando ele volta", () => {
    const down = run([toggle("worker"), { type: "send" }, ...ticks(6)]);
    expect(down.messages[0].stage).toBe("queue");
    expect(down.events[0]).toEqual({ kind: "waitingWorker", id: 1 });

    const back = run([toggle("worker"), ...ticks(2)], down);
    expect(back.messages[0].stage).toBe("delivered");
  });

  it(`com o banco fora, tenta ${MAX_ATTEMPTS} vezes e vai para a DLQ`, () => {
    const state = run([toggle("db"), { type: "send" }, ...ticks(3 + MAX_ATTEMPTS + 1 + 2)]);
    expect(state.messages[0]).toMatchObject({ stage: "dlq", attempts: MAX_ATTEMPTS });
    const kinds = state.events.map((e) => e.kind);
    expect(kinds[0]).toBe("toDlq");
    expect(kinds.filter((k) => k === "retry")).toHaveLength(MAX_ATTEMPTS - 1);
  });

  it("as tentativas esperam 1 e depois 2 ticks (espera crescente)", () => {
    expect([1, 2].map(backoffTicks)).toEqual([1, 2]);
    expect(MAX_BACKOFF).toBe(2);

    let state = run([toggle("db"), { type: "send" }]);
    const seen: { tick: number; kind: string; delay?: number }[] = [];
    for (let tick = 1; tick <= 12; tick++) {
      const before = state.events[0];
      state = flowReducer(state, { type: "tick" });
      const e = state.events[0];
      if (e !== before && (e.kind === "retry" || e.kind === "toDlq")) {
        seen.push({ tick, kind: e.kind, delay: e.kind === "retry" ? e.delay : undefined });
      }
    }
    expect(seen.map((s) => s.kind)).toEqual(["retry", "retry", "toDlq"]);
    expect(seen.map((s) => s.delay).slice(0, 2)).toEqual([1, 2]);
    // 1 tick de espera + a tentativa; depois 2 de espera + a tentativa.
    expect(seen[1].tick - seen[0].tick).toBe(2);
    expect(seen[2].tick - seen[1].tick).toBe(3);
  });

  it("reprocessar com o banco ainda fora volta para a DLQ, sem perder", () => {
    const inDlq = run([toggle("db"), { type: "send" }, ...ticks(3 + MAX_ATTEMPTS + 1 + 2)]);
    const again = run([{ type: "replay" }, ...ticks(2 + MAX_ATTEMPTS + MAX_BACKOFF + 1)], inDlq);
    expect(again.messages[0].stage).toBe("dlq");
    expect(countByStage(again).lost).toBe(0);
  });

  it("reprocessar a DLQ com o banco de volta entrega a mensagem", () => {
    const inDlq = run([toggle("db"), { type: "send" }, ...ticks(3 + MAX_ATTEMPTS + 1 + 2)]);
    const state = run([toggle("db"), { type: "replay" }, ...ticks(2)], inDlq);
    expect(state.messages[0]).toMatchObject({ stage: "delivered", attempts: 0, wait: 0 });
    expect(state.events.map((e) => e.kind)).toContain("replayed");
  });

  it("reprocessar com a DLQ vazia não muda nada", () => {
    const state = run([{ type: "send" }]);
    expect(flowReducer(state, { type: "replay" })).toBe(state);
  });

  it("o log guarda só os 6 eventos mais recentes, do mais novo ao mais velho", () => {
    const state = run(Array.from({ length: 8 }, () => ({ type: "send" }) as FlowAction));
    expect(state.events).toHaveLength(6);
    expect(state.events.map((e) => e.id)).toEqual([8, 7, 6, 5, 4, 3]);
  });

  it("reset volta ao estado inicial", () => {
    expect(run([toggle("db"), { type: "send" }, { type: "reset" }])).toEqual(initialFlow);
  });

  describe("propriedade: nenhuma mensagem se perde", () => {
    const action: fc.Arbitrary<FlowAction> = fc.oneof(
      fc.constant<FlowAction>({ type: "send" }),
      fc.constant<FlowAction>({ type: "tick" }),
      fc.constant<FlowAction>({ type: "replay" }),
      fc.constantFrom<ServiceId>("api", "queue", "worker", "db").map(toggle),
    );

    it("em qualquer sequência, toda mensagem enviada está em exatamente um estágio", () => {
      fc.assert(
        fc.property(fc.array(action, { maxLength: 200 }), (actions) => {
          const state = run(actions);
          const counts = countByStage(state);
          const sends = actions.filter((a) => a.type === "send").length;

          expect(counts.lost).toBe(0);
          expect(counts.sent).toBe(sends);
          expect(counts.delivered + counts.dlq + counts.inFlight).toBe(counts.sent);
          expect(new Set(state.messages.map((m) => m.id)).size).toBe(sends);
          for (const m of state.messages) expect(m.attempts).toBeLessThanOrEqual(MAX_ATTEMPTS);
        }),
        { numRuns: 500 },
      );
    });

    it("com todos os serviços de volta e a DLQ reprocessada, tudo é entregue", () => {
      fc.assert(
        fc.property(fc.array(action, { maxLength: 120 }), (actions) => {
          const messy = run(actions);
          const healed: FlowState = {
            ...messy,
            services: { api: true, queue: true, worker: true, db: true },
          };
          const done = run([{ type: "replay" }, ...ticks(4 + MAX_BACKOFF)], healed);
          const counts = countByStage(done);
          expect(counts.delivered).toBe(counts.sent);
          expect(counts.lost).toBe(0);
        }),
        { numRuns: 300 },
      );
    });
  });
});
