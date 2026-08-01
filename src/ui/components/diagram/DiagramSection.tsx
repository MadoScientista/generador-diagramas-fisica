import { useState, useCallback } from 'react';
import { useExportSVG } from '../../../hooks/useExportSVG.ts';

interface GraphTab {
  id: string;
  title: string;
  svg: string;
  filename: string;
}

interface DiagramSectionProps {
  svg: string | null;
  error: string | null;
  errorDetail?: string | null;
  diagramFilename?: string;
  graphs: GraphTab[];
}

export function DiagramSection({
  svg,
  error,
  errorDetail,
  diagramFilename = 'diagrama.svg',
  graphs,
}: DiagramSectionProps) {
  const [activeTab, setActiveTab] = useState<'diagram' | 'graphs'>('diagram');
  const [activeGraphTab, setActiveGraphTab] = useState(graphs[0]?.id ?? '');

  const { exportSVG: exportDiagram } = useExportSVG(svg, diagramFilename);
  const activeGraph = graphs.find((g) => g.id === activeGraphTab);
  const { exportSVG: exportGraph, isReady: graphReady } = useExportSVG(
    activeGraph?.svg ?? null,
    activeGraph?.filename,
  );

  const handleExport = useCallback(() => {
    if (activeTab === 'diagram') {
      exportDiagram();
    } else {
      exportGraph();
    }
  }, [activeTab, exportDiagram, exportGraph]);

  const isExportDisabled = activeTab === 'diagram' ? !svg : !graphReady;

  const handleViewTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab((prev) => (prev === 'diagram' ? 'graphs' : 'diagram'));
    }
  }, []);

  const handleSubTabKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const ids = graphs.map((g) => g.id);
        const idx = ids.indexOf(id);
        const next =
          e.key === 'ArrowLeft'
            ? (idx - 1 + ids.length) % ids.length
            : (idx + 1) % ids.length;
        setActiveGraphTab(ids[next]);
      }
    },
    [graphs],
  );

  return (
    <div className="diagram-section-card">
      <div className="card-header">
        <div className="view-switcher-inner" role="tablist" aria-label="Modo de visualización">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'diagram'}
            className={`view-tab${activeTab === 'diagram' ? ' active' : ''}`}
            onClick={() => setActiveTab('diagram')}
            onKeyDown={handleViewTabKeyDown}
          >
            Diagrama
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'graphs'}
            className={`view-tab${activeTab === 'graphs' ? ' active' : ''}`}
            onClick={() => setActiveTab('graphs')}
            onKeyDown={handleViewTabKeyDown}
          >
            Gráficos
          </button>
        </div>
        <button onClick={handleExport} disabled={isExportDisabled} className="export-button">
          Exportar
        </button>
      </div>

      <div className="card-body">
        {activeTab === 'diagram' ? (
          <>
            <div className="sub-tabs">
              <span className="sub-tab active sub-tab--label">Vista previa</span>
            </div>
            {error ? (
              <div className="diagram-section-placeholder">
                <p>{error}</p>
                {errorDetail && <p className="diagram-error-detail">{errorDetail}</p>}
              </div>
            ) : !svg ? (
              <div className="diagram-section-placeholder">
                <p>Ingresa los valores y presiona "Generar Diagrama"</p>
              </div>
            ) : (
              <div className="diagram-section-body">
                <div className="diagram-section-svg">
                  <div dangerouslySetInnerHTML={{ __html: svg }} />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="sub-tabs" role="tablist" aria-label="Tipo de gráfico">
              {graphs.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={g.id === activeGraphTab}
                  className={`sub-tab${g.id === activeGraphTab ? ' active' : ''}`}
                  onClick={() => setActiveGraphTab(g.id)}
                  onKeyDown={(e) => handleSubTabKeyDown(e, g.id)}
                >
                  {g.title}
                </button>
              ))}
            </div>
            {activeGraph && (
              <div className="graph-panel-body">
                <div className="graph-svg-container" dangerouslySetInnerHTML={{ __html: activeGraph.svg }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
