import type { PhysicsModule, ValidationResult, PhysicsResult, DiagramModel, SceneGraph } from '../../core/types.ts';
import { validateMRUV } from './validation.ts';
import { resolveMRUV } from './physics.ts';
import { inferMRUV } from './inference.ts';
import { buildMRUVScene } from './scene-builder.ts';
import type { MRUVResult, MRUVDiagramModel } from './types.ts';

export const MRUVModule: PhysicsModule = {
  info: {
    id: 'mruv',
    name: 'Movimiento Rectilineo Uniformemente Variado (MRUV)',
    description: 'Genera diagramas de MRUV a partir de posicion, velocidad, aceleracion y tiempo.',
  },
  validate(input: Record<string, string>): ValidationResult {
    return validateMRUV(input);
  },
  solve(input: Record<string, number>): PhysicsResult {
    const result = resolveMRUV({
      xi: input['xi'],
      xf: input['xf'],
      vi: input['vi'],
      vf: input['vf'],
      a: input['a'],
      t: input['t'],
      xiUnit: 'm',
      xfUnit: 'm',
      viUnit: 'm/s',
      vfUnit: 'm/s',
      aUnit: 'm/s^2',
      timeUnit: 's',
    });
    return result as unknown as PhysicsResult;
  },
  infer(result: PhysicsResult): DiagramModel {
    return inferMRUV(result as unknown as MRUVResult) as unknown as DiagramModel;
  },
  buildScene(model: DiagramModel): SceneGraph {
    return buildMRUVScene(model as unknown as MRUVDiagramModel);
  },
};
