// Matemática da Cortina (spec §5.3): cada capítulo sobe por cima do anterior.

// A partir desta cobertura, o capítulo de trás conta como coberto (o vídeo do
// personagem pausa, o relógio da simulação para).
export const COVERED_AT = 0.9;

// Topo do sticky. Um capítulo mais alto que a tela gruda pela base: só fica
// preso quando a base dele chega à base da tela, então o próximo cartão nunca
// cobre conteúdo ainda não lido.
export function stickTop(height: number, viewport: number): number {
  return Math.min(0, viewport - height);
}

// Fração da tela já coberta pelo capítulo seguinte, cujo topo está em nextTop.
export function coverage(nextTop: number, viewport: number): number {
  return Math.min(1, Math.max(0, (viewport - nextTop) / viewport));
}

const MAX_SHRINK = 0.05;
const MAX_SHADE = 0.45;

// Efeito no capítulo de trás. No celular, só a sobreposição e o escurecimento;
// com movimento reduzido, nada.
export function chapterEffect(
  cover: number,
  opts: { compact: boolean; reduced: boolean },
): { scale: number; shade: number } {
  if (opts.reduced) return { scale: 1, shade: 0 };
  return {
    scale: opts.compact ? 1 : 1 - MAX_SHRINK * cover,
    shade: MAX_SHADE * cover,
  };
}
