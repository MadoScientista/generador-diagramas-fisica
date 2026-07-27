import { useExportSVG } from '../../../hooks/useExportSVG.ts';
import { CollapsibleCard } from '../shared/CollapsibleCard.tsx';

interface GraphCardProps {
  title: string;
  svg: string;
  filename: string;
  defaultOpen?: boolean;
}

export function GraphCard({ title, svg, filename, defaultOpen = false }: GraphCardProps) {
  const { exportSVG } = useExportSVG(svg, filename);

  return (
    <CollapsibleCard title={title} defaultOpen={defaultOpen}>
      <div className="graph-card-body">
        <div className="graph-svg-container" dangerouslySetInnerHTML={{ __html: svg }} />
        <button onClick={exportSVG} className="export-button">
          Exportar
        </button>
      </div>
    </CollapsibleCard>
  );
}
