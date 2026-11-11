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

// Rolagem que deixa um elemento focado inteiro na tela e sem folha por cima
// (WCAG 2.4.11). Posições em fluxo, no documento. Centra o elemento, mas sem
// passar do ponto em que o capítulo dele gruda: dali em diante o seguinte o
// cobriria. O último capítulo não tem seguinte e não gruda.
export function uncoverScroll(
  el: { top: number; height: number },
  chapter: { top: number; height: number },
  viewport: number,
  last: boolean,
): number {
  const centered = el.top - (viewport - el.height) / 2;
  const stuckAt = last ? Infinity : chapter.top + Math.max(0, chapter.height - viewport);
  return Math.max(0, Math.min(centered, stuckAt));
}

// Efeito máximo no capítulo de trás, totalmente coberto (spec §5.1).
export const MAX_SHRINK = 0.07;
export const MAX_SHADE = 0.6;
export const MAX_SHADE_COMPACT = 0.45;
export const MAX_ROUND = 28;

// Curva suave (smoothstep) aplicada à cobertura.
export function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

// Efeito no capítulo de trás. No celular, sem escala; com movimento reduzido,
// nada. A escala é arredondada a 6 casas: 1 − 0,07 dá 0,9299999… em ponto
// flutuante.
export function chapterEffect(
  cover: number,
  opts: { compact: boolean; reduced: boolean },
): { scale: number; shade: number; round: number } {
  if (opts.reduced) return { scale: 1, shade: 0, round: 0 };
  const e = smooth(cover);
  return {
    scale: opts.compact ? 1 : Math.round((1 - MAX_SHRINK * e) * 1e6) / 1e6,
    shade: (opts.compact ? MAX_SHADE_COMPACT : MAX_SHADE) * e,
    round: MAX_ROUND * e,
  };
}
