import { useDiagramControls } from '../hooks/useDiagramControls.ts';
import { useMRUDiagram } from '../hooks/useMRUDiagram.ts';
import { DiagramDataCard } from '../ui/components/form/DiagramDataCard.tsx';
import { DiagramControlsCard } from '../ui/components/form/DiagramControlsCard.tsx';
import { DiagramContainer } from '../ui/components/diagram/DiagramContainer.tsx';

export function MRUGeneratorPage() {
  const { controls, handleControlChange, resetControls } = useDiagramControls();
  const {
    values,
    units,
    result,
    handleChange,
    handleUnitChange,
    handleCalculate,
    handleSubmit,
    clearAll,
  } = useMRUDiagram(controls);

  const handleClear = () => {
    clearAll();
    resetControls();
  };

  return (
    <div className="generator-page">
      <section className="input-section">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mru-form">
          <DiagramDataCard
            values={values}
            onChange={handleChange}
            x0Unit={units.x0Unit}
            xfUnit={units.xfUnit}
            timeUnit={units.timeUnit}
            velUnit={units.velUnit}
            onX0UnitChange={(unit) => handleUnitChange('x0Unit', unit)}
            onXfUnitChange={(unit) => handleUnitChange('xfUnit', unit)}
            onTimeUnitChange={(unit) => handleUnitChange('timeUnit', unit)}
            onVelUnitChange={(unit) => handleUnitChange('velUnit', unit)}
            onCalculate={handleCalculate}
          />
          <DiagramControlsCard
            controls={controls}
            onControlChange={handleControlChange}
          />
          <button type="submit">
            Generar Diagrama
          </button>
        </form>
        <button className="clear-button" onClick={handleClear}>
          Borrar datos
        </button>
      </section>

      <section className="diagram-section">
        <DiagramContainer
          svg={result.svg}
          error={result.error}
          errorDetail={result.errorDetail}
        />
      </section>
    </div>
  );
}
