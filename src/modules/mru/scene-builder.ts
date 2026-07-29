import type { SceneGraph, SemanticRole } from '../../core/types.ts';
import { buildLabelSegments } from '../../core/format.ts';
import { toSI } from '../../core/units.ts';
import type { MRUDiagramModel } from './types.ts';

function mkLabel(
  id: string,
  semanticRole: SemanticRole,
  visible: boolean,
  value: number,
  unit: string,
  control: { showValue: boolean }
) {
  if (!visible) return [];
  const prefix = id.replace('label-', '');
  const { segments, text } = buildLabelSegments(prefix, control.showValue, value, unit);
  return [{ id, type: 'label' as const, visible: true, text, segments, semanticRole }];
}

export function buildMRUScene(model: MRUDiagramModel): SceneGraph {
  const x0Unit = model.x0Unit;
  const xfUnit = model.xfUnit;
  const timeUnit = model.timeUnit;
  const velUnit = model.velUnit;

  return {
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
        id: 'initial-position',
        type: 'position',
        visible: true,
        semanticRole: 'initial',
        physicalValue: toSI(model.x0, model.x0Unit, 'distance'),
        showMarker: model.controls.xi.showLabel,
        showLabel: model.controls.xi.showLabel,
      },
      {
        id: 'final-position',
        type: 'position',
        visible: true,
        semanticRole: 'final',
        physicalValue: toSI(model.xf, model.xfUnit, 'distance'),
        showMarker: model.controls.xf.showLabel,
        showLabel: model.controls.xf.showLabel,
      },
      {
        id: 'character',
        type: 'character',
        visible: true,
        orientation: model.characterOrientation,
        characterType: model.characterType,
      },
      {
        id: 'velocity-vector',
        type: 'vector',
        visible: model.showVelocityVector && model.controls.v.showVector,
        vectorType: 'velocity',
        orientation: model.direction,
        magnitude: model.v,
      },
      ...mkLabel('label-xi', 'label-xi', model.controls.xi.showLabel, model.x0, x0Unit, model.controls.xi),
      ...mkLabel('label-xf', 'label-xf', model.controls.xf.showLabel, model.xf, xfUnit, model.controls.xf),
      ...mkLabel('label-v', 'label-v', model.showVelocityVector && model.controls.v.showLabel, model.v, velUnit, model.controls.v),
      ...mkLabel('label-t', 'label-t', model.controls.t.showLabel, model.t, timeUnit, model.controls.t),
      ...mkLabel('label-dx', 'label-dx', model.hasDisplacement && model.controls.dx.showLabel, model.dx, x0Unit, model.controls.dx),
      {
        id: 'displacement-arrow',
        type: 'displacement-arrow',
        visible: model.hasDisplacement && model.controls.dx.showVector,
        orientation: model.direction,
        physicalXi: toSI(model.x0, model.x0Unit, 'distance'),
        physicalXf: toSI(model.xf, model.xfUnit, 'distance'),
      },
    ],
  };
}
