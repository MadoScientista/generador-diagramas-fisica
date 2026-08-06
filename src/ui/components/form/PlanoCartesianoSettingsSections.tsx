import type { ReactNode } from 'react';
import { ToggleSwitch } from '../shared/ToggleSwitch.tsx';
import type {
  PlanoCartesianoSettings,
  PlanoCartesianoSection,
  GridSettings,
  AxesSettings,
  AxisSettings,
  GridStyle,
} from '../../../modules/plano-cartesiano/types.ts';

type ChangeHandler = (
  section: PlanoCartesianoSection,
  patch: Partial<PlanoCartesianoSettings[PlanoCartesianoSection]>,
) => void;

const GRID_STYLES: { value: GridStyle; label: string }[] = [
  { value: 'line', label: 'Línea' },
  { value: 'dots', label: 'Puntos' },
  { value: 'dashed', label: 'Segmentada' },
];

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

function NumberStepper({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  ariaLabel,
  compact = false,
}: {
  id?: string;
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel: string;
  compact?: boolean;
}) {
  const parsed = Number(value);
  const current = Number.isFinite(parsed) ? parsed : 0;
  const clamp = (v: number) => {
    let result = v;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
  };
  return (
    <div className={`number-stepper${compact ? ' number-stepper--compact' : ''}`}>
      <button
        type="button"
        className="number-stepper-btn"
        onClick={() => onChange(String(clamp(current - step)))}
        disabled={min !== undefined && current <= min}
        aria-label={`Disminuir ${ariaLabel}`}
      >
        −
      </button>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className="number-stepper-btn"
        onClick={() => onChange(String(clamp(current + step)))}
        disabled={max !== undefined && current >= max}
        aria-label={`Aumentar ${ariaLabel}`}
      >
        +
      </button>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <NumberStepper id={id} value={value} min={min} max={max} step={step} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

export function GridSection({ settings, onChange }: { settings: GridSettings; onChange: ChangeHandler }) {
  return (
    <>
      <SettingRow label="Visibilidad">
        <ToggleSwitch
          checked={settings.visible}
          label="Mostrar cuadrícula"
          onChange={() => onChange('grid', { visible: !settings.visible })}
        />
      </SettingRow>
      <SettingRow label="Grosor">
        <NumberStepper
          value={settings.thickness}
          min={0}
          onChange={(v) => onChange('grid', { thickness: Number(v) })}
          ariaLabel="Grosor de la cuadrícula en pixeles"
          compact
        />
      </SettingRow>
      <SettingRow label="Estilo">
        <select
          className="settings-select"
          value={settings.style}
          onChange={(e) => onChange('grid', { style: e.target.value as GridStyle })}
          aria-label="Estilo de la cuadrícula"
        >
          {GRID_STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </SettingRow>
    </>
  );
}

export function AxesSection({ settings, onChange }: { settings: AxesSettings; onChange: ChangeHandler }) {
  return (
    <>
      <SettingRow label="Visibilidad">
        <ToggleSwitch
          checked={settings.visible}
          label="Mostrar ejes"
          onChange={() => onChange('axes', { visible: !settings.visible })}
        />
      </SettingRow>
      <SettingRow label="Grosor">
        <NumberStepper
          value={settings.thickness}
          min={0}
          onChange={(v) => onChange('axes', { thickness: Number(v) })}
          ariaLabel="Grosor de los ejes en pixeles"
          compact
        />
      </SettingRow>
    </>
  );
}

export function GeneralSection({
  axes,
  grid,
  onChange,
}: {
  axes: AxesSettings;
  grid: GridSettings;
  onChange: ChangeHandler;
}) {
  return (
    <>
      <h4 className="settings-subtitle">Ejes</h4>
      <AxesSection settings={axes} onChange={onChange} />
      <h4 className="settings-subtitle">Cuadrícula</h4>
      <GridSection settings={grid} onChange={onChange} />
    </>
  );
}

export function AxisSection({
  axis,
  settings,
  onChange,
}: {
  axis: 'xAxis' | 'yAxis';
  settings: AxisSettings;
  onChange: ChangeHandler;
}) {
  const prefix = axis === 'xAxis' ? 'x' : 'y';
  const axisLabel = axis === 'xAxis' ? 'X' : 'Y';
  const minNum = Number(settings.min);
  const maxNum = Number(settings.max);
  const maxStep =
    Number.isFinite(minNum) && Number.isFinite(maxNum) ? Math.max(Math.abs(minNum), Math.abs(maxNum)) : undefined;

  return (
    <>
      <SettingRow label="Visibilidad">
        <ToggleSwitch
          checked={settings.visible}
          label={`Mostrar eje ${axisLabel}`}
          onChange={() => onChange(axis, { visible: !settings.visible })}
        />
      </SettingRow>
      <NumberField id={`${prefix}-min`} label="Mínimo" value={settings.min} onChange={(v) => onChange(axis, { min: v })} />
      <NumberField id={`${prefix}-max`} label="Máximo" value={settings.max} onChange={(v) => onChange(axis, { max: v })} />
      <NumberField id={`${prefix}-step`} label="Paso" min={0} max={maxStep} value={settings.step} onChange={(v) => onChange(axis, { step: v })} />
      <div className="form-field">
        <label htmlFor={`${prefix}-unit`}>Unidad de medida</label>
        <input
          id={`${prefix}-unit`}
          type="text"
          value={settings.unit}
          onChange={(e) => onChange(axis, { unit: e.target.value })}
          autoComplete="off"
        />
      </div>
    </>
  );
}
