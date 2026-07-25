import type { DiagramControls, ElementControls } from '../../../modules/mruv/types.ts';

interface ControlRowMRUVProps {
  id: keyof DiagramControls;
  label: string;
  hasVector: boolean;
  control: ElementControls;
  onControlChange: (element: keyof DiagramControls, field: keyof ElementControls, value: boolean) => void;
}

function ControlRowMRUV({ id, label, hasVector, control, onControlChange }: ControlRowMRUVProps) {
  const showValueDisabled = !control.showLabel;

  return (
    <div className="controls-row">
      <span className="controls-cell element-label">{label}</span>
      <span className="controls-cell">
        <input
          type="checkbox"
          checked={control.showLabel}
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
            onChange={() => onControlChange(id, 'showVector', !('showVector' in control ? (control as ElementControls & { showVector: boolean }).showVector : false))}
          />
        ) : null}
      </span>
    </div>
  );
}

interface DiagramControlsCardMRUVProps {
  controls: DiagramControls;
  onControlChange: (element: keyof DiagramControls, field: keyof ElementControls, value: boolean) => void;
  showTitle?: boolean;
}

const CONTROL_ROWS: Array<{ id: keyof DiagramControls; label: string; hasVector: boolean }> = [
  { id: 'xi', label: 'xi', hasVector: false },
  { id: 'xf', label: 'xf', hasVector: false },
  { id: 'vi', label: 'vi', hasVector: true },
  { id: 'vf', label: 'vf', hasVector: true },
  { id: 'a', label: 'a', hasVector: true },
  { id: 't', label: 't', hasVector: false },
  { id: 'dx', label: '\u0394x', hasVector: true },
];

export function DiagramControlsCardMRUV({ controls, onControlChange, showTitle = true }: DiagramControlsCardMRUVProps) {
  const table = (
    <div className="controls-table">
      <div className="controls-row controls-header">
        <span className="controls-cell element-label">Elemento</span>
        <span className="controls-cell">Etiqueta</span>
        <span className="controls-cell">Valor</span>
        <span className="controls-cell">Vector</span>
      </div>
      {CONTROL_ROWS.map((row) => (
        <ControlRowMRUV
          key={row.id}
          id={row.id}
          label={row.label}
          hasVector={row.hasVector}
          control={controls[row.id]}
          onControlChange={onControlChange}
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
