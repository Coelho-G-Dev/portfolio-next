import { describe, expect, it } from "vitest";
import { appStatus } from "@/lib/derrubeApp";

describe("tela do AuthGuard: estado a partir da mensagem mais recente", () => {
  it("sem mensagem, aguarda o cadastro", () => {
    expect(appStatus("queue", undefined)).toBe("idle");
    expect(appStatus("direct", undefined)).toBe("idle");
  });

  describe("com fila", () => {
    it("na interface (API fora), está conectando", () => {
      expect(appStatus("queue", "interface")).toBe("connecting");
    });

    it.each(["api", "queue", "worker", "dlq"] as const)("em %s, a conta já existe e o e-mail está processando", (stage) => {
      expect(appStatus("queue", stage)).toBe("processing");
    });

    it("entregue, mostra o e-mail entregue", () => {
      expect(appStatus("queue", "delivered")).toBe("delivered");
    });
  });

  describe("sem fila", () => {
    it.each(["interface", "api", "worker"] as const)("em %s, está processando", (stage) => {
      expect(appStatus("direct", stage)).toBe("processing");
    });

    it("entregue, mostra o e-mail entregue", () => {
      expect(appStatus("direct", "delivered")).toBe("delivered");
    });

    it("perdida, mostra erro", () => {
      expect(appStatus("direct", "lost")).toBe("error");
    });
  });
});
