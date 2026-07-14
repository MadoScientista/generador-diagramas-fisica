import type { DiagramControls, ElementControls } from '../../../modules/mru/types.ts';
import { ControlRow } from './ControlRow.tsx';

interface DiagramControlsCardProps {
  controls: DiagramControls;
  onControlChange: (element: keyof DiagramControls, field: keyof ElementControls, value: boolean) => void;
}

const CONTROL_ROWS: Array<{ id: keyof DiagramControls; label: string; hasVector: boolean }> = [
  { id: 'xi', label: 'xi', hasVector: false },
  { id: 'xf', label: 'xf', hasVector: false },
  { id: 'v', label: 'v', hasVector: true },
  { id: 't', label: 't', hasVector: false },
  { id: 'dx', label: '\u0394x', hasVector: true },
];

export function DiagramControlsCard({ controls, onControlChange }: DiagramControlsCardProps) {
  return (
    <div className="card">
      <h3>Elementos del diagrama</h3>
      <div className="controls-table">
        <div className="controls-row controls-header">
          <span className="controls-cell element-label">Elemento</span>
          <span className="controls-cell">Etiqueta</span>
          <span className="controls-cell">Valor</span>
          <span className="controls-cell">Vector</span>
        </div>
        {CONTROL_ROWS.map((row) => (
          <ControlRow
            key={row.id}
            id={row.id}
            label={row.label}
            hasVector={row.hasVector}
            control={controls[row.id]}
            onControlChange={onControlChange}
          />
        ))}
      </div>
    </div>
  );
}
