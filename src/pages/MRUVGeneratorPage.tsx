import { useState } from 'react';
import { useDiagramControls } from '../hooks/useDiagramControls.ts';
import { useMRUVDiagram } from '../hooks/useMRUVDiagram.ts';
import { DiagramDataCardMRUV } from '../ui/components/form/DiagramDataCardMRUV.tsx';
import { DiagramControlsCardMRUV } from '../ui/components/form/DiagramControlsCardMRUV.tsx';
import { DiagramContainer } from '../ui/components/diagram/DiagramContainer.tsx';
import { CollapsibleCard } from '../ui/components/shared/CollapsibleCard.tsx';
import { DiagramAppearanceCard } from '../ui/components/form/DiagramAppearanceCard.tsx';
import type { CharacterType, BackgroundType } from '../ui/components/form/DiagramAppearanceCard.tsx';
import type { DiagramControls } from '../modules/mruv/types.ts';

const MRUV_DEFAULTS: DiagramControls = {
  xi: { showLabel: true, showValue: true },
  xf: { showLabel: true, showValue: true },
  vi: { showLabel: true, showValue: true, showVector: true },
  vf: { showLabel: true, showValue: true, showVector: true },
  a: { showLabel: true, showValue: true, showVector: true },
  t: { showLabel: true, showValue: true },
  dx: { showLabel: true, showValue: true, showVector: true },
};

export function MRUVGeneratorPage() {
  const { controls, handleControlChange, resetControls } = useDiagramControls(MRUV_DEFAULTS);

  const [character, setCharacter] = useState<CharacterType>('square');
  const [background, setBackground] = useState<BackgroundType>('white');

  const {
    values,
    computedValues,
    units,
    result,
    handleChange,
    handleUnitChange,
    clearAll,
  } = useMRUVDiagram(controls, character);

  const handleClear = () => {
    clearAll();
    resetControls();
    setCharacter('square');
    setBackground('white');
  };

  return (
    <div className="generator-page">
      <section className="input-section">
        <DiagramDataCardMRUV
          values={values}
          computedValues={computedValues}
          onChange={handleChange}
          xiUnit={units.xiUnit}
          xfUnit={units.xfUnit}
          viUnit={units.viUnit}
          vfUnit={units.vfUnit}
          aUnit={units.aUnit}
          timeUnit={units.timeUnit}
          onXiUnitChange={(unit) => handleUnitChange('xiUnit', unit)}
          onXfUnitChange={(unit) => handleUnitChange('xfUnit', unit)}
          onViUnitChange={(unit) => handleUnitChange('viUnit', unit)}
          onVfUnitChange={(unit) => handleUnitChange('vfUnit', unit)}
          onAUnitChange={(unit) => handleUnitChange('aUnit', unit)}
          onTimeUnitChange={(unit) => handleUnitChange('timeUnit', unit)}
        />
        <CollapsibleCard title="Elementos del diagrama" defaultOpen={false}>
          <DiagramControlsCardMRUV
            controls={controls}
            onControlChange={handleControlChange}
            showTitle={false}
          />
        </CollapsibleCard>
        <CollapsibleCard title="Apariencia diagrama" defaultOpen={false}>
          <DiagramAppearanceCard
            character={character}
            background={background}
            onCharacterChange={setCharacter}
            onBackgroundChange={setBackground}
          />
        </CollapsibleCard>
        <button className="clear-button" onClick={handleClear}>
          Borrar datos
        </button>
      </section>

      <section className="diagram-section">
        <DiagramContainer
          svg={result.svg}
          error={result.error}
          errorDetail={result.errorDetail}
          filename="diagrama-mruv.svg"
        />
      </section>
    </div>
  );
}
