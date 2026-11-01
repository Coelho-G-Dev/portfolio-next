import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  countDirect,
  directReducer,
  initialDirect,
  type DirectAction,
  type DirectService,
  type DirectState,
} from "@/lib/directFlow";

const run = (actions: DirectAction[], from: DirectState = initialDirect) => actions.reduce(directReducer, from);
const ticks = (n: number): DirectAction[] => Array.from({ length: n }, () => ({ type: "tick" }));
const toggle = (service: DirectService): DirectAction => ({ type: "toggle", service });

describe("Derrube sem fila: modelo direto", () => {
  it("com tudo no ar, entrega em 3 passos", () => {
    const state = run([{ type: "send" }, ...ticks(3)]);
    expect(state.messages[0].stage).toBe("delivered");
    expect(countDirect(state)).toEqual({ sent: 1, delivered: 1, lost: 0, inFlight: 0 });
    expect(state.events[0]).toEqual({ kind: "delivered", id: 1 });
  });

  it("com a API fora, a mensagem se perde na entrada", () => {
    const state = run([toggle("api"), { type: "send" }, ...ticks(3)]);
    expect(state.messages[0]).toMatchObject({ stage: "lost", lostAt: "api" });
  });

  it("com o worker fora, a mensagem se perde e o log avisa", () => {
    const state = run([toggle("worker"), { type: "send" }, ...ticks(3)]);
    expect(state.messages[0]).toMatchObject({ stage: "lost", lostAt: "worker" });
    expect(state.events[0]).toEqual({ kind: "lost", id: 1, service: "worker" });
    expect(countDirect(state).lost).toBe(1);
  });

  it("com o banco fora, a mensagem se perde no último passo", () => {
    const state = run([toggle("db"), { type: "send" }, ...ticks(3)]);
    expect(state.messages[0]).toMatchObject({ stage: "lost", lostAt: "db" });
  });

  it("religar a peça não ressuscita uma mensagem perdida", () => {
    const lost = run([toggle("worker"), { type: "send" }, ...ticks(3)]);
    const after = run([toggle("worker"), ...ticks(5)], lost);
    expect(after.messages[0].stage).toBe("lost");
  });

  it("o log guarda só os 6 eventos mais recentes", () => {
    const state = run(Array.from({ length: 8 }, () => ({ type: "send" }) as DirectAction));
    expect(state.events).toHaveLength(6);
    expect(state.events.map((e) => e.id)).toEqual([8, 7, 6, 5, 4, 3]);
  });

  it("reset volta ao estado inicial", () => {
    expect(run([toggle("db"), { type: "send" }, { type: "reset" }])).toEqual(initialDirect);
  });

  describe("propriedades", () => {
    const action: fc.Arbitrary<DirectAction> = fc.oneof(
      fc.constant<DirectAction>({ type: "send" }),
      fc.constant<DirectAction>({ type: "tick" }),
      fc.constantFrom<DirectService>("api", "worker", "db").map(toggle),
    );

    it("toda mensagem está em exatamente um estado e perdida continua perdida", () => {
      fc.assert(
        fc.property(fc.array(action, { maxLength: 200 }), (actions) => {
          let state = initialDirect;
          const lostIds = new Set<number>();
          for (const a of actions) {
            state = directReducer(state, a);
            for (const m of state.messages) {
              if (lostIds.has(m.id)) expect(m.stage).toBe("lost");
              if (m.stage === "lost") lostIds.add(m.id);
            }
          }
          const c = countDirect(state);
          expect(c.sent).toBe(actions.filter((a) => a.type === "send").length);
          expect(c.delivered + c.lost + c.inFlight).toBe(c.sent);
          expect(new Set(state.messages.map((m) => m.id)).size).toBe(c.sent);
        }),
        { numRuns: 500 },
      );
    });

    it("com tudo no ar o tempo todo, nada se perde", () => {
      const noToggles = fc.oneof(fc.constant<DirectAction>({ type: "send" }), fc.constant<DirectAction>({ type: "tick" }));
      fc.assert(
        fc.property(fc.array(noToggles, { maxLength: 200 }), (actions) => {
          expect(countDirect(run(actions)).lost).toBe(0);
        }),
        { numRuns: 300 },
      );
    });
  });
});
