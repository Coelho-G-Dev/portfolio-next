import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { typedLength } from "@/lib/typewriter";

describe("typedLength", () => {
  it("não digita nada antes do atraso inicial de 700 ms", () => {
    expect(typedLength("abc", 0)).toBe(0);
    expect(typedLength("abc", 700)).toBe(0);
  });

  it("digita um caractere a cada 32 ms depois do atraso", () => {
    expect(typedLength("abc", 700 + 32)).toBe(1);
    expect(typedLength("abc", 700 + 64)).toBe(2);
  });

  it("para no tamanho do texto", () => {
    expect(typedLength("abc", 10_000)).toBe(3);
  });

  it("respeita opções próprias", () => {
    expect(typedLength("abcdef", 100, { msPerChar: 10, delayMs: 50 })).toBe(5);
  });

  it("propriedade: inteiro, dentro de [0, tamanho] e nunca decresce com o tempo", () => {
    fc.assert(
      fc.property(fc.string(), fc.nat(60_000), fc.nat(60_000), (text, a, b) => {
        const [t1, t2] = a <= b ? [a, b] : [b, a];
        const n1 = typedLength(text, t1);
        const n2 = typedLength(text, t2);
        expect(Number.isInteger(n1)).toBe(true);
        expect(n1).toBeGreaterThanOrEqual(0);
        expect(n1).toBeLessThanOrEqual(text.length);
        expect(n2).toBeGreaterThanOrEqual(n1);
      }),
      { numRuns: 500 },
    );
  });
});
