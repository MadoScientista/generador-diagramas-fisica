import type { DiagramControls, ElementControls } from '../../../modules/mru/types.ts';

interface ControlRowProps {
  id: keyof DiagramControls;
  label: string;
  hasVector: boolean;
  control: ElementControls;
  onControlChange: (element: keyof DiagramControls, field: keyof ElementControls, value: boolean) => void;
}

export function ControlRow({ id, label, hasVector, control, onControlChange }: ControlRowProps) {
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
