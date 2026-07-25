import { useState, useRef, useCallback, useEffect } from 'react';
import { usePhysicsEngineMRUV } from './usePhysicsEngineMRUV.ts';
import { formatValue } from '../core/format.ts';
import type { PipelineResult, CharacterType } from '../core/types.ts';
import type { DistanceUnit, TimeUnit, VelocityUnit, AccelerationUnit } from '../core/units.ts';
import type { DiagramControls } from '../modules/mruv/types.ts';

const ALL_FIELDS = ['xi', 'xf', 'vi', 'vf', 'a', 't'] as const;

export function useMRUVDiagram(controls: DiagramControls, characterType: CharacterType = 'square') {
  const { engine } = usePhysicsEngineMRUV();

  const [xi, setXi] = useState('');
  const [xf, setXf] = useState('');
  const [vi, setVi] = useState('');
  const [vf, setVf] = useState('');
  const [a, setA] = useState('');
  const [t, setT] = useState('');
  const [xiUnit, setXiUnit] = useState<DistanceUnit>('m');
  const [xfUnit, setXfUnit] = useState<DistanceUnit>('m');
  const [viUnit, setViUnit] = useState<VelocityUnit>('m/s');
  const [vfUnit, setVfUnit] = useState<VelocityUnit>('m/s');
  const [aUnit, setAUnit] = useState<AccelerationUnit>('m/s^2');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('s');
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [computedValues, setComputedValues] = useState<Record<string, string> | null>(null);

  const prevUnitsRef = useRef({ xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit });

  const svg = result && result.type === 'success' ? result.svg : null;
  const error = result && result.type !== 'success' ? result.message : null;
  const errorDetail =
    result && result.type !== 'success' && 'detail' in result
      ? (result as { detail?: string }).detail
      : null;

  const allFilled = xi.trim() !== '' && xf.trim() !== '' && vi.trim() !== '' && vf.trim() !== '' && a.trim() !== '' && t.trim() !== '';

  const filledCount = ALL_FIELDS.filter(f => {
    const val = f === 'xi' ? xi : f === 'xf' ? xf : f === 'vi' ? vi : f === 'vf' ? vf : f === 'a' ? a : t;
    return val.trim() !== '';
  }).length;

  const canCalculate = filledCount >= 4;

  const clearAll = useCallback(() => {
    setXi('');
    setXf('');
    setVi('');
    setVf('');
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

  const buildInput = useCallback(() => {
    const rawInput: Record<string, string> = { xi, xf, vi, vf, a, t };

    if (allFilled) {
      const prev = prevUnitsRef.current;
      if (xiUnit !== prev.xiUnit) { rawInput.xi = ''; }
      if (xfUnit !== prev.xfUnit) { rawInput.xf = ''; }
      if (viUnit !== prev.viUnit) { rawInput.vi = ''; }
      if (vfUnit !== prev.vfUnit) { rawInput.vf = ''; }
      if (aUnit !== prev.aUnit) { rawInput.a = ''; }
      if (timeUnit !== prev.timeUnit) { rawInput.t = ''; }
    }

    prevUnitsRef.current = { xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit };
    return rawInput;
  }, [xi, xf, vi, vf, a, t, xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit, allFilled]);

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
      const computed: Record<string, string> = {};
      const fields = res.computedFields ?? (res.computedField ? [res.computedField] : []);
      for (const cf of fields) {
        if (cf === 'xi') computed.xi = formatValue(res.resolvedValues.xi);
        if (cf === 'xf') computed.xf = formatValue(res.resolvedValues.xf);
        if (cf === 'vi') computed.vi = formatValue(res.resolvedValues.vi);
        if (cf === 'vf') computed.vf = formatValue(res.resolvedValues.vf);
        if (cf === 'a') computed.a = formatValue(res.resolvedValues.a);
        if (cf === 't') computed.t = formatValue(res.resolvedValues.t);
      }
      setComputedValues(computed);
    } else {
      setComputedValues(null);
    }

    setResult(res as PipelineResult);
  }, [buildInput, engine, xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit, controls, characterType]);

  const handleCalculate = useCallback(() => {
    runEngine();
  }, [runEngine]);

  const handleChange = useCallback((field: 'xi' | 'xf' | 'vi' | 'vf' | 'a' | 't', value: string) => {
    if (field === 'xi') setXi(value);
    else if (field === 'xf') setXf(value);
    else if (field === 'vi') setVi(value);
    else if (field === 'vf') setVf(value);
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
    const id = setTimeout(() => runEngine(), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xi, xf, vi, vf, a, t, xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit, controls, characterType]);

  return {
    values: { xi, xf, vi, vf, a, t },
    computedValues,
    units: { xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit },
    result: { svg, error, errorDetail },
    handleChange,
    handleUnitChange,
    handleCalculate,
    clearAll,
    allFilled,
    canCalculate,
  };
}
