// O dia de 600 toneladas (spec §7.2 e §10.4): etapas, peças do código,
// números e pontos do trecho num lugar só. O texto fica em lib/i18n/site.ts
// (about.dia600). Se a etapa que faz o papel da fila mudar, muda aqui.

export type Dia600Stage = {
  id: "pedido" | "separacao" | "conferencia" | "carregamento" | "lojas";
  code: "interface" | "api" | "queue" | "worker" | "db";
};

export const DIA600_STAGES: readonly Dia600Stage[] = [
  { id: "pedido", code: "interface" },
  { id: "separacao", code: "api" },
  { id: "conferencia", code: "queue" },
  { id: "carregamento", code: "worker" },
  { id: "lojas", code: "db" },
];

// linesAt: progresso em que cada frase entra. morph: trecho da troca dos nomes.
export const DIA600 = {
  baseTons: 300,
  peakTons: 600,
  trucks: 40,
  lost: 0,
  chips: 16,
  linesAt: [0, 0.25, 0.5, 0.7, 0.86],
  morph: [0.84, 0.94],
} as const;
