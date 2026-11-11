import type { Door } from "@/data/doors";

// Paleta "Tabuleiro" + acento âmbar (spec §5.1). Os mesmos hex vivem como
// tokens em app/site.css; o teste da paleta garante que não divergem.
export const PALETTE = {
  ebano: "#0E0F13",
  nogueiraEscura: "#2A2018",
  nogueira: "#8A6A4A",
  bordo: "#D9C3A0",
  marfim: "#F4EEE3",
  ambar: "#F5A524",
} as const;

export type Tone = keyof typeof PALETTE;

type Pair = { fg: Tone; bg: Tone };

// Pares de texto permitidos. Âmbar sobre marfim (1,77) e qualquer texto em
// nogueira ficam de fora de propósito.
export const TEXT_PAIRS: (Pair & { min: 4.5 | 3 })[] = [
  { fg: "marfim", bg: "ebano", min: 4.5 },
  { fg: "ebano", bg: "marfim", min: 4.5 },
  { fg: "bordo", bg: "ebano", min: 4.5 },
  { fg: "ebano", bg: "bordo", min: 4.5 },
  { fg: "marfim", bg: "nogueiraEscura", min: 4.5 },
  { fg: "bordo", bg: "nogueiraEscura", min: 4.5 },
  { fg: "nogueiraEscura", bg: "bordo", min: 4.5 },
  { fg: "nogueiraEscura", bg: "marfim", min: 4.5 },
  { fg: "ambar", bg: "ebano", min: 4.5 },
  { fg: "ambar", bg: "nogueiraEscura", min: 4.5 },
  { fg: "ebano", bg: "ambar", min: 4.5 },
];

// Folhas das portas (spec Portas §7.2). Fora de TEXT_PAIRS: nenhuma é cor de texto.
export const DOOR_TONES: Record<Door, { claro: string; escuro: string }> = {
  backend: { claro: "#2F5A46", escuro: "#1B3529" },
  frontend: { claro: "#7A2F2A", escuro: "#471A17" },
  ia: { claro: "#2D4166", escuro: "#18243D" },
};

// Bordas e ícones (WCAG 1.4.11, mínimo 3:1). Sobre bordo, a borda é nogueira escura.
export const UI_PAIRS: Pair[] = [
  { fg: "nogueira", bg: "marfim" },
  { fg: "nogueira", bg: "ebano" },
  { fg: "nogueiraEscura", bg: "bordo" },
];
