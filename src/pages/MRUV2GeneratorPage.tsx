import { useState } from 'react';
import { useDiagramControls } from '../hooks/useDiagramControls.ts';
import { useMRUDiagram } from '../hooks/useMRUDiagram.ts';
import { DiagramDataCard } from '../ui/components/form/DiagramDataCard.tsx';
import { DiagramControlsCard } from '../ui/components/form/DiagramControlsCard.tsx';
import { DiagramContainer } from '../ui/components/diagram/DiagramContainer.tsx';
import { CollapsibleCard } from '../ui/components/shared/CollapsibleCard.tsx';
import { DiagramAppearanceCard } from '../ui/components/form/DiagramAppearanceCard.tsx';
import type { CharacterType } from '../ui/components/form/DiagramAppearanceCard.tsx';
import type { DiagramControls } from '../modules/mru/types.ts';

const MRU_DEFAULTS: DiagramControls = {
  xi: { showLabel: true, showValue: true },
  xf: { showLabel: true, showValue: true },
  v: { showLabel: true, showValue: true, showVector: true },
  t: { showLabel: true, showValue: true },
  dx: { showLabel: true, showValue: true, showVector: true },
};

export function MRUV2GeneratorPage() {
  const { controls, handleControlChange, resetControls } = useDiagramControls(MRU_DEFAULTS);

  const [character, setCharacter] = useState<CharacterType>('square');

  const {
    values,
    units,
    result,
    handleChange,
    handleUnitChange,
    handleCalculate,
    handleSubmit,
    clearAll,
  } = useMRUDiagram(controls, character);

  const handleClear = () => {
    clearAll();
    resetControls();
    setCharacter('square');
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
            onClear={handleClear}
          />
          <CollapsibleCard title="Elementos del diagrama" defaultOpen={false}>
            <DiagramControlsCard
              controls={controls}
              onControlChange={handleControlChange}
              showTitle={false}
            />
          </CollapsibleCard>
          <CollapsibleCard title="Apariencia diagrama" defaultOpen={false}>
            <DiagramAppearanceCard
              character={character}
              onCharacterChange={setCharacter}
            />
          </CollapsibleCard>
          <button type="submit">
            Generar Diagrama
          </button>
        </form>
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
