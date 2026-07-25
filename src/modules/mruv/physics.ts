import { toSI, fromSI } from '../../core/units.ts';
import type { MRUVSolveInput, MRUVResolvedVars } from './types.ts';

export function resolveMRUV(input: MRUVSolveInput): MRUVResolvedVars {
  const hasXi = input.xi !== undefined;
  const hasVi = input.vi !== undefined;
  const hasA = input.a !== undefined;
  const hasT = input.t !== undefined;

  if (!hasXi || !hasVi || !hasA || !hasT) {
    throw new Error('Se requieren los 4 valores: xi, vi, a y t.');
  }

  const xiSI = toSI(input.xi!, input.xiUnit, 'distance');
  const viSI = toSI(input.vi!, input.viUnit, 'velocity');
  const aSI = toSI(input.a!, input.aUnit, 'acceleration');
  const tSI = toSI(input.t!, input.timeUnit, 'time');

  if (tSI < 0) {
    throw new Error('El tiempo no puede ser negativo.');
  }

  const vfSI = viSI + aSI * tSI;
  const xfSI = xiSI + viSI * tSI + 0.5 * aSI * tSI * tSI;
  const dxSI = xfSI - xiSI;

  return {
    xi: fromSI(xiSI, input.xiUnit, 'distance'),
    xf: fromSI(xfSI, input.xfUnit, 'distance'),
    vi: fromSI(viSI, input.viUnit, 'velocity'),
    vf: fromSI(vfSI, input.vfUnit, 'velocity'),
    a: fromSI(aSI, input.aUnit, 'acceleration'),
    t: fromSI(tSI, input.timeUnit, 'time'),
    dx: fromSI(dxSI, input.xiUnit, 'distance'),
    computedField: null,
  };
}
