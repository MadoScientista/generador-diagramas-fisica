import type { PlanoCartesianoSettings } from './types.ts';

export const PLANO_COLOR_OPTIONS = [
  { id: 'negro', label: 'Negro', value: '#1f2430' },
  { id: 'gris', label: 'Gris', value: '#7a8595' },
  { id: 'azul', label: 'Azul', value: '#4a7ab8' },
  { id: 'rojo', label: 'Rojo', value: '#b05a55' },
] as const;

export const PLANO_CARTESIANO_DEFAULTS: PlanoCartesianoSettings = {
  grid: {
    visible: true,
    thickness: 1,
    style: 'line',
    color: '#4a7ab8',
  },
  axes: {
    visible: true,
    thickness: 2,
    color: '#1f2430',
  },
  xAxis: {
    visible: true,
    label: 'x',
    min: '-10',
    max: '10',
    step: '2',
    unit: 'm',
  },
  yAxis: {
    visible: true,
    label: 'y',
    min: '-10',
    max: '10',
    step: '2',
    unit: 'm',
  },
  appearance: {
    labelColor: '#1f2430',
    labelFontSize: 11,
    background: 'white',
  },
};
