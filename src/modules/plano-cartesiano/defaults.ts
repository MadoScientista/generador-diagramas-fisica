import type { PlanoCartesianoSettings } from './types.ts';

export const PLANO_CARTESIANO_DEFAULTS: PlanoCartesianoSettings = {
  grid: {
    visible: true,
    thickness: 1,
    style: 'line',
  },
  axes: {
    visible: true,
    thickness: 2,
  },
  xAxis: {
    visible: true,
    min: '-10',
    max: '10',
    ticks: '10',
    unit: 'm',
  },
  yAxis: {
    visible: true,
    min: '-10',
    max: '10',
    ticks: '10',
    unit: 'm',
  },
};
