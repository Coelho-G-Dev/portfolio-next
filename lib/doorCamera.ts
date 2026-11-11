export type DOMRectLike = { left: number; top: number; width: number; height: number };

export type CameraTarget = { x: number; y: number; z: number; k: number };

// Folga da chegada: a abertura cobre o palco ampliado em 5%, e o batente fica
// fora da tela.
const MARGIN = 1.05;
const MIN_K = 3;
const EPS = 1e-9;

// Menor k ≥ `min` em que a abertura, ampliada k vezes em torno do centro do
// palco, cobre um retângulo de meia-largura `a` e meia-altura `b` centrado nele.
// A abertura tem meia-largura `r`, meia-altura `h` e arco no topo: semicírculo
// de raio `r` (border-radius 999px 999px 0 0) com centro `d = h − r` acima do
// centro dela. Ampliada, o centro sobe para k·d e o raio vira k·r.
function coverK(a: number, b: number, r: number, h: number, min: number): number {
  const d = h - r;
  const covers = (k: number) => {
    if (k * r < a * (1 - EPS) || k * h < b * (1 - EPS)) return false;
    if (k * d >= b) return true; // cantos abaixo do centro do arco: basta a largura
    return a * a + (b - k * d) ** 2 <= (k * r) ** 2 * (1 + EPS);
  };
  // O conjunto dos k que cobrem começa num destes pontos: o mínimo, onde a
  // largura ou a altura passam a caber, onde o canto cruza o centro do arco ou
  // onde o arco passa pelo canto, a² + (b − k·d)² = (k·r)².
  const candidates = [min, a / r, b / h];
  if (d > 0) candidates.push(b / d);
  const A = r * r - d * d;
  if (Math.abs(A) < EPS) {
    if (d > 0) candidates.push((a * a + b * b) / (2 * b * d));
  } else {
    const disc = (b * d) ** 2 + A * (a * a + b * b);
    if (disc >= 0) candidates.push((-b * d + Math.sqrt(disc)) / A, (-b * d - Math.sqrt(disc)) / A);
  }
  const sorted = candidates.filter((k) => Number.isFinite(k) && k >= min).sort((p, q) => p - q);
  return sorted.find(covers) ?? sorted[sorted.length - 1];
}

export function cameraTarget(
  stage: DOMRectLike,
  reveal: DOMRectLike,
  perspective: number,
): CameraTarget {
  const x = stage.left + stage.width / 2 - (reveal.left + reveal.width / 2);
  const y = stage.top + stage.height / 2 - (reveal.top + reveal.height / 2);
  // A abertura (com o arco) chega cobrindo o palco inteiro com folga: o quadro de
  // chegada é só a sala (miniatura = palco × 1/k, em escala 1).
  const k = coverK(
    (MARGIN * stage.width) / 2,
    (MARGIN * stage.height) / 2,
    reveal.width / 2,
    reveal.height / 2,
    MIN_K,
  );
  const z = perspective * (1 - 1 / k);
  return { x, y, z, k };
}
