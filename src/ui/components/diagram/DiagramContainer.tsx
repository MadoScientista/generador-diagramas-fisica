import { useExportSVG } from '../../../hooks/useExportSVG.ts';

interface DiagramContainerProps {
  svg: string | null;
  error: string | null;
  errorDetail?: string | null;
}

export function DiagramContainer({ svg, error, errorDetail }: DiagramContainerProps) {
  const { exportSVG } = useExportSVG(svg);

  if (error) {
    return (
      <div className="diagram-error">
        <div className="diagram-header">
          <h3>Vista previa</h3>
        </div>
        <p>{error}</p>
        {errorDetail && <p className="diagram-error-detail">{errorDetail}</p>}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="diagram-empty">
        <div className="diagram-header">
          <h3>Vista previa</h3>
        </div>
        <p>Ingresa los valores y presiona "Generar Diagrama"</p>
      </div>
    );
  }

  return (
    <div className="diagram-container">
      <div className="diagram-header">
        <h3>Vista previa</h3>
        <button onClick={exportSVG} disabled={!svg} className="export-button">
          Exportar
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
