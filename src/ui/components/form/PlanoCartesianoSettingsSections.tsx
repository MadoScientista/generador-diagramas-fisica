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

function NumberField({
  id,
  label,
  value,
  min,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  min?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
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
        <input
          type="number"
          min={0}
          value={settings.thickness}
          onChange={(e) => onChange('grid', { thickness: Number(e.target.value) })}
          className="settings-input"
          aria-label="Grosor de la cuadrícula en pixeles"
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
        <input
          type="number"
          min={0}
          value={settings.thickness}
          onChange={(e) => onChange('axes', { thickness: Number(e.target.value) })}
          className="settings-input"
          aria-label="Grosor de los ejes en pixeles"
        />
      </SettingRow>
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
      <NumberField id={`${prefix}-ticks`} label="Divisiones" min={1} value={settings.ticks} onChange={(v) => onChange(axis, { ticks: v })} />
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
