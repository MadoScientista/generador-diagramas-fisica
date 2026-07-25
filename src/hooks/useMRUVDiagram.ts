import { useState, useRef, useCallback, useEffect } from 'react';
import { usePhysicsEngineMRUV } from './usePhysicsEngineMRUV.ts';
import { formatValue } from '../core/format.ts';
import type { PipelineResult, CharacterType } from '../core/types.ts';
import type { DistanceUnit, TimeUnit, VelocityUnit, AccelerationUnit } from '../core/units.ts';
import type { DiagramControls } from '../modules/mruv/types.ts';

export function useMRUVDiagram(controls: DiagramControls, characterType: CharacterType = 'square') {
  const { engine } = usePhysicsEngineMRUV();

  const [xi, setXi] = useState('');
  const [vi, setVi] = useState('');
  const [a, setA] = useState('');
  const [t, setT] = useState('');
  const [xiUnit, setXiUnit] = useState<DistanceUnit>('m');
  const [xfUnit, setXfUnit] = useState<DistanceUnit>('m');
  const [viUnit, setViUnit] = useState<VelocityUnit>('m/s');
  const [vfUnit, setVfUnit] = useState<VelocityUnit>('m/s');
  const [aUnit, setAUnit] = useState<AccelerationUnit>('m/s^2');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('s');
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [computedValues, setComputedValues] = useState<{ xf: string; vf: string } | null>(null);

  const prevUnitsRef = useRef({ xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit });

  const svg = result && result.type === 'success' ? result.svg : null;
  const error = result && result.type !== 'success' ? result.message : null;
  const errorDetail =
    result && result.type !== 'success' && 'detail' in result
      ? (result as { detail?: string }).detail
      : null;

  const clearAll = useCallback(() => {
    setXi('');
    setVi('');
    setA('');
    setT('');
    setXiUnit('m');
    setXfUnit('m');
    setViUnit('m/s');
    setVfUnit('m/s');
    setAUnit('m/s^2');
    setTimeUnit('s');
    setResult(null);
    setComputedValues(null);
    prevUnitsRef.current = { xiUnit: 'm', xfUnit: 'm', viUnit: 'm/s', vfUnit: 'm/s', aUnit: 'm/s^2', timeUnit: 's' };
  }, []);

  const allFilled = xi.trim() !== '' && vi.trim() !== '' && a.trim() !== '' && t.trim() !== '';

  const buildInput = useCallback(() => {
    const rawInput: Record<string, string> = { xi, vi, a, t };

    if (allFilled) {
      const prev = prevUnitsRef.current;
      if (xiUnit !== prev.xiUnit) { rawInput.xi = ''; }
      if (viUnit !== prev.viUnit) { rawInput.vi = ''; }
      if (aUnit !== prev.aUnit) { rawInput.a = ''; }
      if (timeUnit !== prev.timeUnit) { rawInput.t = ''; }
    }

    prevUnitsRef.current = { xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit };
    return rawInput;
  }, [xi, vi, a, t, xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit, allFilled]);

  const runEngine = useCallback(() => {
    const rawInput = buildInput();

    const res = engine.generate({
      moduleId: 'mruv',
      rawInput,
      xiUnit,
      xfUnit,
      viUnit,
      vfUnit,
      aUnit,
      timeUnit,
      controls,
      characterType,
    });

    if (res.type === 'success' && res.resolvedValues) {
      setComputedValues({
        xf: formatValue(res.resolvedValues.xf),
        vf: formatValue(res.resolvedValues.vf),
      });
    } else {
      setComputedValues(null);
    }

    setResult(res as PipelineResult);
  }, [buildInput, engine, xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit, controls, characterType]);

  const handleChange = useCallback((field: 'xi' | 'vi' | 'a' | 't', value: string) => {
    if (field === 'xi') setXi(value);
    else if (field === 'vi') setVi(value);
    else if (field === 'a') setA(value);
    else setT(value);
  }, []);

  const handleUnitChange = useCallback(
    (unitKind: 'xiUnit' | 'xfUnit' | 'viUnit' | 'vfUnit' | 'aUnit' | 'timeUnit', value: string) => {
      if (unitKind === 'xiUnit') setXiUnit(value as DistanceUnit);
      else if (unitKind === 'xfUnit') setXfUnit(value as DistanceUnit);
      else if (unitKind === 'viUnit') setViUnit(value as VelocityUnit);
      else if (unitKind === 'vfUnit') setVfUnit(value as VelocityUnit);
      else if (unitKind === 'aUnit') setAUnit(value as AccelerationUnit);
      else setTimeUnit(value as TimeUnit);
    },
    []
  );

  useEffect(() => {
    if (allFilled) {
      const id = setTimeout(() => runEngine(), 0);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xi, vi, a, t, xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit, controls, characterType]);

  return {
    values: { xi, vi, a, t },
    computedValues,
    units: { xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit },
    result: { svg, error, errorDetail },
    handleChange,
    handleUnitChange,
    clearAll,
    allFilled,
  };
}
