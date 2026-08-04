import { ModuleRegistry, layout, render } from '../core/index.ts';
import type {
  PipelineResult,
  PipelineError,
  SceneGraph,
  CharacterType,
  GroundType,
} from '../core/types.ts';
import type { DistanceUnit, TimeUnit, VelocityUnit, AccelerationUnit } from '../core/units.ts';
import type { DiagramControls } from '../modules/mruv/types.ts';
import { resolveMRUV } from '../modules/mruv/physics.ts';

interface GenerateOptions {
  moduleId: string;
  rawInput: Record<string, string>;
  xiUnit: DistanceUnit;
  xfUnit: DistanceUnit;
  viUnit: VelocityUnit;
  vfUnit: VelocityUnit;
  aUnit: AccelerationUnit;
  timeUnit: TimeUnit;
  controls: DiagramControls;
  characterType?: CharacterType;
  ground?: GroundType;
}

interface PipelineResultExtended {
  type: PipelineResult['type'];
  message?: string;
  detail?: string;
  svg?: string;
  layoutScene?: unknown;
  computedField?: null | string;
  computedFields?: null | (string | null)[];
  resolvedValues?: { xi: number; xf: number; vi: number; vf: number; a: number; t: number; dx: number };
}

const ALL_FIELDS = ['xi', 'xf', 'vi', 'vf', 'a', 't'];

export class PhysicsDiagramEngineMRUV {
  private registry: ModuleRegistry;

  constructor(registry: ModuleRegistry) {
    this.registry = registry;
  }

  generate(opts: GenerateOptions): PipelineResultExtended {
    const { moduleId, rawInput, xiUnit, xfUnit, viUnit, vfUnit, aUnit, timeUnit, controls, characterType = 'square', ground = 'line' } = opts;

    const filledFields = ALL_FIELDS.filter(
      (k) => rawInput[k]?.trim() !== ''
    );

    if (filledFields.length < 4) {
      return this.renderBase(characterType, ground);
    }

    const module = this.registry.get(moduleId);
    if (!module) {
      return this.error('validation', `Modulo "${moduleId}" no encontrado.`);
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
      resolved = resolveMRUV({
        xi: parseOptional('xi'),
        xf: parseOptional('xf'),
        vi: parseOptional('vi'),
        vf: parseOptional('vf'),
        a: parseOptional('a'),
        t: parseOptional('t'),
        xiUnit,
        xfUnit,
        viUnit,
        vfUnit,
        aUnit,
        timeUnit,
      });
    } catch (e) {
      return this.error('physics', (e as Error).message);
    }

    const physicsResultWithUnits = {
      ...resolved,
      xiUnit,
      xfUnit,
      viUnit,
      vfUnit,
      aUnit,
      timeUnit,
      controls,
      characterType,
      ground,
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
      computedField: resolved.computedField,
      computedFields: resolved.computedFields,
      resolvedValues: {
        xi: resolved.xi,
        xf: resolved.xf,
        vi: resolved.vi,
        vf: resolved.vf,
        a: resolved.a,
        t: resolved.t,
        dx: resolved.dx,
      },
    };
  }

  private renderBase(characterType: CharacterType = 'square', ground: GroundType = 'line'): PipelineResultExtended & { type: 'success' } {
    const baseScene: SceneGraph = {
      id: 'scene',
      type: 'scene',
      visible: true,
      children: [
        {
          id: 'ground',
          type: 'ground',
          visible: ground !== 'line',
          groundType: ground,
        },
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
