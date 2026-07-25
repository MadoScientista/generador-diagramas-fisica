import { toSI, fromSI } from '../../core/units.ts';
import type { MRUSolveInput, MRUResolvedVars, ComputedField } from './types.ts';
import { MruError, MruErrorCategory } from './errors.ts';

const DEFAULT_EPSILON = 1e-9;

function relEpsilon(a: number, b: number, eps = DEFAULT_EPSILON): boolean {
  return Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
}

interface SolveStrategy {
  match: (filledFields: string[]) => boolean;
  solve: (input: MRUSolveInput) => MRUResolvedVars;
}

const strategies: SolveStrategy[] = [
  {
    match: (f) => !f.includes('x0'),
    solve(input) {
      const vSI = toSI(input.v!, input.velUnit, 'velocity');
      const tSI = toSI(input.t!, input.timeUnit, 'time');
      const xfSI = toSI(input.xf!, input.xfUnit, 'distance');
      const x0SI = xfSI - vSI * tSI;
      return buildResult(x0SI, vSI, tSI, xfSI, input, 'x0');
    },
  },
  {
    match: (f) => !f.includes('xf'),
    solve(input) {
      const x0SI = toSI(input.x0!, input.x0Unit, 'distance');
      const vSI = toSI(input.v!, input.velUnit, 'velocity');
      const tSI = toSI(input.t!, input.timeUnit, 'time');
      const xfSI = x0SI + vSI * tSI;
      return buildResult(x0SI, vSI, tSI, xfSI, input, 'xf');
    },
  },
  {
    match: (f) => !f.includes('v'),
    solve(input) {
      const x0SI = toSI(input.x0!, input.x0Unit, 'distance');
      const xfSI = toSI(input.xf!, input.xfUnit, 'distance');
      const tSI = toSI(input.t!, input.timeUnit, 'time');
      if (tSI <= 0) {
        throw new MruError(MruErrorCategory.INVALID_DOMAIN, 'El tiempo debe ser estrictamente mayor que 0.', 't');
      }
      const vSI = (xfSI - x0SI) / tSI;
      return buildResult(x0SI, vSI, tSI, xfSI, input, 'v');
    },
  },
  {
    match: (f) => !f.includes('t'),
    solve(input) {
      const x0SI = toSI(input.x0!, input.x0Unit, 'distance');
      const xfSI = toSI(input.xf!, input.xfUnit, 'distance');
      const vSI = toSI(input.v!, input.velUnit, 'velocity');
      if (relEpsilon(vSI, 0)) {
        if (!relEpsilon(xfSI, x0SI)) {
          throw new MruError(
            MruErrorCategory.PHYSICAL_CONTRADICTION,
            'Con velocidad 0, xf debe ser igual a xi.',
            'v'
          );
        }
        throw new MruError(
          MruErrorCategory.UNDERDETERMINED,
          'Falta un dato: con v=0 y xf=xi, se necesita un t>0 explícito.',
          't'
        );
      }
      const tSI = (xfSI - x0SI) / vSI;
      if (tSI <= 0) {
        throw new MruError(
          MruErrorCategory.PHYSICAL_CONTRADICTION,
          'El tiempo calculado es 0 o negativo. Verifique los valores ingresados.',
          't'
        );
      }
      return buildResult(x0SI, vSI, tSI, xfSI, input, 't');
    },
  },
  {
    match: (f) => f.length === 4,
    solve(input) {
      const x0SI = toSI(input.x0!, input.x0Unit, 'distance');
      const xfSI = toSI(input.xf!, input.xfUnit, 'distance');
      const vSI = toSI(input.v!, input.velUnit, 'velocity');
      const tSI = toSI(input.t!, input.timeUnit, 'time');
      const expectedXf = x0SI + vSI * tSI;
      if (!relEpsilon(xfSI, expectedXf)) {
        const displayExpected = fromSI(expectedXf, input.xfUnit, 'distance');
        throw new MruError(
          MruErrorCategory.INCONSISTENT_OVERDETERMINED,
          `Los valores no cumplen la ecuación MRU: xf = ${displayExpected.toFixed(3)} ${input.xfUnit} (esperado), pero se ingresó ${input.xf} ${input.xfUnit}.`
        );
      }
      return buildResult(x0SI, vSI, tSI, xfSI, input, null);
    },
  },
];

function buildResult(
  x0SI: number,
  vSI: number,
  tSI: number,
  xfSI: number,
  input: MRUSolveInput,
  computedField: ComputedField
): MRUResolvedVars {
  return {
    x0: fromSI(x0SI, input.x0Unit, 'distance'),
    v: fromSI(vSI, input.velUnit, 'velocity'),
    t: fromSI(tSI, input.timeUnit, 'time'),
    xf: fromSI(xfSI, input.xfUnit, 'distance'),
    dx: fromSI(xfSI - x0SI, input.x0Unit, 'distance'),
    computedField,
  };
}

export function resolveMRU(input: MRUSolveInput): MRUResolvedVars {
  const filledFields = (['x0', 'v', 't', 'xf'] as const).filter(
    (k) => input[k] !== undefined
  );

  if (filledFields.length < 3) {
    throw new MruError(MruErrorCategory.INSUFFICIENT_INPUTS, 'Se requieren al menos 3 valores para resolver.');
  }

  const strategy = strategies.find((s) => s.match(filledFields));
  if (!strategy) {
    throw new MruError(MruErrorCategory.INSUFFICIENT_INPUTS, 'No se pudo determinar la estrategia de resolución.');
  }

  return strategy.solve(input);
}
