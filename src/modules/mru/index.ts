import type { PhysicsModule, ValidationResult, PhysicsResult, DiagramModel, SceneGraph } from '../../core/types.ts';
import { validateMRU } from './validation.ts';
import { resolveMRU } from './physics.ts';
import { inferMRU } from './inference.ts';
import { buildMRUScene } from './scene-builder.ts';
import type { MRUResult, MRUDiagramModel } from './types.ts';

export const MRUModule: PhysicsModule = {
  info: {
    id: 'mru',
    name: 'Movimiento Rectilíneo Uniforme (MRU)',
    description: 'Genera diagramas de MRU a partir de posición inicial, velocidad y tiempo.',
  },
  validate(input: Record<string, string>): ValidationResult {
    return validateMRU(input);
  },
  solve(input: Record<string, number>): PhysicsResult {
    const result = resolveMRU({
      x0: input['x0'],
      v: input['v'],
      t: input['t'],
      xf: input['xf'],
      x0Unit: 'm',
      xfUnit: 'm',
      timeUnit: 's',
      velUnit: 'm/s',
    });
    return result as unknown as PhysicsResult;
  },
  infer(result: PhysicsResult): DiagramModel {
    return inferMRU(result as unknown as MRUResult) as unknown as DiagramModel;
  },
  buildScene(model: DiagramModel): SceneGraph {
    return buildMRUScene(model as unknown as MRUDiagramModel);
  },
};
