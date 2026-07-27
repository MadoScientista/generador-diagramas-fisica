import { useState, useMemo } from 'react';
import { useDiagramControls } from '../hooks/useDiagramControls.ts';
import { useMRUVDiagram } from '../hooks/useMRUVDiagram.ts';
import { DiagramDataCardMRUV } from '../ui/components/form/DiagramDataCardMRUV.tsx';
import { DiagramControlsCardMRUV } from '../ui/components/form/DiagramControlsCardMRUV.tsx';
import { DiagramContainer } from '../ui/components/diagram/DiagramContainer.tsx';
import { CollapsibleCard } from '../ui/components/shared/CollapsibleCard.tsx';
import { DiagramAppearanceCard } from '../ui/components/form/DiagramAppearanceCard.tsx';
import { GraphPanel } from '../ui/components/diagram/GraphPanel.tsx';
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
  dx: { showLabel: true, showValue: true, showVector: true },
};

export function MRUVGeneratorPage() {
  const { controls, handleControlChange, resetControls } = useDiagramControls(MRUV_DEFAULTS);

  const [character, setCharacter] = useState<CharacterType>('square');
  const [background, setBackground] = useState<BackgroundType>('white');

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
      </section>

      <section className="diagram-section">
        <DiagramContainer
          svg={result.svg}
          error={result.error}
          errorDetail={result.errorDetail}
          filename="diagrama-mruv.svg"
        />
        <GraphPanel
          key={graphData && xGraphSvg && vGraphSvg && aGraphSvg ? 'ready' : 'empty'}
          graphs={graphData && xGraphSvg && vGraphSvg && aGraphSvg ? [
            { id: 'x', title: 'Posición', svg: xGraphSvg, filename: 'posicion-tiempo.svg' },
            { id: 'v', title: 'Velocidad', svg: vGraphSvg, filename: 'velocidad-tiempo.svg' },
            { id: 'a', title: 'Aceleración', svg: aGraphSvg, filename: 'aceleracion-tiempo.svg' },
          ] : []}
          disabled={!graphData || !xGraphSvg || !vGraphSvg || !aGraphSvg}
        />
      </section>
    </div>
  );
}
