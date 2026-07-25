import { useState, useRef, useCallback, useEffect } from 'react';
import { usePhysicsEngine } from './usePhysicsEngine.ts';
import { formatValue } from '../core/format.ts';
import type { PipelineResult, CharacterType } from '../core/types.ts';
import type { DistanceUnit, TimeUnit, VelocityUnit } from '../core/units.ts';
import type { ComputedField, DiagramControls } from '../modules/mru/types.ts';

interface MRUState {
  values: { x0: string; v: string; t: string; xf: string };
  units: { x0Unit: DistanceUnit; xfUnit: DistanceUnit; timeUnit: TimeUnit; velUnit: VelocityUnit };
  result: PipelineResult | null;
  computedField: { field: ComputedField; value: string } | null;
}

const INITIAL_STATE: MRUState = {
  values: { x0: '', v: '', t: '', xf: '' },
  units: { x0Unit: 'm', xfUnit: 'm', timeUnit: 's', velUnit: 'm/s' },
  result: null,
  computedField: null,
};

function allFilled(values: MRUState['values']) {
  return Object.values(values).every((s) => s.trim() !== '');
}

export function useMRUDiagram(controls: DiagramControls, characterType: CharacterType = 'square') {
  const { engine } = usePhysicsEngine();

  const [state, setState] = useState<MRUState>(INITIAL_STATE);
  const { values, units, result, computedField } = state;

  const prevUnitsRef = useRef(units);

  const svg = result && result.type === 'success' ? result.svg : null;
  const error = result && result.type !== 'success' ? result.message : null;
  const errorDetail =
    result && result.type !== 'success' && 'detail' in result
      ? (result as { detail?: string }).detail
      : null;

  const clearAll = useCallback(() => {
    setState(INITIAL_STATE);
    prevUnitsRef.current = INITIAL_STATE.units;
  }, []);

  const buildInput = useCallback(() => {
    const rawInput: Record<string, string> = { x0: values.x0, v: values.v, t: values.t, xf: values.xf };

    if (allFilled(values)) {
      const prev = prevUnitsRef.current;
      let didClear = false;
      if (units.x0Unit !== prev.x0Unit) { rawInput.x0 = ''; didClear = true; }
      if (units.xfUnit !== prev.xfUnit) { rawInput.xf = ''; didClear = true; }
      if (units.timeUnit !== prev.timeUnit) { rawInput.t = ''; didClear = true; }
      if (units.velUnit !== prev.velUnit) { rawInput.v = ''; didClear = true; }

      if (!didClear && computedField) {
        if (rawInput[computedField.field!] === computedField.value) {
          rawInput[computedField.field!] = '';
        }
      }
    }

    prevUnitsRef.current = units;
    return rawInput;
  }, [values, units, computedField]);

  const runEngine = useCallback(() => {
    const rawInput = buildInput();

    const res = engine.generate({
      moduleId: 'mru',
      rawInput,
      x0Unit: units.x0Unit,
      xfUnit: units.xfUnit,
      timeUnit: units.timeUnit,
      velUnit: units.velUnit,
      controls,
      characterType,
    });

    if (res.type === 'success' && res.computedField && res.resolvedValues) {
      const cf = res.computedField;
      const computedValue = res.resolvedValues[cf];
      const computedStr = formatValue(computedValue);

      setState((prev) => {
        if (prev.values[cf] === computedStr) return prev;
        return {
          ...prev,
          values: { ...prev.values, [cf]: computedStr },
          computedField: { field: cf, value: computedStr },
        };
      });
    } else if (res.type === 'success') {
      setState((prev) => ({ ...prev, computedField: null }));
    }

    setState((prev) => ({ ...prev, result: res as PipelineResult }));
  }, [buildInput, engine, units, controls, characterType]);

  const handleChange = useCallback((field: 'x0' | 'v' | 't' | 'xf', value: string) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      computedField: prev.computedField?.field === field ? null : prev.computedField,
    }));
  }, []);

  const handleUnitChange = useCallback(
    (unitKind: 'x0Unit' | 'xfUnit' | 'timeUnit' | 'velUnit', value: string) => {
      setState((prev) => ({
        ...prev,
        units: { ...prev.units, [unitKind]: value },
      }));
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
  }, [units.x0Unit, units.xfUnit, units.timeUnit, units.velUnit, controls, characterType]);

  return {
    values,
    units,
    result: { svg, error, errorDetail },
    computedField,
    handleChange,
    handleUnitChange,
    handleCalculate,
    handleSubmit,
    clearAll,
  };
}
