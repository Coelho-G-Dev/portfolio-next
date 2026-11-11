export type DoorState =
  | { phase: "closed" }
  | { phase: "entering" | "open" | "leaving"; door: string };

export type DoorEvent =
  | { type: "select"; door: string }
  | { type: "arrived" }
  | { type: "back" }
  | { type: "left" }
  | { type: "jump"; door: string };

const HASH_PREFIX = "#porta-";

export function doorReducer(s: DoorState, e: DoorEvent): DoorState {
  switch (s.phase) {
    case "closed":
      if (e.type === "select") return { phase: "entering", door: e.door };
      if (e.type === "jump") return { phase: "open", door: e.door };
      return s;
    case "entering":
      if (e.type === "arrived") return { phase: "open", door: s.door };
      if (e.type === "back") return { phase: "leaving", door: s.door };
      return s;
    case "open":
      if (e.type === "back") return { phase: "leaving", door: s.door };
      return s;
    case "leaving":
      if (e.type === "left") return { phase: "closed" };
      return s;
  }
}

export function hashFor(door: string): string {
  return HASH_PREFIX + door;
}

export function doorFromHash(hash: string, ids: readonly string[]): string | null {
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const id = hash.slice(HASH_PREFIX.length);
  return ids.includes(id) ? id : null;
}
