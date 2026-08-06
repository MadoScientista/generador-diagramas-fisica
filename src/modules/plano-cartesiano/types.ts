export type GridStyle = 'line' | 'dots' | 'dashed';

export interface GridSettings {
  visible: boolean;
  thickness: number;
  style: GridStyle;
  color: string;
}

export interface AxesSettings {
  visible: boolean;
  thickness: number;
  color: string;
}

export interface AxisSettings {
  visible: boolean;
  label: string;
  min: string;
  max: string;
  step: string;
  unit: string;
}

export type PlaneBackground = 'white' | 'transparent';

export interface AppearanceSettings {
  labelColor: string;
  labelFontSize: number;
  background: PlaneBackground;
}

export interface PlanoCartesianoSettings {
  grid: GridSettings;
  axes: AxesSettings;
  xAxis: AxisSettings;
  yAxis: AxisSettings;
  appearance: AppearanceSettings;
}

export type PlanoCartesianoSection = keyof PlanoCartesianoSettings;
