import type { DiagramControls, ElementControls } from '../../../modules/mruv/types.ts';

interface ControlRowMRUVProps {
  id: keyof DiagramControls;
  label: string;
  hasVector: boolean;
  hasCharacter: boolean;
  control: ElementControls & { showCharacter?: boolean };
  onControlChange: (element: keyof DiagramControls, field: keyof ElementControls | 'showCharacter', value: boolean) => void;
  disabled?: boolean;
}

function ControlRowMRUV({ id, label, hasVector, hasCharacter, control, onControlChange, disabled }: ControlRowMRUVProps) {
  const showValueDisabled = !control.showLabel || disabled;

  return (
    <div className="controls-row">
      <span className="controls-cell element-label">{label}</span>
      <span className="controls-cell">
        <input
          type="checkbox"
          checked={control.showLabel}
          disabled={disabled}
          onChange={() => onControlChange(id, 'showLabel', !control.showLabel)}
        />
      </span>
      <span className="controls-cell">
        <input
          type="checkbox"
          checked={control.showValue && control.showLabel}
          disabled={showValueDisabled}
          onChange={() => onControlChange(id, 'showValue', !control.showValue)}
        />
      </span>
      <span className="controls-cell">
        {hasVector ? (
          <input
            type="checkbox"
            checked={'showVector' in control ? (control as ElementControls & { showVector: boolean }).showVector : false}
            disabled={disabled}
            onChange={() => onControlChange(id, 'showVector', !('showVector' in control ? (control as ElementControls & { showVector: boolean }).showVector : false))}
          />
        ) : <input type="checkbox" disabled />}
      </span>
      <span className="controls-cell">
        {hasCharacter ? (
          <input
            type="checkbox"
            checked={control.showCharacter ?? false}
            onChange={() => onControlChange(id, 'showCharacter', !(control.showCharacter ?? false))}
          />
        ) : <input type="checkbox" disabled />}
      </span>
    </div>
  );
}

interface DiagramControlsCardMRUVProps {
  controls: DiagramControls;
  onControlChange: (element: keyof DiagramControls, field: keyof ElementControls | 'showCharacter', value: boolean) => void;
  showTitle?: boolean;
}

const CONTROL_ROWS: Array<{ id: keyof DiagramControls; label: string; hasVector: boolean; hasCharacter: boolean }> = [
  { id: 'xi', label: 'xi', hasVector: false, hasCharacter: true },
  { id: 'xf', label: 'xf', hasVector: false, hasCharacter: true },
  { id: 'vi', label: 'vi', hasVector: true, hasCharacter: false },
  { id: 'vf', label: 'vf', hasVector: true, hasCharacter: false },
  { id: 'a', label: 'a', hasVector: true, hasCharacter: false },
  { id: 't', label: 't', hasVector: false, hasCharacter: false },
  { id: 'dx', label: '\u0394x', hasVector: true, hasCharacter: false },
];

export function DiagramControlsCardMRUV({ controls, onControlChange, showTitle = true }: DiagramControlsCardMRUVProps) {
  const table = (
    <div className="controls-table five-columns">
      <div className="controls-row controls-header">
        <span className="controls-cell">Var</span>
        <span className="controls-cell">Símbolo</span>
        <span className="controls-cell">Valor</span>
        <span className="controls-cell">Vector</span>
        <span className="controls-cell">Móvil</span>
      </div>
      {CONTROL_ROWS.map((row) => (
        <ControlRowMRUV
          key={row.id}
          id={row.id}
          label={row.label}
          hasVector={row.hasVector}
          hasCharacter={row.hasCharacter}
          control={controls[row.id]}
          onControlChange={onControlChange}
          disabled={row.id === 'vf' && !controls.xf.showCharacter}
        />
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
