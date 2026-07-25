import { toSI, fromSI } from '../../core/units.ts';
import type { MRUVSolveInput, MRUVResolvedVars, ComputedField } from './types.ts';
import { MruvError, MruvErrorCategory } from './errors.ts';

const DEFAULT_EPSILON = 1e-9;

function relEpsilon(a: number, b: number, eps = DEFAULT_EPSILON): boolean {
  return Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
}

type SystemVar = 'vi' | 'vf' | 'a' | 't' | 'dx';

interface SolveStrategy {
  match: (knownSystem: SystemVar[]) => boolean;
  solve: (sys: Record<SystemVar, number | undefined>, input: MRUVSolveInput) => { vi: number; vf: number; a: number; t: number; dx: number };
}

const strategies: SolveStrategy[] = [
  {
    // {vi, vf, a} → t, dx
    match: (k) => k.includes('vi') && k.includes('vf') && k.includes('a') && !k.includes('t') && !k.includes('dx'),
    solve(sys) {
      const { vi, vf, a } = sys as { vi: number; vf: number; a: number };
      if (relEpsilon(a, 0)) {
        if (!relEpsilon(vi, vf)) {
          throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'Con a=0, vi debe ser igual a vf.', 'a');
        }
        throw new MruvError(MruvErrorCategory.UNDERDETERMINED, 'Con a=0 y vi=vf, el tiempo es indeterminado.', 't');
      }
      const t = (vf - vi) / a;
      if (t <= 0) throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'El tiempo calculado es 0 o negativo.', 't');
      const dx = ((vi + vf) / 2) * t;
      return { vi, vf, a, t, dx };
    },
  },
  {
    // {vi, vf, t} → a, dx
    match: (k) => k.includes('vi') && k.includes('vf') && k.includes('t') && !k.includes('a') && !k.includes('dx'),
    solve(sys) {
      const { vi, vf, t } = sys as { vi: number; vf: number; t: number };
      const a = (vf - vi) / t;
      const dx = ((vi + vf) / 2) * t;
      return { vi, vf, a, t, dx };
    },
  },
  {
    // {vi, vf, dx} → a, t (E4 then E1)
    match: (k) => k.includes('vi') && k.includes('vf') && k.includes('dx') && !k.includes('a') && !k.includes('t'),
    solve(sys, input) {
      const { vi, vf, dx } = sys as { vi: number; vf: number; dx: number };
      if (relEpsilon(vi + vf, 0)) {
        if (!relEpsilon(dx, 0)) {
          throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'Con vi+vf=0, el desplazamiento debe ser 0.', 'dx');
        }
        if (input.a !== undefined) {
          const aSI = toSI(input.a, input.aUnit, 'acceleration');
          const t = (vf - vi) / aSI;
          if (t <= 0) throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'El tiempo calculado es 0 o negativo.', 't');
          return { vi, vf, a: aSI, t, dx };
        }
        if (input.t !== undefined) {
          const tSI = toSI(input.t, input.timeUnit, 'time');
          const a = (vf - vi) / tSI;
          return { vi, vf, a, t: tSI, dx };
        }
        throw new MruvError(MruvErrorCategory.UNDERDETERMINED, 'Con vi+vf=0 y dx=0, el tiempo es indeterminado. Proporcione a o t para resolver.', 't');
      }
      const t = (2 * dx) / (vi + vf);
      if (t <= 0) throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'El tiempo calculado es 0 o negativo.', 't');
      const a = (vf - vi) / t;
      return { vi, vf, a, t, dx };
    },
  },
  {
    // {vi, a, t} → vf, dx (simplest case)
    match: (k) => k.includes('vi') && k.includes('a') && k.includes('t') && !k.includes('vf') && !k.includes('dx'),
    solve(sys) {
      const { vi, a, t } = sys as { vi: number; a: number; t: number };
      const vf = vi + a * t;
      const dx = vi * t + 0.5 * a * t * t;
      return { vi, vf, a, t, dx };
    },
  },
  {
    // {vi, a, dx} → vf, t (E3 → E1) — sign ambiguity
    match: (k) => k.includes('vi') && k.includes('a') && k.includes('dx') && !k.includes('vf') && !k.includes('t'),
    solve(sys, input) {
      const { vi, a, dx } = sys as { vi: number; a: number; dx: number };
      const disc = vi * vi + 2 * a * dx;
      if (disc < 0) {
        throw new MruvError(MruvErrorCategory.NO_REAL_SOLUTION, 'No existe solución real: el discriminante es negativo (vi² + 2a·Δx < 0).');
      }
      const vfPos = Math.sqrt(disc);
      const vfNeg = -vfPos;
      const vf = input.vf !== undefined ? input.vf : vfPos;
      if (relEpsilon(a, 0)) {
        throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'Con a=0, no se puede despejar t desde E3/E1.', 'a');
      }
      const t = (vf - vi) / a;
      if (t <= 0) throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'El tiempo calculado es 0 o negativo.', 't');
      if (!relEpsilon(vf, vfPos) && !relEpsilon(vf, vfNeg)) {
        throw new MruvError(MruvErrorCategory.AMBIGUOUS_SIGN, 'Ambigüedad de signo: ingrese vf para desambiguar.');
      }
      return { vi, vf, a, t, dx };
    },
  },
  {
    // {vi, t, dx} → vf, a (E2 → E1)
    match: (k) => k.includes('vi') && k.includes('t') && k.includes('dx') && !k.includes('vf') && !k.includes('a'),
    solve(sys) {
      const { vi, t, dx } = sys as { vi: number; t: number; dx: number };
      const a = (2 * (dx - vi * t)) / (t * t);
      const vf = vi + a * t;
      return { vi, vf, a, t, dx };
    },
  },
  {
    // {vf, a, t} → vi, dx (E1 → E4)
    match: (k) => k.includes('vf') && k.includes('a') && k.includes('t') && !k.includes('vi') && !k.includes('dx'),
    solve(sys) {
      const { vf, a, t } = sys as { vf: number; a: number; t: number };
      const vi = vf - a * t;
      const dx = ((vi + vf) / 2) * t;
      return { vi, vf, a, t, dx };
    },
  },
  {
    // {vf, a, dx} → vi, t (E3 → E1) — sign ambiguity
    match: (k) => k.includes('vf') && k.includes('a') && k.includes('dx') && !k.includes('vi') && !k.includes('t'),
    solve(sys, input) {
      const { vf, a, dx } = sys as { vf: number; a: number; dx: number };
      const disc = vf * vf - 2 * a * dx;
      if (disc < 0) {
        throw new MruvError(MruvErrorCategory.NO_REAL_SOLUTION, 'No existe solución real: el discriminante es negativo (vf² - 2a·Δx < 0).');
      }
      const viPos = Math.sqrt(disc);
      const viNeg = -viPos;
      const vi = input.vi !== undefined ? input.vi : viPos;
      if (relEpsilon(a, 0)) {
        throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'Con a=0, no se puede despejar t desde E3/E1.', 'a');
      }
      const t = (vf - vi) / a;
      if (t <= 0) throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'El tiempo calculado es 0 o negativo.', 't');
      if (!relEpsilon(vi, viPos) && !relEpsilon(vi, viNeg)) {
        throw new MruvError(MruvErrorCategory.AMBIGUOUS_SIGN, 'Ambigüedad de signo: ingrese vi para desambiguar.');
      }
      return { vi, vf, a, t, dx };
    },
  },
  {
    // {vf, t, dx} → vi, a (E4 → E1)
    match: (k) => k.includes('vf') && k.includes('t') && k.includes('dx') && !k.includes('vi') && !k.includes('a'),
    solve(sys) {
      const { vf, t, dx } = sys as { vf: number; t: number; dx: number };
      const vi = (2 * dx) / t - vf;
      const a = (vf - vi) / t;
      return { vi, vf, a, t, dx };
    },
  },
  {
    // {a, t, dx} → vi, vf (E2 → E1)
    match: (k) => k.includes('a') && k.includes('t') && k.includes('dx') && !k.includes('vi') && !k.includes('vf'),
    solve(sys) {
      const { a, t, dx } = sys as { a: number; t: number; dx: number };
      const vi = (dx - 0.5 * a * t * t) / t;
      const vf = vi + a * t;
      return { vi, vf, a, t, dx };
    },
  },
];

function buildResult(
  viSI: number, vfSI: number, aSI: number, tSI: number, dxSI: number,
  xiSI: number, xfSI: number,
  input: MRUVSolveInput,
  computedField: ComputedField,
  computedFields: ComputedField[]
): MRUVResolvedVars {
  return {
    xi: fromSI(xiSI, input.xiUnit, 'distance'),
    xf: fromSI(xfSI, input.xfUnit, 'distance'),
    vi: fromSI(viSI, input.viUnit, 'velocity'),
    vf: fromSI(vfSI, input.vfUnit, 'velocity'),
    a: fromSI(aSI, input.aUnit, 'acceleration'),
    t: fromSI(tSI, input.timeUnit, 'time'),
    dx: fromSI(dxSI, input.xiUnit, 'distance'),
    computedField,
    computedFields,
  };
}

export function resolveMRUV(input: MRUVSolveInput): MRUVResolvedVars {
  const hasXi = input.xi !== undefined;
  const hasXf = input.xf !== undefined;
  const hasVi = input.vi !== undefined;
  const hasVf = input.vf !== undefined;
  const hasA = input.a !== undefined;
  const hasT = input.t !== undefined;

  // Validate t <= 0 for all t values (direct input or to be computed)
  if (hasT) {
    const tSI = toSI(input.t!, input.timeUnit, 'time');
    if (tSI <= 0) {
      throw new MruvError(MruvErrorCategory.INVALID_DOMAIN, 'El tiempo debe ser estrictamente mayor que 0.', 't');
    }
  }

  // xi and xf must be different
  if (hasXi && hasXf) {
    const xiSI = toSI(input.xi!, input.xiUnit, 'distance');
    const xfSI = toSI(input.xf!, input.xfUnit, 'distance');
    if (relEpsilon(xiSI, xfSI)) {
      throw new MruvError(MruvErrorCategory.EQUAL_VALUES, 'xi y xf deben ser distintos.', 'xi');
    }
  }

  // vi and vf must be different
  if (hasVi && hasVf) {
    const viSI = toSI(input.vi!, input.viUnit, 'velocity');
    const vfSI = toSI(input.vf!, input.vfUnit, 'velocity');
    if (relEpsilon(viSI, vfSI)) {
      throw new MruvError(MruvErrorCategory.EQUAL_VALUES, 'vi y vf deben ser distintos.', 'vi');
    }
  }

  // Position anchoring check
  if (!hasXi && !hasXf) {
    throw new MruvError(MruvErrorCategory.POSITION_UNANCHORED, 'Se requiere al menos una posición (xi o xf) para anclar el sistema.');
  }

  // Determine Δx
  let dxSI: number | undefined;
  if (hasXi && hasXf) {
    dxSI = toSI(input.xf!, input.xfUnit, 'distance') - toSI(input.xi!, input.xiUnit, 'distance');
  }

  // Build system variables {vi, vf, a, t, dx}
  const sysRaw: Partial<Record<SystemVar, number | undefined>> = {};
  if (hasVi) sysRaw.vi = toSI(input.vi!, input.viUnit, 'velocity');
  if (hasVf) sysRaw.vf = toSI(input.vf!, input.vfUnit, 'velocity');
  if (hasA) sysRaw.a = toSI(input.a!, input.aUnit, 'acceleration');
  if (hasT) sysRaw.t = toSI(input.t!, input.timeUnit, 'time');
  if (dxSI !== undefined) sysRaw.dx = dxSI;

  const knownSystem = (Object.keys(sysRaw) as SystemVar[]).filter(k => sysRaw[k] !== undefined);

  // Need at least 3 known system variables
  if (knownSystem.length < 3) {
    throw new MruvError(MruvErrorCategory.INSUFFICIENT_INPUTS, `Se necesitan al menos 3 valores del sistema {vi, vf, a, t, Δx}. Actualmente hay ${knownSystem.length}.`);
  }

  // Check if all 5 system vars are known (overdetermined)
  if (knownSystem.length === 5) {
    const sys = sysRaw as Record<SystemVar, number>;
    const viSI = sys.vi!;
    const vfSI = sys.vf!;
    const aSI = sys.a!;
    const tSI = sys.t!;
    const dxSI = sys.dx!;
    // Verify consistency: E1, E2, E3, E4
    const checkE1 = relEpsilon(vfSI, viSI + aSI * tSI);
    const checkE2 = relEpsilon(dxSI, viSI * tSI + 0.5 * aSI * tSI * tSI);
    const checkE4 = relEpsilon(dxSI, ((viSI + vfSI) / 2) * tSI);
    if (!checkE1 || !checkE2 || !checkE4) {
      const eqs = [];
      if (!checkE1) eqs.push('E1 (vf = vi + a·t)');
      if (!checkE2) eqs.push('E2 (Δx = vi·t + ½a·t²)');
      if (!checkE4) eqs.push('E4 (Δx = ((vi+vf)/2)·t)');
      throw new MruvError(MruvErrorCategory.INCONSISTENT_OVERDETERMINED, `Los valores no cumplen las ecuaciones MRUV: ${eqs.join(', ')}.`);
    }
    const xiSI = toSI(input.xi!, input.xiUnit, 'distance');
    const xfSI = toSI(input.xf!, input.xfUnit, 'distance');
    return buildResult(viSI, vfSI, aSI, tSI, dxSI, xiSI, xfSI, input, null, []);
  }

  // Find matching strategy
  const strategy = strategies.find(s => s.match(knownSystem));
  if (!strategy) {
    throw new MruvError(MruvErrorCategory.INSUFFICIENT_INPUTS, 'No se pudo determinar la estrategia de resolución con los datos proporcionados.');
  }

  // Solve system
  const sys = sysRaw as Record<SystemVar, number | undefined>;
  const result = strategy.solve(sys, input);

  // Validate computed t
  if (result.t <= 0) {
    throw new MruvError(MruvErrorCategory.PHYSICAL_CONTRADICTION, 'El tiempo calculado es 0 o negativo. Verifique los valores ingresados.', 't');
  }

  // Resolve position
  let xiSI: number;
  let xfSI: number;
  let positionComputed: ComputedField = null;

  if (hasXi && hasXf) {
    xiSI = toSI(input.xi!, input.xiUnit, 'distance');
    xfSI = toSI(input.xf!, input.xfUnit, 'distance');
    // Verify Δx consistency
    if (!relEpsilon(result.dx, xfSI - xiSI)) {
      throw new MruvError(MruvErrorCategory.INCONSISTENT_OVERDETERMINED, `Δx calculado (${result.dx.toFixed(3)} m) no coincide con xf - xi (${(xfSI - xiSI).toFixed(3)} m).`);
    }
  } else if (hasXi) {
    xiSI = toSI(input.xi!, input.xiUnit, 'distance');
    xfSI = xiSI + result.dx;
    positionComputed = 'xf';
  } else {
    xfSI = toSI(input.xf!, input.xfUnit, 'distance');
    xiSI = xfSI - result.dx;
    positionComputed = 'xi';
  }

  // Determine which fields were computed
  const computedFields: ComputedField[] = [];
  if (positionComputed !== null) computedFields.push(positionComputed);
  if (!hasVi) computedFields.push('vi');
  if (!hasVf) computedFields.push('vf');
  if (!hasA) computedFields.push('a');
  if (!hasT) computedFields.push('t');

  const computedField: ComputedField = computedFields.length > 0 ? computedFields[0] : null;

  return buildResult(result.vi, result.vf, result.a, result.t, result.dx, xiSI, xfSI, input, computedField, computedFields);
}
