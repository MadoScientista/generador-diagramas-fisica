import { useExportSVG } from '../../../hooks/useExportSVG.ts';

interface PlanoCartesianoCardProps {
  svg: string | null;
  error: string | null;
}

export function PlanoCartesianoCard({ svg, error }: PlanoCartesianoCardProps) {
  const { exportSVG } = useExportSVG(svg, 'plano-cartesiano.svg');

  return (
    <div className="diagram-section-card">
      <div className="card-header">
        <h3 className="plano-card-title">Plano Cartesiano</h3>
        <button onClick={exportSVG} disabled={!svg} className="export-button">
          Exportar
        </button>
      </div>
      <div className="card-body">
        {error ? (
          <div className="plano-card-state">
            <p>{error}</p>
          </div>
        ) : svg ? (
          <div className="plano-canvas">
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
