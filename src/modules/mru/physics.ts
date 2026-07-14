import { toSI, fromSI } from '../../core/units.ts';
import type { MRUSolveInput, MRUResolvedVars, ComputedField } from './types.ts';

export function resolveMRU(input: MRUSolveInput): MRUResolvedVars {
  const hasX0 = input.x0 !== undefined;
  const hasV = input.v !== undefined;
  const hasT = input.t !== undefined;
  const hasXf = input.xf !== undefined;
  const filledCount = [hasX0, hasV, hasT, hasXf].filter(Boolean).length;

  if (filledCount < 3) {
    throw new Error('Se requieren al menos 3 valores para resolver.');
  }

  let computedField: ComputedField;
  let x0SI: number;
  let vSI: number;
  let tSI: number;
  let xfSI: number;

  if (!hasX0) {
    vSI = toSI(input.v!, input.velUnit, 'velocity');
    tSI = toSI(input.t!, input.timeUnit, 'time');
    xfSI = toSI(input.xf!, input.xfUnit, 'distance');
    x0SI = xfSI - vSI * tSI;
    computedField = 'x0';
  } else if (!hasXf) {
    x0SI = toSI(input.x0!, input.x0Unit, 'distance');
    vSI = toSI(input.v!, input.velUnit, 'velocity');
    tSI = toSI(input.t!, input.timeUnit, 'time');
    xfSI = x0SI + vSI * tSI;
    computedField = 'xf';
  } else if (!hasV) {
    x0SI = toSI(input.x0!, input.x0Unit, 'distance');
    xfSI = toSI(input.xf!, input.xfUnit, 'distance');
    tSI = toSI(input.t!, input.timeUnit, 'time');
    vSI = (xfSI - x0SI) / tSI;
    computedField = 'v';
  } else if (!hasT) {
    x0SI = toSI(input.x0!, input.x0Unit, 'distance');
    xfSI = toSI(input.xf!, input.xfUnit, 'distance');
    vSI = toSI(input.v!, input.velUnit, 'velocity');
    if (Math.abs(vSI) < 1e-12) {
      if (Math.abs(xfSI - x0SI) < 1e-12) {
        tSI = 0;
      } else {
        throw new Error('Con velocidad 0, xf debe ser igual a xi.');
      }
    } else {
      tSI = (xfSI - x0SI) / vSI;
    }
    if (tSI < 0) {
      throw new Error('El tiempo calculado es negativo. Verifique los valores ingresados.');
    }
    computedField = 't';
  } else {
    x0SI = toSI(input.x0!, input.x0Unit, 'distance');
    xfSI = toSI(input.xf!, input.xfUnit, 'distance');
    vSI = toSI(input.v!, input.velUnit, 'velocity');
    tSI = toSI(input.t!, input.timeUnit, 'time');
    const expectedXf = x0SI + vSI * tSI;
    if (Math.abs(xfSI - expectedXf) > 0.001) {
      const displayExpected = fromSI(expectedXf, input.xfUnit, 'distance');
      throw new Error(
        `Los valores no cumplen la ecuación MRU: xf = ${displayExpected.toFixed(3)} ${input.xfUnit} (esperado), pero se ingresó ${input.xf} ${input.xfUnit}.`
      );
    }
    computedField = null;
  }

  const dxSI = xfSI - x0SI;

  return {
    x0: fromSI(x0SI, input.x0Unit, 'distance'),
    v: fromSI(vSI, input.velUnit, 'velocity'),
    t: fromSI(tSI, input.timeUnit, 'time'),
    xf: fromSI(xfSI, input.xfUnit, 'distance'),
    dx: fromSI(dxSI, input.x0Unit, 'distance'),
    computedField,
  };
}
