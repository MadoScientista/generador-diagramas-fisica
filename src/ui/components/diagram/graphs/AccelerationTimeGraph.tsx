import type { GraphData } from '../../../../modules/mruv/graph-helpers.ts';
import { computeNiceTicks } from '../../../../modules/mruv/graph-helpers.ts';
import { formatValue } from '../../../../core/format.ts';

interface AccelerationTimeGraphProps {
  data: GraphData;
}

const WIDTH = 400;
const HEIGHT = 400;
const MARGIN = { top: 20, right: 20, bottom: 50, left: 60 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

const STROKE = '#2563eb';
const AXIS_COLOR = '#000';
const TAU_COLOR = '#dc2626';

export function AccelerationTimeGraph({ data }: AccelerationTimeGraphProps) {
  const { points, tauStar } = data;
  if (points.length === 0) return null;

  const tMax = points[points.length - 1].t;
  const aVal = points[0].a;

  const aMin = Math.min(0, aVal);
  const aMax = Math.max(0, aVal);
  const aRange = aMax - aMin || 1;
  const aPadding = aRange * 0.15;
  const yMin = aMin - aPadding;
  const yMax = aMax + aPadding;

  const toX = (t: number) => MARGIN.left + (t / tMax) * PLOT_W;
  const toY = (a: number) => MARGIN.top + PLOT_H - ((a - yMin) / (yMax - yMin)) * PLOT_H;

  const linePoints = points.map((p) => `${toX(p.t).toFixed(2)},${toY(p.a).toFixed(2)}`).join(' ');

  const axisY0 = toY(0);
  const axisXEnd = toX(tMax);

  const timeTicks = computeNiceTicks(0, tMax).map((t) => ({ t, x: toX(t) }));
  const aTicks = computeNiceTicks(yMin, yMax).map((a) => ({ a, y: toY(a) }));

  const tauElements =
    tauStar !== null
      ? `<line x1="${toX(tauStar)}" y1="${axisY0}" x2="${toX(tauStar)}" y2="${toY(aVal)}" stroke="${TAU_COLOR}" stroke-width="1" stroke-dasharray="4,3"/>
         <circle cx="${toX(tauStar)}" cy="${toY(aVal)}" r="4" fill="${TAU_COLOR}"/>
         <text x="${toX(tauStar) + 8}" y="${toY(aVal) - 8}" font-size="12" fill="${TAU_COLOR}" font-weight="500">τ* = ${formatValue(tauStar)} s</text>`
      : '';

  const svg = `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <style>text { font-family: 'Inter', 'Roboto', sans-serif; }</style>
  <line x1="${MARGIN.left}" y1="${axisY0}" x2="${axisXEnd + 10}" y2="${axisY0}" stroke="${AXIS_COLOR}" stroke-width="1.5"/>
  <polygon points="${axisXEnd + 10},${axisY0} ${axisXEnd + 4},${axisY0 - 4} ${axisXEnd + 4},${axisY0 + 4}" fill="${AXIS_COLOR}"/>
  <line x1="${MARGIN.left}" y1="${PLOT_H + MARGIN.top}" x2="${MARGIN.left}" y2="${MARGIN.top - 10}" stroke="${AXIS_COLOR}" stroke-width="1.5"/>
  <polygon points="${MARGIN.left},${MARGIN.top - 10} ${MARGIN.left - 4},${MARGIN.top - 4} ${MARGIN.left + 4},${MARGIN.top - 4}" fill="${AXIS_COLOR}"/>
  ${timeTicks.filter((tick) => tick.t > 0).map((tick) => `<line x1="${tick.x}" y1="${axisY0 - 3}" x2="${tick.x}" y2="${axisY0 + 3}" stroke="${AXIS_COLOR}" stroke-width="1"/><text x="${tick.x}" y="${axisY0 + 16}" text-anchor="middle" font-size="11" fill="${AXIS_COLOR}">${formatValue(tick.t)}</text>`).join('\n  ')}
  ${aTicks.map((tick) => `<line x1="${MARGIN.left - 3}" y1="${tick.y}" x2="${MARGIN.left + 3}" y2="${tick.y}" stroke="${AXIS_COLOR}" stroke-width="1"/><text x="${MARGIN.left - 8}" y="${tick.y + 4}" text-anchor="end" font-size="11" fill="${AXIS_COLOR}">${formatValue(tick.a)}</text>`).join('\n  ')}
  <text x="${WIDTH / 2}" y="${HEIGHT - 8}" text-anchor="middle" font-size="13" fill="#000">Tiempo (s)</text>
  <text x="14" y="${HEIGHT / 2}" text-anchor="middle" font-size="13" fill="#000" transform="rotate(-90, 14, ${HEIGHT / 2})">Aceleración (m/s²)</text>
  <polyline points="${linePoints}" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  ${tauElements}
</svg>`;

  return svg;
}
