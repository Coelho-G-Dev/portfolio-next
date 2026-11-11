import { DIA600 } from "@/data/dia600";
import { smooth } from "./cortina";

// Quadro do dia de 600 toneladas para o progresso p do trecho (spec §10.2).
export type Dia600Frame = {
  tons: number;
  trucks: number;
  chips: Array<{ pos: number; visible: boolean }>;
  line: number;
  morph: number;
};

// A carga chega ao pico em 80% do trecho; o resto é a troca dos nomes.
const LOAD_END = 0.8;
// Distância, em colunas, entre uma ficha e a seguinte.
const CHIP_GAP = 0.42;
// Colunas percorridas pela primeira ficha até a carga encher.
const CHIP_RUN = 9;
const COLUMNS = 5;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export function dia600Frame(p: number): Dia600Frame {
  const load = clamp01(p / LOAD_END);
  const [morphFrom, morphTo] = DIA600.morph;

  const chips = Array.from({ length: DIA600.chips }, (_, k) => {
    const pos = load * CHIP_RUN - CHIP_GAP * k;
    return { pos, visible: pos > 0 && pos < COLUMNS && p < morphFrom };
  });

  let line = 0;
  DIA600.linesAt.forEach((at, i) => {
    if (p >= at) line = i;
  });

  return {
    tons: Math.round(DIA600.baseTons + (DIA600.peakTons - DIA600.baseTons) * load),
    trucks: Math.floor(DIA600.trucks * load),
    chips,
    line,
    morph: smooth(clamp01((p - morphFrom) / (morphTo - morphFrom))),
  };
}
