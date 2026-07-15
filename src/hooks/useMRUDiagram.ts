import { useState, useRef, useCallback, useEffect } from 'react';
import { usePhysicsEngine } from './usePhysicsEngine.ts';
import { formatValue } from '../core/format.ts';
import type { PipelineResult, CharacterType } from '../core/types.ts';
import type { DistanceUnit, TimeUnit, VelocityUnit } from '../core/units.ts';
import type { ComputedField, DiagramControls } from '../modules/mru/types.ts';

function allFilled(x0: string, v: string, t: string, xf: string) {
  return [x0, v, t, xf].every((s) => s.trim() !== '');
}

export function useMRUDiagram(controls: DiagramControls, characterType: CharacterType = 'square') {
  const { engine } = usePhysicsEngine();

  const [x0, setX0] = useState('');
  const [v, setV] = useState('');
  const [t, setT] = useState('');
  const [xf, setXf] = useState('');
  const [x0Unit, setX0Unit] = useState<DistanceUnit>('m');
  const [xfUnit, setXfUnit] = useState<DistanceUnit>('m');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('s');
  const [velUnit, setVelUnit] = useState<VelocityUnit>('m/s');
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [computedField, setComputedField] = useState<{ field: ComputedField; value: string } | null>(null);

  const prevUnitsRef = useRef({ x0Unit, xfUnit, timeUnit, velUnit });

  const svg = result && result.type === 'success' ? result.svg : null;
  const error = result && result.type !== 'success' ? result.message : null;
  const errorDetail =
    result && result.type !== 'success' && 'detail' in result
      ? (result as { detail?: string }).detail
      : null;

  const clearAll = useCallback(() => {
    setX0('');
    setV('');
    setT('');
    setXf('');
    setX0Unit('m');
    setXfUnit('m');
    setTimeUnit('s');
    setVelUnit('m/s');
    setResult(null);
    setComputedField(null);
    prevUnitsRef.current = { x0Unit: 'm', xfUnit: 'm', timeUnit: 's', velUnit: 'm/s' };
  }, []);

  const buildInput = useCallback(() => {
    const rawInput: Record<string, string> = { x0, v, t, xf };

    if (allFilled(x0, v, t, xf)) {
      const prev = prevUnitsRef.current;
      let didClear = false;
      if (x0Unit !== prev.x0Unit) { rawInput.x0 = ''; didClear = true; }
      if (xfUnit !== prev.xfUnit) { rawInput.xf = ''; didClear = true; }
      if (timeUnit !== prev.timeUnit) { rawInput.t = ''; didClear = true; }
      if (velUnit !== prev.velUnit) { rawInput.v = ''; didClear = true; }

      if (!didClear && computedField) {
        if (rawInput[computedField.field!] === computedField.value) {
          rawInput[computedField.field!] = '';
        }
      }
    }

    prevUnitsRef.current = { x0Unit, xfUnit, timeUnit, velUnit };
    return rawInput;
  }, [x0, v, t, xf, x0Unit, xfUnit, timeUnit, velUnit, computedField]);

  const runEngine = useCallback(() => {
    const rawInput = buildInput();

    const res = engine.generate({
      moduleId: 'mru',
      rawInput,
      x0Unit,
      xfUnit,
      timeUnit,
      velUnit,
      controls,
      characterType,
    });

    if (res.type === 'success' && res.computedField && res.resolvedValues) {
      const cf = res.computedField;
      const computedValue = res.resolvedValues[cf];
      const computedStr = formatValue(computedValue);

      if (cf === 'x0' && x0 !== computedStr) {
        setX0(computedStr);
        setComputedField({ field: 'x0', value: computedStr });
      } else if (cf === 'xf' && xf !== computedStr) {
        setXf(computedStr);
        setComputedField({ field: 'xf', value: computedStr });
      } else if (cf === 'v' && v !== computedStr) {
        setV(computedStr);
        setComputedField({ field: 'v', value: computedStr });
      } else if (cf === 't' && t !== computedStr) {
        setT(computedStr);
        setComputedField({ field: 't', value: computedStr });
      }
    } else if (res.type === 'success') {
      setComputedField(null);
    }

    setResult(res as PipelineResult);
  }, [buildInput, engine, x0, v, t, xf, x0Unit, xfUnit, timeUnit, velUnit, controls, characterType]);

  const handleChange = useCallback((field: 'x0' | 'v' | 't' | 'xf', value: string) => {
    setComputedField((prev) => {
      if (prev?.field === field) return null;
      return prev;
    });
    if (field === 'x0') setX0(value);
    else if (field === 'v') setV(value);
    else if (field === 't') setT(value);
    else setXf(value);
  }, []);

  const handleUnitChange = useCallback(
    (unitKind: 'x0Unit' | 'xfUnit' | 'timeUnit' | 'velUnit', value: string) => {
      if (unitKind === 'x0Unit') setX0Unit(value as DistanceUnit);
      else if (unitKind === 'xfUnit') setXfUnit(value as DistanceUnit);
      else if (unitKind === 'timeUnit') setTimeUnit(value as TimeUnit);
      else setVelUnit(value as VelocityUnit);
    },
    []
  );

  const handleCalculate = useCallback(() => {
    runEngine();
  }, [runEngine]);

  const handleSubmit = useCallback(() => {
    runEngine();
  }, [runEngine]);

  useEffect(() => {
    const id = setTimeout(() => runEngine(), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x0Unit, xfUnit, timeUnit, velUnit, controls, characterType]);

  return {
    values: { x0, v, t, xf },
    units: { x0Unit, xfUnit, timeUnit, velUnit },
    result: { svg, error, errorDetail },
    computedField,
    handleChange,
    handleUnitChange,
    handleCalculate,
    handleSubmit,
    clearAll,
  };
}
