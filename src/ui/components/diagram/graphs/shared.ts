import { computeNiceTicks } from '../../../../modules/mruv/graph-helpers.ts';
import { formatValue } from '../../../../core/format.ts';

const WIDTH = 400;
const HEIGHT = 400;
const MARGIN = { top: 20, right: 20, bottom: 50, left: 60 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const STROKE = '#2563eb';
const AXIS_COLOR = '#000';

export function renderGraph(
  points: { t: number; x: number; v: number; a: number }[],
  getY: (p: { t: number; x: number; v: number; a: number }) => number,
  yLabel: string,
): string {
  if (points.length === 0) return '';

  const tMax = points[points.length - 1].t;
  const yValues = points.map(getY);
  const yMin = Math.min(0, ...yValues);
  const yMax = Math.max(0, ...yValues);
  const yRange = yMax - yMin || 1;
  const yPadding = yRange * 0.15;
  const yMinPadded = yMin - yPadding;
  const yMaxPadded = yMax + yPadding;

  const toX = (t: number) => MARGIN.left + (t / tMax) * PLOT_W;
  const toY = (v: number) =>
    MARGIN.top + PLOT_H - ((v - yMinPadded) / (yMaxPadded - yMinPadded)) * PLOT_H;

  const linePoints = points
    .map((p) => `${toX(p.t).toFixed(2)},${toY(getY(p)).toFixed(2)}`)
    .join(' ');

  const axisY0 = toY(0);
  const axisXEnd = toX(tMax);

  const timeTicks = computeNiceTicks(0, tMax).map((t) => ({ t, x: toX(t) }));
  const yTicks = computeNiceTicks(yMinPadded, yMaxPadded).map((v) => ({ v, y: toY(v) }));

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <style>text { font-family: 'Inter', 'Roboto', sans-serif; }</style>
  <line x1="${MARGIN.left}" y1="${axisY0}" x2="${axisXEnd + 10}" y2="${axisY0}" stroke="${AXIS_COLOR}" stroke-width="1.5"/>
  <polygon points="${axisXEnd + 10},${axisY0} ${axisXEnd + 4},${axisY0 - 4} ${axisXEnd + 4},${axisY0 + 4}" fill="${AXIS_COLOR}"/>
  <line x1="${MARGIN.left}" y1="${PLOT_H + MARGIN.top}" x2="${MARGIN.left}" y2="${MARGIN.top - 10}" stroke="${AXIS_COLOR}" stroke-width="1.5"/>
  <polygon points="${MARGIN.left},${MARGIN.top - 10} ${MARGIN.left - 4},${MARGIN.top - 4} ${MARGIN.left + 4},${MARGIN.top - 4}" fill="${AXIS_COLOR}"/>
  ${timeTicks.filter((tick) => tick.t > 0).map((tick) => `<line x1="${tick.x}" y1="${axisY0 - 3}" x2="${tick.x}" y2="${axisY0 + 3}" stroke="${AXIS_COLOR}" stroke-width="1"/><text x="${tick.x}" y="${axisY0 + 16}" text-anchor="middle" font-size="11" fill="${AXIS_COLOR}">${formatValue(tick.t)}</text>`).join('\n  ')}
  ${yTicks.map((tick) => `<line x1="${MARGIN.left - 3}" y1="${tick.y}" x2="${MARGIN.left + 3}" y2="${tick.y}" stroke="${AXIS_COLOR}" stroke-width="1"/><text x="${MARGIN.left - 8}" y="${tick.y + 4}" text-anchor="end" font-size="11" fill="${AXIS_COLOR}">${formatValue(tick.v)}</text>`).join('\n  ')}
  <text x="${WIDTH / 2}" y="${HEIGHT - 8}" text-anchor="middle" font-size="13" fill="#000">Tiempo (s)</text>
  <text x="14" y="${HEIGHT / 2}" text-anchor="middle" font-size="13" fill="#000" transform="rotate(-90, 14, ${HEIGHT / 2})">${yLabel}</text>
  <polyline points="${linePoints}" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}
