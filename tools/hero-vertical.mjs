// Matemática do pipeline vertical. Nenhuma leitura de arquivo ou processo aqui.
const median = (values) => {
  if (!values.length) throw new Error("amostra vazia");
  const sorted = [...values].sort((a, b) => a - b), k = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[k] : (sorted[k - 1] + sorted[k]) / 2;
};
export function median3(m) {
  return m.map((v, k) => median([m[Math.max(0, k - 1)], v, m[Math.min(m.length - 1, k + 1)]]));
}
export function noiseOf(mt, from = 56, to = 63) {
  if (mt.length <= to) throw new Error("cauda de ruído incompleta");
  return median(mt.slice(from, to + 1));
}
export function firstFrame(mt, b, max = 8) {
  let f = 1;
  while (f < mt.length && mt[f] - b < 0.05) f++;
  if (f > max || f >= mt.length) throw new Error(`início fora do limite: ${f}`);
  return f;
}
export function lastFrame(mt, b, F, end = 63, share = 0.98) {
  const energy = mt.slice(F, end + 1).map(v => Math.max(0, v - b));
  const total = energy.reduce((sum, v) => sum + v, 0);
  if (!(total > 0)) throw new Error("sem movimento útil");
  let sum = 0;
  for (let i = 0; i < energy.length; i++) {
    sum += energy[i];
    if (sum >= total * share) return F + i;
  }
  return end;
}
export function balanceK(cuts) {
  if (!cuts.length || cuts.some(c => !Number.isInteger(c.F) || !Number.isInteger(c.L) || c.F < 1 || c.L < c.F)) throw new Error("cortes inválidos");
  return Math.min(...cuts.map(c => c.L - c.F + 1));
}
export function buildCurve(up, down, K) {
  const energy = Array(2 * K + 1).fill(0), curve = Array(2 * K + 1).fill(0);
  for (let k = 1; k < K; k++) energy[k] = Math.max(0, up.mt[up.F + K - k] - up.b);
  energy[K] = Math.max(0, up.mt[up.F + 1] - up.b);
  energy[K + 1] = Math.max(0, down.mt[down.F + 1] - down.b);
  for (let k = K + 2; k < energy.length; k++) energy[k] = Math.max(0, down.mt[down.F + k - K - 1] - down.b);
  const half = (start, end, base) => {
    const values = energy.slice(start, end + 1);
    if (!(values.reduce((sum, v) => sum + v, 0) > 0)) throw new Error("metade sem movimento útil");
    const strict = values.map(v => Math.max(v, 1e-4)), total = strict.reduce((sum, v) => sum + v, 0);
    let sum = 0;
    strict.forEach((v, j) => { sum += v; curve[start + j] = base + 0.5 * sum / total; });
  };
  half(1, K, 0); half(K + 1, 2 * K, 0.5);
  curve[K] = 0.5; curve[2 * K] = 1;
  return curve;
}
export function inverseCurve(curve, p) {
  const value = Number.isNaN(p) ? 0.5 : Math.min(1, Math.max(0, p));
  let lo = 0, hi = curve.length - 1;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (curve[mid] < value) lo = mid; else hi = mid;
  }
  return Math.round(lo + (value - curve[lo]) / (curve[hi] - curve[lo]));
}
export function realEnergy(m, K, bUp, bDown) {
  return m.map((v, k) => Math.max(0, v - (k <= K ? bUp : bDown)));
}
export function binRatios(energy, curve, K) {
  if (energy.length !== 2 * K + 1 || curve.length !== energy.length) throw new Error("tamanhos incompatíveis");
  const bins = Array.from({ length: 10 }, (_, i) => energy.slice(inverseCurve(curve, i / 10) + 1, inverseCurve(curve, (i + 1) / 10) + 1).reduce((sum, v) => sum + v, 0));
  const means = [bins.slice(0, 5), bins.slice(5)].map(part => part.reduce((sum, v) => sum + v, 0) / 5);
  return bins.map((v, i) => means[i < 5 ? 0 : 1] > 0 ? v / means[i < 5 ? 0 : 1] : 0);
}
export function gates(input) {
  const { motion, K, bUp, bDown, curve, neutralSsim, nativeSsim, nativeReference, canonicalSource, bytes, firstLoad } = input;
  const ratio = Math.max(...motion.slice(1)) / median(motion.slice(1));
  const energy = realEnergy(motion, K, bUp, bDown), bins = binRatios(energy, curve, K);
  const still = [energy.slice(1, K + 1), energy.slice(K + 1)].map(part => part.filter(v => v < 0.05).length);
  return {
    G1: { value: ratio, pass: Number.isFinite(ratio) && ratio <= 3 },
    G1b: { value: neutralSsim, pass: neutralSsim.length === 2 && neutralSsim.every(v => Number.isFinite(v) && v >= 0.95) },
    G2: { value: bins, pass: bins.every(v => Number.isFinite(v) && v >= 0.5 && v <= 2) },
    G3: { value: still, pass: still.every(v => v <= 2) },
    G4: { value: { nativeSsim, nativeReference }, pass: canonicalSource === true && Number.isFinite(nativeSsim) && Number.isFinite(nativeReference) && nativeSsim >= nativeReference - 0.005 },
    G6: { value: { bytes, firstLoad }, pass: bytes > 0 && bytes <= 533585 && firstLoad === 748528 },
  };
}
