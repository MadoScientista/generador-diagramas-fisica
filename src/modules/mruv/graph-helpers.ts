const SAMPLE_COUNT = 100;
const TICK_COUNT = 6;

export interface GraphData {
  points: { t: number; x: number; v: number; a: number }[];
  tauStar: number | null;
}

function niceStep(range: number, targetTicks: number): number {
  const rough = range / (targetTicks - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  if (norm <= 2.5) return 5 * mag;
  if (norm <= 7.5) return 5 * mag;
  return 10 * mag;
}

export function computeNiceTicks(min: number, max: number): number[] {
  if (min === max) return [min];
  const step = niceStep(max - min, TICK_COUNT);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.001; v += step) {
    ticks.push(Math.round(v * 1e10) / 1e10);
  }
  if (!ticks.some((v) => v === 0) && min < 0 && max > 0) {
    ticks.push(0);
    ticks.sort((a, b) => a - b);
  }
  return ticks;
}

export function computeGraphData(resolved: {
  xi: number;
  vf: number;
  vi: number;
  a: number;
  t: number;
}): GraphData {
  const { xi, vi, a, t } = resolved;

  const points = Array.from({ length: SAMPLE_COUNT }, (_, i) => {
    const tau = (i / (SAMPLE_COUNT - 1)) * t;
    return {
      t: tau,
      x: xi + vi * tau + 0.5 * a * tau * tau,
      v: vi + a * tau,
      a,
    };
  });

  let tauStar: number | null = null;
  if (a !== 0) {
    const candidate = -vi / a;
    if (candidate > 0 && candidate < t) {
      tauStar = candidate;
    }
  }

  return { points, tauStar };
}
