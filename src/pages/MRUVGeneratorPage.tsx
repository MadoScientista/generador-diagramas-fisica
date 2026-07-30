import { useState, useMemo, useCallback } from 'react';
import { useDiagramControls } from '../hooks/useDiagramControls.ts';
import { useMRUVDiagram } from '../hooks/useMRUVDiagram.ts';
import { DiagramDataCardMRUV } from '../ui/components/form/DiagramDataCardMRUV.tsx';
import { DiagramControlsCardMRUV } from '../ui/components/form/DiagramControlsCardMRUV.tsx';
import { CollapsibleCard } from '../ui/components/shared/CollapsibleCard.tsx';
import { DiagramAppearanceCard } from '../ui/components/form/DiagramAppearanceCard.tsx';
import { DiagramSection } from '../ui/components/diagram/DiagramSection.tsx';
import { AccelerationTimeGraph } from '../ui/components/diagram/graphs/AccelerationTimeGraph.tsx';
import { VelocityTimeGraph } from '../ui/components/diagram/graphs/VelocityTimeGraph.tsx';
import { PositionTimeGraph } from '../ui/components/diagram/graphs/PositionTimeGraph.tsx';
import { computeGraphData } from '../modules/mruv/graph-helpers.ts';
import type { CharacterType, BackgroundType } from '../ui/components/form/DiagramAppearanceCard.tsx';
import type { DiagramControls } from '../modules/mruv/types.ts';

const MRUV_DEFAULTS: DiagramControls = {
  xi: { showLabel: true, showValue: true, showCharacter: true },
  xf: { showLabel: true, showValue: true, showCharacter: false },
  vi: { showLabel: true, showValue: true, showVector: true },
  vf: { showLabel: true, showValue: true, showVector: true },
  a: { showLabel: true, showValue: true, showVector: true },
  t: { showLabel: true, showValue: true },
  dx: { showLabel: false, showValue: false, showVector: false },
};

export function MRUVGeneratorPage() {
  const { controls, handleControlChange, resetControls } = useDiagramControls(MRUV_DEFAULTS);

  const [character, setCharacter] = useState<CharacterType>('square');
  const [background, setBackground] = useState<BackgroundType>('white');
  const [openCard, setOpenCard] = useState<'datos' | 'elementos' | 'apariencia' | null>('datos');

  const handleToggleCard = useCallback((card: 'datos' | 'elementos' | 'apariencia') => {
    setOpenCard((prev) => (prev === card ? null : card));
  }, []);

  const {
    values,
    computedValues,
    resolvedValues,
    units,
    result,
    handleChange,
    handleUnitChange,
    clearAll,
  } = useMRUVDiagram(controls, character);

  const graphData = useMemo(
    () => (resolvedValues ? computeGraphData(resolvedValues) : null),
    [resolvedValues]
  );

  const aGraphSvg = useMemo(
    () => (graphData ? AccelerationTimeGraph({ data: graphData }) : null),
    [graphData]
  );

  const vGraphSvg = useMemo(
    () => (graphData ? VelocityTimeGraph({ data: graphData }) : null),
    [graphData]
  );

  const xGraphSvg = useMemo(
    () => (graphData ? PositionTimeGraph({ data: graphData }) : null),
    [graphData]
  );

  const handleClear = () => {
    clearAll();
    resetControls();
    setCharacter('square');
    setBackground('white');
  };

  return (
    <div className="generator-page">
      <section className="input-section">
        <CollapsibleCard title="Datos del diagrama" open={openCard === 'datos'} onToggle={() => handleToggleCard('datos')}>
          <DiagramDataCardMRUV
            values={values}
            computedValues={computedValues}
            onChange={handleChange}
            xiUnit={units.xiUnit}
            viUnit={units.viUnit}
            aUnit={units.aUnit}
            timeUnit={units.timeUnit}
            onXiUnitChange={(unit) => handleUnitChange('xiUnit', unit)}
            onViUnitChange={(unit) => handleUnitChange('viUnit', unit)}
            onAUnitChange={(unit) => handleUnitChange('aUnit', unit)}
            onTimeUnitChange={(unit) => handleUnitChange('timeUnit', unit)}
            onClear={handleClear}
            showTitle={false}
          />
        </CollapsibleCard>
        <CollapsibleCard title="Elementos del diagrama" open={openCard === 'elementos'} onToggle={() => handleToggleCard('elementos')}>
          <DiagramControlsCardMRUV
            controls={controls}
            onControlChange={handleControlChange}
            showTitle={false}
          />
        </CollapsibleCard>
        <CollapsibleCard title="Apariencia diagrama" open={openCard === 'apariencia'} onToggle={() => handleToggleCard('apariencia')}>
          <DiagramAppearanceCard
            character={character}
            background={background}
            onCharacterChange={setCharacter}
            onBackgroundChange={setBackground}
          />
        </CollapsibleCard>
      </section>

      <section className="diagram-section">
        <DiagramSection
          key={graphData && xGraphSvg && vGraphSvg && aGraphSvg ? 'ready' : 'empty'}
          svg={result.svg}
          error={result.error}
          errorDetail={result.errorDetail}
          diagramFilename="diagrama-mruv.svg"
          graphs={graphData && xGraphSvg && vGraphSvg && aGraphSvg ? [
            { id: 'x', title: 'Posición', svg: xGraphSvg, filename: 'posicion-tiempo.svg' },
            { id: 'v', title: 'Velocidad', svg: vGraphSvg, filename: 'velocidad-tiempo.svg' },
            { id: 'a', title: 'Aceleración', svg: aGraphSvg, filename: 'aceleracion-tiempo.svg' },
          ] : []}
          graphsDisabled={!graphData || !xGraphSvg || !vGraphSvg || !aGraphSvg}
        />
      </section>
    </div>
  );
}
