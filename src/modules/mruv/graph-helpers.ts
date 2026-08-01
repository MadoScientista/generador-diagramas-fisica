const SAMPLE_COUNT = 100;
const TICK_COUNT = 5;
const NICE_STEPS = [1, 2, 2.5, 5, 10];
const MIN_TICKS = 5;
const MAX_TICKS = 10;

export interface GraphData {
  points: { t: number; x: number; v: number; a: number }[];
  tauStar: number | null;
}

function niceStep(range: number, targetTicks: number): number {
  const rough = range / (targetTicks - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const nice = NICE_STEPS.find((n) => norm <= n + 1e-9);
  return (nice ?? 10) * mag;
}

function nextNiceStep(step: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(step)));
  const norm = step / mag;
  const idx = NICE_STEPS.findIndex((n) => Math.abs(n - norm) < 1e-9);
  if (idx >= 0 && idx < NICE_STEPS.length - 1) return NICE_STEPS[idx + 1] * mag;
  return 10 * mag * 10;
}

function buildTicks(min: number, step: number, count: number): number[] {
  const start = Math.floor(min / step) * step;
  return Array.from({ length: count }, (_, k) => Math.round((start + k * step) * 1e10) / 1e10);
}

export function computeNiceTicks(min: number, max: number, count: number = TICK_COUNT): number[] {
  if (min === max) {
    const pad = Math.max(Math.abs(min), 1);
    min -= pad;
    max += pad;
  }

  const range = max - min;
  const startMag = Math.floor(Math.log10(range / MAX_TICKS));
  const endMag = Math.ceil(Math.log10(range / MIN_TICKS));

  let best: { ticks: number[]; overshoot: number; step: number } | null = null;

  for (let k = startMag; k <= endMag; k++) {
    for (const nice of NICE_STEPS) {
      const step = nice * Math.pow(10, k);
      const start = Math.floor(min / step) * step;
      const n = Math.ceil((max - start) / step - 1e-9) + 1;
      if (n < MIN_TICKS || n > MAX_TICKS) continue;

      const ticks = Array.from({ length: n }, (_, i) =>
        Math.round((start + i * step) * 1e10) / 1e10
      );
      const overshoot = ticks[ticks.length - 1] - max;

      if (
        best === null ||
        overshoot < best.overshoot ||
        (Math.abs(overshoot - best.overshoot) < 1e-9 && step > best.step)
      ) {
        best = { ticks, overshoot, step };
      }
    }
  }

  if (best !== null) return best.ticks;

  let step = niceStep(range, count);
  let ticks = buildTicks(min, step, count);
  while (ticks[count - 1] < max) {
    step = nextNiceStep(step);
    ticks = buildTicks(min, step, count);
  }
  return ticks;
}

export function computeGraphData(resolved: {
  xi: number;
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

  return { points, tauStar: null };
}
