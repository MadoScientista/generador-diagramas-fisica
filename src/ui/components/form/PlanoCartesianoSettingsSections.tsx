import type { CSSProperties, ReactNode } from 'react';
import { ToggleSwitch } from '../shared/ToggleSwitch.tsx';
import { PLANO_COLOR_OPTIONS } from '../../../modules/plano-cartesiano/defaults.ts';
import type {
  PlanoCartesianoSettings,
  PlanoCartesianoSection,
  GridSettings,
  AxesSettings,
  AxisSettings,
  AppearanceSettings,
  GridStyle,
  PlaneBackground,
} from '../../../modules/plano-cartesiano/types.ts';

type ChangeHandler = (
  section: PlanoCartesianoSection,
  patch: Partial<PlanoCartesianoSettings[PlanoCartesianoSection]>,
) => void;

const GRID_STYLES: { value: GridStyle; label: string; ariaLabel: string }[] = [
  { value: 'line', label: '—', ariaLabel: 'Línea' },
  { value: 'dots', label: '···', ariaLabel: 'Puntos' },
  { value: 'dashed', label: '- -', ariaLabel: 'Segmentada' },
];

const BACKGROUND_OPTIONS: { value: PlaneBackground; label: string }[] = [
  { value: 'white', label: 'Blanco' },
  { value: 'transparent', label: 'Transparente' },
];

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <SettingRow label={label}>
      <div className="color-options" role="radiogroup" aria-label={label}>
        {PLANO_COLOR_OPTIONS.map((c) => {
          const selected = value === c.value;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c.label}
              title={c.label}
              className={`color-option${selected ? ' selected' : ''}`}
              style={{ '--swatch': c.value } as CSSProperties}
              onClick={() => onChange(c.value)}
            >
              <span className="color-option-check" aria-hidden="true">
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </SettingRow>
  );
}

function PillSelector<T extends string | number>({
  label,
  value,
  options,
  onChange,
  symbolic = false,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; ariaLabel?: string }[];
  onChange: (value: T) => void;
  symbolic?: boolean;
}) {
  return (
    <SettingRow label={label}>
      <div className="settings-pills" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={o.ariaLabel ?? o.label}
              className={`settings-pill${selected ? ' selected' : ''}`}
              onClick={() => onChange(o.value)}
            >
              <span className={symbolic ? 'settings-pill-symbol' : undefined}>{o.label}</span>
            </button>
          );
        })}
      </div>
    </SettingRow>
  );
}

const THICKNESS_PILLS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
] as const;

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

function AxisRangeFields({
  prefix,
  settings,
  maxStep,
  onChange,
}: {
  prefix: string;
  settings: AxisSettings;
  maxStep?: number;
  onChange: (patch: Partial<AxisSettings>) => void;
}) {
  return (
    <div className="axis-range-group">
      <div className="axis-range-group-head">
        <label htmlFor={`${prefix}-min`}>Min</label>
        <label htmlFor={`${prefix}-max`}>Max</label>
        <label htmlFor={`${prefix}-step`}>Paso</label>
      </div>
      <div className="axis-range-group-fields">
        <input
          id={`${prefix}-min`}
          type="number"
          value={settings.min}
          onChange={(e) => onChange({ min: e.target.value })}
          autoComplete="off"
        />
        <input
          id={`${prefix}-max`}
          type="number"
          value={settings.max}
          onChange={(e) => onChange({ max: e.target.value })}
          autoComplete="off"
        />
        <input
          id={`${prefix}-step`}
          type="number"
          min={0}
          max={maxStep}
          value={settings.step}
          onChange={(e) => onChange({ step: e.target.value })}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

function AxisLabelFields({
  prefix,
  settings,
  onChange,
}: {
  prefix: string;
  settings: AxisSettings;
  onChange: (patch: Partial<AxisSettings>) => void;
}) {
  return (
    <div className="axis-label-group">
      <div className="axis-label-group-head">
        <label htmlFor={`${prefix}-label`}>Etiqueta</label>
        <label htmlFor={`${prefix}-unit`}>Unidad de medida</label>
      </div>
      <div className="axis-label-group-fields">
        <input
          id={`${prefix}-label`}
          type="text"
          value={settings.label}
          onChange={(e) => onChange({ label: e.target.value })}
          autoComplete="off"
        />
        <input
          id={`${prefix}-unit`}
          type="text"
          value={settings.unit}
          onChange={(e) => onChange({ unit: e.target.value })}
          autoComplete="off"
        />
      </div>
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
      <PillSelector label="Grosor" value={settings.thickness} options={THICKNESS_PILLS} onChange={(v) => onChange('grid', { thickness: v })} />
      <PillSelector
        label="Estilo"
        value={settings.style}
        options={GRID_STYLES}
        onChange={(style) => onChange('grid', { style })}
        symbolic
      />
      <ColorField label="Color" value={settings.color} onChange={(color) => onChange('grid', { color })} />
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
      <PillSelector label="Grosor" value={settings.thickness} options={THICKNESS_PILLS} onChange={(v) => onChange('axes', { thickness: v })} />
      <ColorField label="Color" value={settings.color} onChange={(color) => onChange('axes', { color })} />
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
      <AxisRangeFields prefix={prefix} settings={settings} maxStep={maxStep} onChange={(patch) => onChange(axis, patch)} />
      <AxisLabelFields prefix={prefix} settings={settings} onChange={(patch) => onChange(axis, patch)} />
    </>
  );
}

export function AxesCardSection({
  xAxis,
  yAxis,
  onChange,
}: {
  xAxis: AxisSettings;
  yAxis: AxisSettings;
  onChange: ChangeHandler;
}) {
  return (
    <>
      <h4 className="settings-subtitle">Eje X</h4>
      <AxisSection axis="xAxis" settings={xAxis} onChange={onChange} />
      <h4 className="settings-subtitle">Eje Y</h4>
      <AxisSection axis="yAxis" settings={yAxis} onChange={onChange} />
    </>
  );
}

export function AppearanceSection({
  settings,
  onChange,
}: {
  settings: AppearanceSettings;
  onChange: ChangeHandler;
}) {
  return (
    <>
      <ColorField
        label="Color de etiquetas"
        value={settings.labelColor}
        onChange={(color) => onChange('appearance', { labelColor: color })}
      />
      <SettingRow label="Tamaño de etiquetas">
        <NumberStepper
          value={settings.labelFontSize}
          min={8}
          max={20}
          onChange={(v) => onChange('appearance', { labelFontSize: Number(v) })}
          ariaLabel="Tamaño de las etiquetas en pixeles"
          compact
        />
      </SettingRow>
      <SettingRow label="Fondo del plano">
        <select
          className="settings-select"
          value={settings.background}
          onChange={(e) => onChange('appearance', { background: e.target.value as PlaneBackground })}
          aria-label="Fondo del plano"
        >
          {BACKGROUND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </SettingRow>
    </>
  );
}
