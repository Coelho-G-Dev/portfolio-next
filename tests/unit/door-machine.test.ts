import { describe, expect, it } from "vitest";
import { doorFromHash, doorReducer, hashFor, type DoorState } from "@/lib/doorMachine";

const closed = { phase: "closed" } as const;

describe("máquina das portas", () => {
  it("select abre; arrived chega; back sai; left fecha", () => {
    let s: DoorState = doorReducer(closed, { type: "select", door: "ia" });
    expect(s).toEqual({ phase: "entering", door: "ia" });
    s = doorReducer(s, { type: "arrived" });
    expect(s).toEqual({ phase: "open", door: "ia" });
    s = doorReducer(s, { type: "back" });
    expect(s).toEqual({ phase: "leaving", door: "ia" });
    s = doorReducer(s, { type: "left" });
    expect(s).toEqual(closed);
  });

  it("back no meio da entrada vira saída (reverte de onde está)", () => {
    expect(doorReducer({ phase: "entering", door: "ia" }, { type: "back" })).toEqual({
      phase: "leaving",
      door: "ia",
    });
  });

  it("clique em outra porta ou clique duplo durante animação é ignorado", () => {
    for (const phase of ["entering", "open", "leaving"] as const) {
      const s = { phase, door: "ia" };
      expect(doorReducer(s, { type: "select", door: "backend" })).toBe(s);
    }
  });

  it("jump (link direto) abre sem passar pela entrada", () => {
    expect(doorReducer(closed, { type: "jump", door: "backend" })).toEqual({
      phase: "open",
      door: "backend",
    });
  });

  it("eventos fora de ordem devolvem o mesmo objeto", () => {
    const open = { phase: "open", door: "ia" } as const;
    expect(doorReducer(closed, { type: "arrived" })).toBe(closed);
    expect(doorReducer(closed, { type: "back" })).toBe(closed);
    expect(doorReducer(closed, { type: "left" })).toBe(closed);
    expect(doorReducer(open, { type: "arrived" })).toBe(open);
    expect(doorReducer(open, { type: "left" })).toBe(open);
    expect(doorReducer(open, { type: "jump", door: "backend" })).toBe(open);
    const entering = { phase: "entering", door: "ia" } as const;
    expect(doorReducer(entering, { type: "left" })).toBe(entering);
    expect(doorReducer(entering, { type: "jump", door: "backend" })).toBe(entering);
    const leaving = { phase: "leaving", door: "ia" } as const;
    expect(doorReducer(leaving, { type: "arrived" })).toBe(leaving);
    expect(doorReducer(leaving, { type: "back" })).toBe(leaving);
  });

  it("hash: só #porta-<id conhecido> abre", () => {
    const ids = ["backend", "frontend", "ia"];
    expect(doorFromHash("#porta-ia", ids)).toBe("ia");
    expect(doorFromHash("#porta-xyz", ids)).toBeNull();
    expect(doorFromHash("#contato", ids)).toBeNull();
    expect(doorFromHash("", ids)).toBeNull();
    expect(hashFor("backend")).toBe("#porta-backend");
  });
});
