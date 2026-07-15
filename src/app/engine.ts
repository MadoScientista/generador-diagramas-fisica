import { ModuleRegistry, layout, render } from '../core/index.ts';
import type {
  PipelineResult,
  PipelineError,
  SceneGraph,
  CharacterType,
} from '../core/types.ts';
import type { DistanceUnit, TimeUnit, VelocityUnit } from '../core/units.ts';
import type { ComputedField, DiagramControls } from '../modules/mru/types.ts';
import { resolveMRU } from '../modules/mru/physics.ts';

interface GenerateOptions {
  moduleId: string;
  rawInput: Record<string, string>;
  x0Unit: DistanceUnit;
  xfUnit: DistanceUnit;
  timeUnit: TimeUnit;
  velUnit: VelocityUnit;
  controls: DiagramControls;
  characterType?: CharacterType;
}

interface PipelineResultExtended {
  type: PipelineResult['type'];
  message?: string;
  detail?: string;
  svg?: string;
  layoutScene?: unknown;
  computedField?: ComputedField;
  resolvedValues?: { x0: number; v: number; t: number; xf: number; dx: number };
}

export class PhysicsDiagramEngine {
  private registry: ModuleRegistry;

  constructor(registry: ModuleRegistry) {
    this.registry = registry;
  }

  generate(opts: GenerateOptions): PipelineResultExtended {
    const { moduleId, rawInput, x0Unit, xfUnit, timeUnit, velUnit, controls, characterType = 'square' } = opts;

    const filledFields = Object.entries(rawInput)
      .filter(([, v]) => v.trim() !== '')
      .map(([k]) => k);
    const filledCount = filledFields.length;

    if (filledCount < 3) {
      return this.renderBase(characterType);
    }

    const module = this.registry.get(moduleId);
    if (!module) {
      return this.error('validation', `Módulo "${moduleId}" no encontrado.`);
    }

    const validation = module.validate(rawInput);
    if (!validation.valid) {
      return {
        type: 'validation',
        message: validation.errors.map((e) => `${e.field}: ${e.message}`).join('; '),
      };
    }

    function parseOptional(key: string): number | undefined {
      const v = rawInput[key]?.trim();
      return v !== '' ? Number(v) : undefined;
    }

    let resolved;
    try {
      resolved = resolveMRU({
        x0: parseOptional('x0'),
        v: parseOptional('v'),
        t: parseOptional('t'),
        xf: parseOptional('xf'),
        x0Unit,
        xfUnit,
        timeUnit,
        velUnit,
      });
    } catch (e) {
      return this.error('physics', (e as Error).message);
    }

    const { computedField, ...physicsResult } = resolved;

    const physicsResultWithUnits = {
      ...physicsResult,
      x0Unit,
      xfUnit,
      timeUnit,
      velUnit,
      computedField,
      controls,
      characterType,
    };

    let diagramModel;
    try {
      diagramModel = module.infer(physicsResultWithUnits);
    } catch (e) {
      return this.error('inference', `Error al inferir el diagrama: ${(e as Error).message}`);
    }

    let sceneGraph;
    try {
      sceneGraph = module.buildScene(diagramModel);
    } catch (e) {
      return this.error('scene', `Error al construir la escena: ${(e as Error).message}`);
    }

    let layoutScene;
    try {
      layoutScene = layout(sceneGraph);
    } catch (e) {
      return this.error('layout', `Error de layout: ${(e as Error).message}`);
    }

    let svg: string;
    try {
      svg = render(layoutScene);
    } catch (e) {
      return this.error('render', `Error al renderizar: ${(e as Error).message}`);
    }

    return {
      type: 'success',
      svg,
      layoutScene,
      computedField,
      resolvedValues: {
        x0: physicsResult.x0,
        v: physicsResult.v,
        t: physicsResult.t,
        xf: physicsResult.xf,
        dx: physicsResult.dx,
      },
    };
  }

  private renderBase(characterType: CharacterType = 'square'): PipelineResultExtended & { type: 'success' } {
    const baseScene: SceneGraph = {
      id: 'scene',
      type: 'scene',
      visible: true,
      children: [
        {
          id: 'axis-x',
          type: 'axis',
          visible: true,
          axisType: 'x',
          orientation: 'right',
          showTicks: true,
          showArrow: false,
        },
        {
          id: 'origin',
          type: 'origin',
          visible: true,
          label: 'x = 0',
        },
        {
          id: 'base-position',
          type: 'position',
          visible: true,
          semanticRole: 'initial',
          physicalValue: 0,
          showMarker: false,
          showLabel: false,
        },
        {
          id: 'character',
          type: 'character',
          visible: true,
          orientation: 'none',
          characterType,
        },
      ],
    };

    const layoutScene = layout(baseScene);
    const svg = render(layoutScene);
    return { type: 'success', svg, layoutScene };
  }

  private error(type: PipelineError['type'], message: string): PipelineError {
    return { type, message };
  }
}
