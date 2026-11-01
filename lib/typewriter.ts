export type TypeOptions = { msPerChar?: number; delayMs?: number };

// Quantos caracteres já aparecem depois de `elapsedMs` de digitação.
export function typedLength(text: string, elapsedMs: number, opts: TypeOptions = {}): number {
  const { msPerChar = 32, delayMs = 700 } = opts;
  const typed = Math.floor((elapsedMs - delayMs) / msPerChar);
  return Math.max(0, Math.min(text.length, typed));
}
