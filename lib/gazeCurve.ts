export const FPS = 24;

export function frameForPos(pos: number, frames: number, neutral: number, curve?: readonly number[]): number {
  const p = Number.isNaN(pos) ? 0.5 : Math.max(0, Math.min(1, pos));
  let k: number;
  if (curve) {
    let lo = 0, hi = curve.length - 1;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (curve[mid] <= p) lo = mid; else hi = mid;
    }
    k = lo + (p - curve[lo]) / (curve[hi] - curve[lo]);
  } else {
    k = p <= 0.5 ? p * 2 * neutral : neutral + (p - 0.5) * 2 * (frames - 1 - neutral);
  }
  return Math.max(0, Math.min(frames - 1, Math.round(k)));
}

export function frameTime(k: number, fps = FPS): number { return (k + 0.5) / fps; }
export function frameFromMediaTime(t: number, fps = FPS): number { return Math.round(t * fps); }
