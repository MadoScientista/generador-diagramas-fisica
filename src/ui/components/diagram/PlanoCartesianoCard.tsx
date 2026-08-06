import { useExportSVG } from '../../../hooks/useExportSVG.ts';
import { useExportPNG } from '../../../hooks/useExportPNG.ts';

interface PlanoCartesianoCardProps {
  svg: string | null;
  error: string | null;
}

export function PlanoCartesianoCard({ svg, error }: PlanoCartesianoCardProps) {
  const { exportSVG } = useExportSVG(svg, 'plano-cartesiano.svg');
  const { exportPNG } = useExportPNG(svg, 'plano-cartesiano.png');

  return (
    <div className="diagram-section-card plano-diagram-card">
      <div className="card-header">
        <h3 className="plano-card-title">Plano Cartesiano</h3>
        <div className="plano-export-actions">
          <button onClick={exportSVG} disabled={!svg} className="export-button">
            Exportar SVG
          </button>
          <button onClick={exportPNG} disabled={!svg} className="export-button">
            Exportar PNG
          </button>
        </div>
      </div>
      <div className="card-body">
        {error ? (
          <div className="plano-card-state" role="alert">
            <span className="plano-state-icon" aria-hidden="true">
              !
            </span>
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
