import { Fragment } from 'react';
import type { DiagramControls, ElementControls } from '../../../modules/mruv/types.ts';
import { identToHTML } from '../../../core/format.ts';
import { ToggleSwitch } from '../shared/ToggleSwitch.tsx';

interface PhysicalZeros {
  vi: boolean;
  vf: boolean;
  a: boolean;
  dx: boolean;
}

type ControlField = keyof ElementControls | 'showCharacter';

interface ControlRowDef {
  id: keyof DiagramControls;
  label: string;
  hasVector: boolean;
  hasCharacter: boolean;
  zeroKey?: keyof PhysicalZeros;
}

interface ControlRowMRUVProps {
  row: ControlRowDef;
  control: ElementControls & { showCharacter?: boolean };
  onControlChange: (element: keyof DiagramControls, field: ControlField, value: boolean) => void;
  disabled?: boolean;
  reason?: string;
}

function ControlRowMRUV({ row, control, onControlChange, disabled, reason }: ControlRowMRUVProps) {
  const richLabel = identToHTML(row.label) ?? row.label;
  const showVector = 'showVector' in control ? (control as ElementControls & { showVector: boolean }).showVector : false;

  const toggleLabel = (value: boolean) => {
    onControlChange(row.id, 'showLabel', value);
    if (!value && control.showValue) onControlChange(row.id, 'showValue', false);
  };

  const toggleValue = (value: boolean) => {
    if (value && !control.showLabel) onControlChange(row.id, 'showLabel', true);
    onControlChange(row.id, 'showValue', value);
  };

  return (
    <div className="controls-row">
      <span className="controls-cell element-label">
        <span className="element-symbol" dangerouslySetInnerHTML={{ __html: richLabel }} />
      </span>
      <span className="controls-cell">
        <ToggleSwitch
          checked={control.showLabel}
          disabled={disabled}
          label={`Mostrar etiqueta de ${row.label}`}
          title={reason}
          onChange={() => toggleLabel(!control.showLabel)}
        />
      </span>
      <span className="controls-cell">
        <ToggleSwitch
          checked={control.showValue}
          disabled={disabled}
          label={`Mostrar valor de ${row.label}`}
          title={reason}
          onChange={() => toggleValue(!control.showValue)}
        />
      </span>
      <span className="controls-cell">
        {row.hasVector ? (
          <ToggleSwitch
            checked={showVector}
            disabled={disabled}
            label={`Mostrar vector de ${row.label}`}
            title={reason}
            onChange={() => onControlChange(row.id, 'showVector', !showVector)}
          />
        ) : (
          <span className="controls-cell dim" aria-hidden="true">—</span>
        )}
      </span>
      <span className="controls-cell">
        {row.hasCharacter ? (
          <ToggleSwitch
            checked={control.showCharacter ?? false}
            disabled={disabled}
            label={`Mostrar móvil en ${row.label}`}
            title={reason}
            onChange={() => onControlChange(row.id, 'showCharacter', !(control.showCharacter ?? false))}
          />
        ) : (
          <span className="controls-cell dim" aria-hidden="true">—</span>
        )}
      </span>
    </div>
  );
}

interface DiagramControlsCardMRUVProps {
  controls: DiagramControls;
  onControlChange: (element: keyof DiagramControls, field: ControlField, value: boolean) => void;
  physicalZeros?: PhysicalZeros;
  showTitle?: boolean;
}

const CONTROL_GROUPS: Array<{ title: string; rows: ControlRowDef[] }> = [
  {
    title: 'Posición',
    rows: [
      { id: 'xi', label: 'xi', hasVector: false, hasCharacter: true },
      { id: 'xf', label: 'xf', hasVector: false, hasCharacter: true },
    ],
  },
  {
    title: 'Velocidad',
    rows: [
      { id: 'vi', label: 'vi', hasVector: true, hasCharacter: false, zeroKey: 'vi' },
      { id: 'vf', label: 'vf', hasVector: true, hasCharacter: false, zeroKey: 'vf' },
    ],
  },
  {
    title: 'Aceleración',
    rows: [{ id: 'a', label: 'a', hasVector: true, hasCharacter: false, zeroKey: 'a' }],
  },
  {
    title: 'Tiempo',
    rows: [{ id: 't', label: 't', hasVector: false, hasCharacter: false }],
  },
  {
    title: 'Desplazamiento',
    rows: [{ id: 'dx', label: '\u0394x', hasVector: true, hasCharacter: false, zeroKey: 'dx' }],
  },
];

export function DiagramControlsCardMRUV({ controls, onControlChange, physicalZeros, showTitle = true }: DiagramControlsCardMRUVProps) {
  const table = (
    <div className="controls-table controls-table--mruv">
      <div className="controls-row controls-header">
        <span className="controls-cell">Var</span>
        <span className="controls-cell">Etiqueta</span>
        <span className="controls-cell">Valor</span>
        <span className="controls-cell">Vector</span>
        <span className="controls-cell">Móvil</span>
      </div>
      {CONTROL_GROUPS.map((group) => (
        <Fragment key={group.title}>
          <span className="controls-group-label">{group.title}</span>
          {group.rows.map((row) => {
            const rowZero = row.zeroKey !== undefined && physicalZeros?.[row.zeroKey] === true;
            const rowDisabled = row.id === 'vf' && !controls.xf.showCharacter;
            const disabled = rowZero || rowDisabled;
            const reason = rowZero
              ? `${row.label} = 0: este elemento no se dibuja`
              : rowDisabled
                ? 'Activa el móvil de xf para mostrar vf'
                : undefined;
            return (
              <ControlRowMRUV
                key={row.id}
                row={row}
                control={controls[row.id]}
                onControlChange={onControlChange}
                disabled={disabled}
                reason={reason}
              />
            );
          })}
        </Fragment>
      ))}
    </div>
  );

  if (!showTitle) return table;

  return (
    <div className="card">
      <h3>Elementos del diagrama</h3>
      {table}
    </div>
  );
}
