export type GridStyle = 'line' | 'dots' | 'dashed';

export interface GridSettings {
  visible: boolean;
  thickness: number;
  style: GridStyle;
}

export interface AxesSettings {
  visible: boolean;
  thickness: number;
}

export interface AxisSettings {
  visible: boolean;
  min: string;
  max: string;
  ticks: string;
  unit: string;
}

export interface PlanoCartesianoSettings {
  grid: GridSettings;
  axes: AxesSettings;
  xAxis: AxisSettings;
  yAxis: AxisSettings;
}

export type PlanoCartesianoSection = keyof PlanoCartesianoSettings;
