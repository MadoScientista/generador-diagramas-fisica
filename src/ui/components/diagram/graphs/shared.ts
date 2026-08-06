import type { TextSegment } from '../../../../core/types.ts';
import { computeNiceTicks } from '../../../../modules/mruv/graph-helpers.ts';
import { formatValue, parseUnit } from '../../../../core/format.ts';
import { renderSegments } from '../../../../core/renderer.ts';

const WIDTH = 400;
const HEIGHT = 400;
const X_TICKS = 5;
const Y_TICKS = 6;
const EDGE_PAD = 10;
const MARGIN_LEFT = 110;
const MARGIN_BOTTOM = 50;
const RIGHT_PAD = 50;
const Y_TITLE_X = MARGIN_LEFT - 50;
const X_TITLE_OFFSET_Y = 46;
const X_POSITIONS = X_TICKS + 1;
const STROKE = '#2563eb';
const AXIS_COLOR = '#000';

export function renderGraph(
  points: { t: number; y: number }[],
  symbol: 'x' | 'v' | 'a',
  yUnit: string,
  timeUnit: string,
  yTitle: string,
  xTitle: string,
): string {
  if (points.length === 0) return '';

  const yValues = points.map((p) => p.y);
  let yMin = Math.min(0, ...yValues);
  let yMax = Math.max(0, ...yValues);

  const c = yValues[0];
  const isHorizontal = yValues.every(
    (v) => Math.abs(v - c) <= 1e-9 * Math.max(1, Math.abs(c)),
  );
  if (isHorizontal && c !== 0) {
    yMin = Math.min(0, 2 * c);
    yMax = Math.max(0, 2 * c);
  }

  const allNonNegative = yMin === 0;
  const yCount = allNonNegative ? Y_TICKS - 1 : Y_TICKS;

  const tMax = points[points.length - 1].t;
  const timeTicks = computeNiceTicks(0, tMax, X_POSITIONS);
  const yTicks = computeNiceTicks(yMin, yMax, yCount);
  const nTimeTicks = timeTicks.length;
  const nYTicks = yTicks.length;
  const tEnd = timeTicks[nTimeTicks - 1];
  const yMinVis = yTicks[0];
  const yMaxVis = yTicks[nYTicks - 1];
  const shortenYAxis = allNonNegative && yMinVis === 0;

  const fullYLineLength = HEIGHT - MARGIN_BOTTOM - EDGE_PAD;
  const yLineLength = shortenYAxis
    ? (fullYLineLength * nYTicks) / (nYTicks + 1)
    : fullYLineLength;
  const ySpacing = yLineLength / nYTicks;
  const plotH = ySpacing * (nYTicks - 1);
  const marginTop = EDGE_PAD + ySpacing;
  const axisBaseY = marginTop + plotH;
  const arrowEndY = EDGE_PAD;

  const plotW = ((WIDTH - MARGIN_LEFT - RIGHT_PAD) * (nTimeTicks - 1)) / nTimeTicks;
  const xSpacing = plotW / (nTimeTicks - 1);
  const toX = (t: number) => MARGIN_LEFT + (t / tEnd) * plotW;
  const toY = (v: number) =>
    marginTop + plotH - ((v - yMinVis) / (yMaxVis - yMinVis)) * plotH;

  const axisY0 = toY(0);
  const axisXEnd = toX(tEnd);
  const arrowEndX = axisXEnd + xSpacing;
  const translateY = shortenYAxis ? (HEIGHT - arrowEndY - (axisY0 + 16)) / 2 : 0;
  const axisY0Final = axisY0 + translateY;
  const axisLineStartYFinal = axisBaseY + translateY;
  const arrowEndYFinal = arrowEndY + translateY;
  const axisMidY = (axisLineStartYFinal + arrowEndYFinal) / 2;
  const axisMidX = (MARGIN_LEFT + arrowEndX) / 2;
  const toYFinal = (v: number) => toY(v) + translateY;

  const linePoints = points
    .map((p) => `${toX(p.t).toFixed(2)},${toYFinal(p.y).toFixed(2)}`)
    .join(' ');

  const yLabelSegments: TextSegment[] = [
    { text: symbol, dy: 0, fontSize: 14 },
    { text: '[', dy: 0, fontSize: 14 },
    ...parseUnit(yUnit),
    { text: ']', dy: 0, fontSize: 14 },
  ];

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <style>text { font-family: 'Inter', 'Roboto', sans-serif; font-size: 14px; }</style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="white" />
  <line x1="${MARGIN_LEFT}" y1="${axisY0Final}" x2="${arrowEndX}" y2="${axisY0Final}" stroke="${AXIS_COLOR}" stroke-width="1.5"/>
  <polygon points="${arrowEndX},${axisY0Final} ${arrowEndX - 4},${axisY0Final - 4} ${arrowEndX - 4},${axisY0Final + 4}" fill="${AXIS_COLOR}"/>
  <line x1="${MARGIN_LEFT}" y1="${axisLineStartYFinal}" x2="${MARGIN_LEFT}" y2="${arrowEndYFinal}" stroke="${AXIS_COLOR}" stroke-width="1.5"/>
  <polygon points="${MARGIN_LEFT},${arrowEndYFinal} ${MARGIN_LEFT - 4},${arrowEndYFinal + 4} ${MARGIN_LEFT + 4},${arrowEndYFinal + 4}" fill="${AXIS_COLOR}"/>
  ${timeTicks.filter((tick) => tick > 0).map((tick) => `<line x1="${toX(tick)}" y1="${axisY0Final - 3}" x2="${toX(tick)}" y2="${axisY0Final + 3}" stroke="${AXIS_COLOR}" stroke-width="1"/><text x="${toX(tick)}" y="${axisY0Final + 16}" text-anchor="middle" font-size="11" fill="${AXIS_COLOR}">${formatValue(tick)}</text>`).join('\n  ')}
  ${yTicks.map((tick) => `<line x1="${MARGIN_LEFT - 3}" y1="${toYFinal(tick)}" x2="${MARGIN_LEFT + 3}" y2="${toYFinal(tick)}" stroke="${AXIS_COLOR}" stroke-width="1"/><text x="${MARGIN_LEFT - 8}" y="${toYFinal(tick) + 4}" text-anchor="end" font-size="11" fill="${AXIS_COLOR}">${formatValue(tick)}</text>`).join('\n  ')}
  <text x="${arrowEndX}" y="${axisY0Final + 28}" text-anchor="middle" fill="#000">t[${timeUnit}]</text>
  <text x="${axisMidX}" y="${axisLineStartYFinal + X_TITLE_OFFSET_Y}" text-anchor="middle" font-size="13" fill="#000">${xTitle}</text>
  <text x="${MARGIN_LEFT - 16}" y="${arrowEndYFinal + 4}" text-anchor="end" fill="#000">${renderSegments(yLabelSegments)}</text>
  <text x="${Y_TITLE_X}" y="${axisMidY}" text-anchor="middle" transform="rotate(-90 ${Y_TITLE_X} ${axisMidY})" font-size="13" fill="#000">${yTitle}</text>
  <polyline points="${linePoints}" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

export function renderEmptyGraph(
  symbol: 'x' | 'v' | 'a',
  yUnit: string,
  timeUnit: string,
  yTitle: string,
  xTitle: string,
): string {
  const plotW = WIDTH - MARGIN_LEFT - RIGHT_PAD;
  const axisY0 = (EDGE_PAD + HEIGHT - MARGIN_BOTTOM + plotW) / 2;
  const arrowEndX = MARGIN_LEFT + plotW;
  const arrowEndY = axisY0 - plotW;
  const axisMidY = (axisY0 + arrowEndY) / 2;
  const axisMidX = (MARGIN_LEFT + arrowEndX) / 2;

  const yLabelSegments: TextSegment[] = [
    { text: symbol, dy: 0, fontSize: 14 },
    { text: '[', dy: 0, fontSize: 14 },
    ...parseUnit(yUnit),
    { text: ']', dy: 0, fontSize: 14 },
  ];

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <style>text { font-family: 'Inter', 'Roboto', sans-serif; font-size: 14px; }</style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="white" />
  <line x1="${MARGIN_LEFT}" y1="${axisY0}" x2="${arrowEndX}" y2="${axisY0}" stroke="${AXIS_COLOR}" stroke-width="1.5"/>
  <polygon points="${arrowEndX},${axisY0} ${arrowEndX - 4},${axisY0 - 4} ${arrowEndX - 4},${axisY0 + 4}" fill="${AXIS_COLOR}"/>
  <line x1="${MARGIN_LEFT}" y1="${axisY0}" x2="${MARGIN_LEFT}" y2="${arrowEndY}" stroke="${AXIS_COLOR}" stroke-width="1.5"/>
  <polygon points="${MARGIN_LEFT},${arrowEndY} ${MARGIN_LEFT - 4},${arrowEndY + 4} ${MARGIN_LEFT + 4},${arrowEndY + 4}" fill="${AXIS_COLOR}"/>
  <text x="${arrowEndX}" y="${axisY0 + 28}" text-anchor="middle" fill="#000">t[${timeUnit}]</text>
  <text x="${axisMidX}" y="${axisY0 + X_TITLE_OFFSET_Y}" text-anchor="middle" font-size="13" fill="#000">${xTitle}</text>
  <text x="${MARGIN_LEFT - 16}" y="${arrowEndY + 4}" text-anchor="end" fill="#000">${renderSegments(yLabelSegments)}</text>
  <text x="${Y_TITLE_X}" y="${axisMidY}" text-anchor="middle" transform="rotate(-90 ${Y_TITLE_X} ${axisMidY})" font-size="13" fill="#000">${yTitle}</text>
</svg>`;
}
