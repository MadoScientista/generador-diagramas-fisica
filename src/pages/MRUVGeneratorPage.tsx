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
import { toSI } from '../core/units.ts';
import type { CharacterType, GroundType } from '../ui/components/form/DiagramAppearanceCard.tsx';
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
  const [ground, setGround] = useState<GroundType>('line');
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
  } = useMRUVDiagram(controls, character, ground);

  const graphData = useMemo(() => {
    if (!resolvedValues) return null;
    const si = {
      xi: toSI(resolvedValues.xi, units.xiUnit, 'distance'),
      vi: toSI(resolvedValues.vi, units.viUnit, 'velocity'),
      a: toSI(resolvedValues.a, units.aUnit, 'acceleration'),
      t: toSI(resolvedValues.t, units.timeUnit, 'time'),
    };
    return computeGraphData(si);
  }, [resolvedValues, units.xiUnit, units.viUnit, units.aUnit, units.timeUnit]);

  const aGraphSvg = useMemo(
    () => AccelerationTimeGraph({ data: graphData, aUnit: units.aUnit, timeUnit: units.timeUnit }),
    [graphData, units.aUnit, units.timeUnit]
  );

  const vGraphSvg = useMemo(
    () => VelocityTimeGraph({ data: graphData, viUnit: units.viUnit, timeUnit: units.timeUnit }),
    [graphData, units.viUnit, units.timeUnit]
  );

  const xGraphSvg = useMemo(
    () => PositionTimeGraph({ data: graphData, xiUnit: units.xiUnit, timeUnit: units.timeUnit }),
    [graphData, units.xiUnit, units.timeUnit]
  );

  const handleClear = () => {
    clearAll();
    resetControls();
    setCharacter('square');
    setGround('line');
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
        <CollapsibleCard title="Apariencia del diagrama" open={openCard === 'apariencia'} onToggle={() => handleToggleCard('apariencia')}>
          <DiagramAppearanceCard
            character={character}
            ground={ground}
            onCharacterChange={setCharacter}
            onGroundChange={setGround}
          />
        </CollapsibleCard>
      </section>

      <section className="diagram-section diagram-section--stretch">
        <DiagramSection
          svg={result.svg}
          error={result.error}
          errorDetail={result.errorDetail}
          diagramFilename="diagrama-mruv.svg"
          graphs={[
            { id: 'x', title: 'Posición', svg: xGraphSvg, filename: 'posicion-tiempo.svg' },
            { id: 'v', title: 'Velocidad', svg: vGraphSvg, filename: 'velocidad-tiempo.svg' },
            { id: 'a', title: 'Aceleración', svg: aGraphSvg, filename: 'aceleracion-tiempo.svg' },
          ]}
        />
      </section>
    </div>
  );
}
