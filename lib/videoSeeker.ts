export type SeekState = { requested: number | null; inFlight: boolean; pending: number | null; presented: number | null; seeks: number };
export type SeekEvent = { type: "want"; k: number } | { type: "seeked" } | { type: "presented"; k: number } | { type: "reset" };
export const initialSeek: SeekState = { requested: null, inFlight: false, pending: null, presented: null, seeks: 0 };

export function seekReduce(s: SeekState, e: SeekEvent): { state: SeekState; seekTo: number | null } {
  if (e.type === "reset") return { state: { ...initialSeek }, seekTo: null };
  if (e.type === "presented") return { state: { ...s, presented: e.k }, seekTo: null };
  if (e.type === "seeked") {
    if (s.pending !== null && s.pending !== s.requested) {
      return { state: { ...s, requested: s.pending, pending: null, inFlight: true, seeks: s.seeks + 1 }, seekTo: s.pending };
    }
    return { state: { ...s, inFlight: false, pending: null }, seekTo: null };
  }
  if (e.k === s.requested) return { state: s.pending === null ? s : { ...s, pending: null }, seekTo: null };
  if (s.inFlight) return { state: { ...s, pending: e.k }, seekTo: null };
  return { state: { ...s, requested: e.k, pending: null, inFlight: true, seeks: s.seeks + 1 }, seekTo: e.k };
}

export function atFrame(s: SeekState, k: number): boolean {
  return !s.inFlight && s.pending === null && s.requested === k && s.presented === k;
}
