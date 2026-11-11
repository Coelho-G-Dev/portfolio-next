import { describe, expect, it } from "vitest";
import { initialSeek, seekReduce, atFrame } from "@/lib/videoSeeker";

describe("seeker com último alvo pendente", () => {
  it("não pede o mesmo quadro cinquenta vezes", () => {
    let state = initialSeek, issued = 0;
    for (let i = 0; i < 50; i++) { const r = seekReduce(state, { type: "want", k: 10 }); state = r.state; if (r.seekTo !== null) issued++; }
    expect(issued).toBe(1);
    expect(state.seeks).toBe(1);
    state = seekReduce(state, { type: "seeked" }).state;
    expect(seekReduce(state, { type: "want", k: 10 }).seekTo).toBeNull();
  });
  it("descarta alvos intermediários e emite somente o mais recente", () => {
    let state = seekReduce(initialSeek, { type: "want", k: 10 }).state;
    for (const k of [11, 12, 13]) { const r = seekReduce(state, { type: "want", k }); state = r.state; expect(r.seekTo).toBeNull(); }
    const r = seekReduce(state, { type: "seeked" });
    expect(r.seekTo).toBe(13);
    expect(r.state.seeks).toBe(2);
    expect(r.state.pending).toBeNull();
  });
  it("voltar ao alvo em andamento cancela o pendente", () => {
    let state = seekReduce(initialSeek, { type: "want", k: 10 }).state;
    state = seekReduce(state, { type: "want", k: 11 }).state;
    state = seekReduce(state, { type: "want", k: 10 }).state;
    expect(state.pending).toBeNull();
    expect(seekReduce(state, { type: "seeked" }).seekTo).toBeNull();
  });
  it("só confirma o quadro depois do seek concluído e da apresentação", () => {
    let state = seekReduce(initialSeek, { type: "want", k: 58 }).state;
    expect(atFrame(state, 58)).toBe(false);
    state = seekReduce(state, { type: "presented", k: 58 }).state;
    expect(atFrame(state, 58)).toBe(false);
    state = seekReduce(state, { type: "seeked" }).state;
    expect(atFrame(state, 58)).toBe(true);
    expect(atFrame(state, 57)).toBe(false);
    const reset = seekReduce(state, { type: "reset" });
    expect(reset.state).toEqual(initialSeek);
    expect(reset.seekTo).toBeNull();
  });
});
