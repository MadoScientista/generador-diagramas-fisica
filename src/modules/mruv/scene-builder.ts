import type { SceneGraph, SemanticRole } from '../../core/types.ts';
import { buildLabelSegments } from '../../core/format.ts';
import { toSI } from '../../core/units.ts';
import type { MRUVDiagramModel } from './types.ts';

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

export function buildMRUVScene(model: MRUVDiagramModel): SceneGraph {
  const xiUnit = model.xiUnit;
  const xfUnit = model.xfUnit;
  const viUnit = model.viUnit;
  const vfUnit = model.vfUnit;
  const aUnit = model.aUnit;
  const timeUnit = model.timeUnit;

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
        physicalValue: toSI(model.xi, model.xiUnit, 'distance'),
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
        id: 'character-xi',
        type: 'character',
        visible: model.showCharacterXi,
        orientation: model.vi >= 0 ? 'right' : 'left',
        characterType: model.characterType,
        position: 'initial',
      },
      {
        id: 'character-xf',
        type: 'character',
        visible: model.showCharacterXf,
        orientation: model.vf >= 0 ? 'right' : 'left',
        characterType: model.characterType,
        position: 'final',
      },
      {
        id: 'vi-vector',
        type: 'vector',
        visible: model.showViVector && model.controls.vi.showVector && model.showCharacterXi,
        vectorType: 'velocity',
        orientation: model.vi >= 0 ? 'right' : 'left',
        magnitude: model.vi,
        position: 'initial',
      },
      {
        id: 'vf-vector',
        type: 'vector',
        visible: model.showVfVector && model.controls.vf.showVector && model.showCharacterXf,
        vectorType: 'velocity',
        orientation: model.vf >= 0 ? 'right' : 'left',
        magnitude: model.vf,
        position: 'final',
      },
      {
        id: 'acceleration-vector',
        type: 'vector',
        visible: model.showAccelerationVector && model.controls.a.showVector,
        vectorType: 'acceleration',
        orientation: model.a >= 0 ? 'right' : 'left',
        magnitude: model.a,
        position: 'center',
      },
      ...mkLabel('label-xi', 'label-xi', model.controls.xi.showLabel, model.xi, xiUnit, model.controls.xi),
      ...mkLabel('label-xf', 'label-xf', model.controls.xf.showLabel, model.xf, xfUnit, model.controls.xf),
      ...mkLabel('label-vi', 'label-vi', model.showViVector && model.controls.vi.showLabel && model.showCharacterXi, model.vi, viUnit, model.controls.vi),
      ...mkLabel('label-vf', 'label-vf', model.showVfVector && model.controls.vf.showLabel && model.showCharacterXf, model.vf, vfUnit, model.controls.vf),
      ...mkLabel('label-a', 'label-a', model.showAccelerationVector && model.controls.a.showLabel, model.a, aUnit, model.controls.a),
      ...mkLabel('label-t', 'label-t', model.controls.t.showLabel, model.t, timeUnit, model.controls.t),
      ...mkLabel('label-dx', 'label-dx', model.hasDisplacement && model.controls.dx.showLabel, model.dx, xiUnit, model.controls.dx),
      {
        id: 'displacement-arrow',
        type: 'displacement-arrow',
        visible: model.hasDisplacement && model.controls.dx.showVector,
        orientation: model.direction,
        physicalXi: toSI(model.xi, model.xiUnit, 'distance'),
        physicalXf: toSI(model.xf, model.xfUnit, 'distance'),
      },
    ],
  };
}
