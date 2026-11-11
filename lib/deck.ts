import { smooth } from "./cortina";

export type DeckMode = "full" | "compact" | "list";
export const DECK_ROOM = 48;
export const DECK_RETURN = 24;

export function deckMode(prev: DeckMode | null, fullMax: number, compactMax: number, stageH: number): DeckMode {
  const rank = { list: 0, compact: 1, full: 2 };
  const fits = (mode: "full" | "compact", height: number) =>
    height <= stageH - DECK_ROOM - (prev !== null && rank[mode] > rank[prev] ? DECK_RETURN : 0);
  if (fits("full", fullMax)) return "full";
  if (fits("compact", compactMax)) return "compact";
  return "list";
}

// Matemática do baralho do "Como eu trabalho" (spec §6): com o trecho preso,
// as cartas entram de baixo, uma sobre a outra. d é o progresso do trecho.

export type DeckCard = { y: number; rotate: number; scale: number; shade: number };

// Folga do progresso: a última carta chega antes do fim do trecho, e o fim
// fica um pouco parado com ela na frente.
const PACE = 1.15;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
// O toEqual distingue −0 de 0.
const unsign = (v: number) => v + 0;

// Quanto a carta j já entrou (0 a 1). A carta 0 já começa na frente.
function enter(j: number, d: number, n: number): number {
  if (j === 0) return 1;
  return clamp01((d * PACE - (j - 1) / (n - 1)) * (n - 1));
}

// Entrada suavizada de cada carta em d (e, de 0 a 1): guia a subida, o giro
// e, no hook, o desfoque e a opacidade de quem ainda entra.
export function deckEntrance(d: number, n: number): number[] {
  return Array.from({ length: n }, (_, j) => easeOutCubic(enter(j, d, n)));
}

// Posição de cada carta em d ∈ [0, 1], com n cartas e a janela de altura vh.
// y em px (para baixo), rotate em graus.
export function deckLayout(d: number, n: number, vh: number): DeckCard[] {
  const entered = Array.from({ length: n }, (_, j) => enter(j, d, n));
  return entered.map((en, j) => {
    const e = easeOutCubic(en);
    let above = 0;
    for (let k = j + 1; k < n; k++) above += smooth(entered[k]);
    return {
      y: unsign((1 - e) * 0.85 * vh - 18 * above),
      rotate: unsign((1 - e) * 7 + (j % 2 === 1 ? -1 : 1) * Math.min(above, 1) * 1.2),
      scale: unsign(1 - 0.05 * above),
      shade: unsign(Math.min(0.45, 0.18 * above)),
    };
  });
}

// Progresso em que a carta j está inteira na frente, sem nenhuma por cima.
export function deckProgressFor(j: number, n: number): number {
  if (n <= 1) return 0;
  return Math.max(0, j / ((n - 1) * PACE));
}
