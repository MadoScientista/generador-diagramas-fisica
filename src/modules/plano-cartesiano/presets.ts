import type { PlanoCartesianoSettings } from './types.ts';
import { PLANO_CARTESIANO_DEFAULTS } from './defaults.ts';

export interface PlanoCartesianoPreset {
  id: string;
  label: string;
  settings: PlanoCartesianoSettings;
}

function cloneDefaults(): PlanoCartesianoSettings {
  return {
    grid: { ...PLANO_CARTESIANO_DEFAULTS.grid },
    axes: { ...PLANO_CARTESIANO_DEFAULTS.axes },
    xAxis: { ...PLANO_CARTESIANO_DEFAULTS.xAxis },
    yAxis: { ...PLANO_CARTESIANO_DEFAULTS.yAxis },
    appearance: { ...PLANO_CARTESIANO_DEFAULTS.appearance },
  };
}

export const PLANO_CARTESIANO_PRESETS: PlanoCartesianoPreset[] = [
  {
    id: 'estandar',
    label: 'Estándar',
    settings: cloneDefaults(),
  },
  {
    id: 'vacio',
    label: 'Solo ejes',
    settings: {
      ...cloneDefaults(),
      grid: { ...PLANO_CARTESIANO_DEFAULTS.grid, visible: false },
    },
  },
  {
    id: 'cuadrante',
    label: 'Primer cuadrante',
    settings: {
      ...cloneDefaults(),
      xAxis: { ...PLANO_CARTESIANO_DEFAULTS.xAxis, min: '0', max: '10', step: '1' },
      yAxis: { ...PLANO_CARTESIANO_DEFAULTS.yAxis, min: '0', max: '10', step: '1' },
    },
  },
  {
    id: 'solo-cuadricula',
    label: 'Solo cuadrícula',
    settings: {
      ...cloneDefaults(),
      axes: { ...PLANO_CARTESIANO_DEFAULTS.axes, visible: false },
    },
  },
];
