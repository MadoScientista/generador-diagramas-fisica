import { useState } from 'react';
import { useExportSVG } from '../../../hooks/useExportSVG.ts';
import { CollapsibleCard } from '../shared/CollapsibleCard.tsx';

interface GraphPanelProps {
  graphs: { id: string; title: string; svg: string; filename: string }[];
  disabled?: boolean;
}

export function GraphPanel({ graphs, disabled = false }: GraphPanelProps) {
  const [activeTab, setActiveTab] = useState(graphs[0]?.id ?? '');
  const active = graphs.find((g) => g.id === activeTab);
  const { exportSVG, isReady } = useExportSVG(active?.svg ?? null, active?.filename);

  return (
    <CollapsibleCard title="Gráficos" defaultOpen={false}>
      {disabled ? (
        <p className="graph-placeholder">Ingrese datos del diagrama</p>
      ) : (
        <div className="graph-panel">
          <div className="graph-tabs">
            {graphs.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`graph-tab${g.id === activeTab ? ' active' : ''}`}
                onClick={() => setActiveTab(g.id)}
              >
                {g.title}
              </button>
            ))}
          </div>
          <div className="graph-panel-body">
            {active && (
              <>
                <div className="graph-svg-container" dangerouslySetInnerHTML={{ __html: active.svg }} />
                <button onClick={exportSVG} disabled={!isReady} className="export-button">
                  Exportar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </CollapsibleCard>
  );
}
