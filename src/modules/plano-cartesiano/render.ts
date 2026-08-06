import { formatValue } from '../../core/format.ts';
import type { PlanoCartesianoSettings, AxisSettings } from './types.ts';

const CANVAS = 500;
const MARGIN = 56;
const PLOT = CANVAS - 2 * MARGIN;
const AXIS_COLOR = '#000';
const GRID_COLOR = '#d4d4d4';
const TICK_SIZE = 4;
const ARROW_SIZE = 6;

export interface RenderResult {
  svg: string | null;
  error: string | null;
}

interface ParsedAxis {
  min: number;
  max: number;
  ticks: number;
  step: number;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseAxis(settings: AxisSettings, label: string): ParsedAxis | string {
  if (settings.min.trim() === '' || !Number.isFinite(Number(settings.min))) {
    return `El mínimo del eje ${label} no es un número válido.`;
  }
  if (settings.max.trim() === '' || !Number.isFinite(Number(settings.max))) {
    return `El máximo del eje ${label} no es un número válido.`;
  }
  const min = Number(settings.min);
  const max = Number(settings.max);
  if (min >= max) {
    return `El mínimo del eje ${label} debe ser menor que el máximo.`;
  }
  const ticks = Number(settings.ticks);
  if (!Number.isInteger(ticks) || ticks < 1) {
    return `El número de divisiones del eje ${label} debe ser un entero mayor o igual a 1.`;
  }
  return { min, max, ticks, step: (max - min) / ticks };
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

export function renderPlanoCartesiano(settings: PlanoCartesianoSettings): RenderResult {
  const parsedX = parseAxis(settings.xAxis, 'X');
  if (typeof parsedX === 'string') return { svg: null, error: parsedX };
  const parsedY = parseAxis(settings.yAxis, 'Y');
  if (typeof parsedY === 'string') return { svg: null, error: parsedY };

  const x = parsedX;
  const y = parsedY;

  const plotLeft = MARGIN;
  const plotTop = MARGIN;
  const plotRight = MARGIN + PLOT;
  const plotBottom = MARGIN + PLOT;

  const toX = (v: number) => plotLeft + ((v - x.min) / (x.max - x.min)) * PLOT;
  const toY = (v: number) => plotTop + ((y.max - v) / (y.max - y.min)) * PLOT;

  const axisX = clamp(toX(0), plotLeft, plotRight);
  const axisY = clamp(toY(0), plotTop, plotBottom);

  const fmt = (n: number) => n.toFixed(2);

  let gridSvg = '';
  if (settings.grid.visible) {
    const drawLines = settings.grid.style !== 'dots';
    const dash = settings.grid.style === 'dashed' ? ` stroke-dasharray="6 4"` : '';
    const elements: string[] = [];
    if (drawLines) {
      for (let k = 0; k <= x.ticks; k++) {
        const xPos = toX(x.min + k * x.step);
        elements.push(
          `<line x1="${fmt(xPos)}" y1="${plotTop}" x2="${fmt(xPos)}" y2="${plotBottom}" stroke="${GRID_COLOR}" stroke-width="${settings.grid.thickness}"${dash}/>`,
        );
      }
      for (let k = 0; k <= y.ticks; k++) {
        const yPos = toY(y.min + k * y.step);
        elements.push(
          `<line x1="${plotLeft}" y1="${fmt(yPos)}" x2="${plotRight}" y2="${fmt(yPos)}" stroke="${GRID_COLOR}" stroke-width="${settings.grid.thickness}"${dash}/>`,
        );
      }
    }
    if (settings.grid.style === 'dots') {
      for (let k = 0; k <= x.ticks; k++) {
        const xPos = toX(x.min + k * x.step);
        for (let m = 0; m <= y.ticks; m++) {
          const yPos = toY(y.min + m * y.step);
          elements.push(
            `<circle cx="${fmt(xPos)}" cy="${fmt(yPos)}" r="1.5" fill="${GRID_COLOR}" stroke="none"/>`,
          );
        }
      }
    }
    gridSvg = elements.join('\n  ');
  }

  const axisStrokeWidth = settings.axes.thickness;

  let axisXSvg = '';
  if (settings.axes.visible && settings.xAxis.visible) {
    const startX = x.min < 0 ? Math.max(plotLeft - PLOT / x.ticks, 4) : plotLeft;
    const endX = Math.min(plotRight + PLOT / x.ticks, CANVAS - 4);
    const ticks: string[] = [];
    for (let k = 0; k <= x.ticks; k++) {
      const v = x.min + k * x.step;
      const xPos = toX(v);
      ticks.push(
        `<line x1="${fmt(xPos)}" y1="${axisY - TICK_SIZE}" x2="${fmt(xPos)}" y2="${axisY + TICK_SIZE}" stroke="${AXIS_COLOR}" stroke-width="1"/>`,
      );
      const isZero = Math.abs(v) < 1e-9;
      if (isZero && x.min < 0 && y.min < 0) {
        ticks.push(
          `<text x="${fmt(axisX - TICK_SIZE - 6)}" y="${fmt(axisY + TICK_SIZE + 14)}" text-anchor="end" font-size="11" fill="${AXIS_COLOR}">${formatValue(v)}</text>`,
        );
      } else if (!(isZero && x.min >= 0 && y.min < 0)) {
        ticks.push(
          `<text x="${fmt(xPos)}" y="${axisY + TICK_SIZE + 14}" text-anchor="middle" font-size="11" fill="${AXIS_COLOR}">${formatValue(v)}</text>`,
        );
      }
    }
    axisXSvg = `
  <line x1="${startX}" y1="${fmt(axisY)}" x2="${fmt(endX)}" y2="${fmt(axisY)}" stroke="${AXIS_COLOR}" stroke-width="${axisStrokeWidth}"/>
  <polygon points="${fmt(endX)},${fmt(axisY)} ${fmt(endX - ARROW_SIZE)},${fmt(axisY - ARROW_SIZE)} ${fmt(endX - ARROW_SIZE)},${fmt(axisY + ARROW_SIZE)}" fill="${AXIS_COLOR}"/>
  ${ticks.join('\n  ')}
  <text x="${fmt(Math.min(endX, CANVAS - 20))}" y="${fmt(axisY + TICK_SIZE + 14)}" text-anchor="middle" font-size="13" fill="${AXIS_COLOR}">x (${escapeXml(settings.xAxis.unit)})</text>`;
  }

  let axisYSvg = '';
  if (settings.axes.visible && settings.yAxis.visible) {
    const startY = y.min < 0 ? Math.min(plotBottom + PLOT / y.ticks, CANVAS - 4) : plotBottom;
    const endY = Math.max(plotTop - PLOT / y.ticks, 4);
    const ticks: string[] = [];
    for (let k = 0; k <= y.ticks; k++) {
      const v = y.min + k * y.step;
      const yPos = toY(v);
      ticks.push(
        `<line x1="${axisX - TICK_SIZE}" y1="${fmt(yPos)}" x2="${axisX + TICK_SIZE}" y2="${fmt(yPos)}" stroke="${AXIS_COLOR}" stroke-width="1"/>`,
      );
      const isZero = Math.abs(v) < 1e-9;
      if (!(isZero && x.min < 0)) {
        ticks.push(
          `<text x="${axisX - TICK_SIZE - 6}" y="${fmt(yPos + 4)}" text-anchor="end" font-size="11" fill="${AXIS_COLOR}">${formatValue(v)}</text>`,
        );
      }
    }
    const unitLabelX = axisX - ARROW_SIZE - 4;
    const unitLabelY = endY + 4;
    axisYSvg = `
  <line x1="${fmt(axisX)}" y1="${startY}" x2="${fmt(axisX)}" y2="${fmt(endY)}" stroke="${AXIS_COLOR}" stroke-width="${axisStrokeWidth}"/>
  <polygon points="${fmt(axisX)},${fmt(endY)} ${fmt(axisX - ARROW_SIZE)},${fmt(endY + ARROW_SIZE)} ${fmt(axisX + ARROW_SIZE)},${fmt(endY + ARROW_SIZE)}" fill="${AXIS_COLOR}"/>
  ${ticks.join('\n  ')}
  <text x="${fmt(unitLabelX)}" y="${fmt(unitLabelY)}" text-anchor="end" font-size="13" fill="${AXIS_COLOR}">y (${escapeXml(settings.yAxis.unit)})</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}" role="img" aria-label="Plano cartesiano">
  <style>text { font-family: 'Inter', 'Roboto', sans-serif; }</style>
  <rect width="${CANVAS}" height="${CANVAS}" fill="white"/>
  ${gridSvg}
  ${axisXSvg}
  ${axisYSvg}
</svg>`;

  return { svg, error: null };
}
