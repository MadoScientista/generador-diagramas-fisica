import type { SceneGraph } from '../../core/types.ts';
import { formatValue } from '../../core/format.ts';
import { toSI } from '../../core/units.ts';
import type { MRUVDiagramModel } from './types.ts';

function labelText(
  prefix: string,
  show: boolean,
  value: number,
  unit: string
): string {
  if (show) {
    return `${prefix} = ${formatValue(value)} ${unit}`;
  }
  return prefix;
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
        showMarker: true,
        showLabel: true,
      },
      {
        id: 'final-position',
        type: 'position',
        visible: true,
        semanticRole: 'final',
        physicalValue: toSI(model.xf, model.xfUnit, 'distance'),
        showMarker: true,
        showLabel: true,
      },
      {
        id: 'character',
        type: 'character',
        visible: true,
        orientation: model.characterOrientation,
        characterType: model.characterType,
      },
      {
        id: 'vi-vector',
        type: 'vector',
        visible: model.showViVector && model.controls.vi.showVector,
        vectorType: 'velocity',
        orientation: model.vi >= 0 ? 'right' : 'left',
        magnitude: model.vi,
        position: 'initial',
      },
      {
        id: 'vf-vector',
        type: 'vector',
        visible: model.showVfVector && model.controls.vf.showVector,
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
        position: 'initial',
      },
      {
        id: 'label-xi',
        type: 'label',
        visible: model.controls.xi.showLabel,
        text: labelText('xi', model.controls.xi.showValue, model.xi, xiUnit),
        semanticRole: 'label-xi',
      },
      {
        id: 'label-xf',
        type: 'label',
        visible: model.controls.xf.showLabel,
        text: labelText('xf', model.controls.xf.showValue, model.xf, xfUnit),
        semanticRole: 'label-xf',
      },
      {
        id: 'label-vi',
        type: 'label',
        visible: model.showViVector && model.controls.vi.showLabel,
        text: labelText('vi', model.controls.vi.showValue, model.vi, viUnit),
        semanticRole: 'label-vi',
      },
      {
        id: 'label-vf',
        type: 'label',
        visible: model.showVfVector && model.controls.vf.showLabel,
        text: labelText('vf', model.controls.vf.showValue, model.vf, vfUnit),
        semanticRole: 'label-vf',
      },
      {
        id: 'label-a',
        type: 'label',
        visible: model.showAccelerationVector && model.controls.a.showLabel,
        text: labelText('a', model.controls.a.showValue, model.a, aUnit),
        semanticRole: 'label-a',
      },
      {
        id: 'label-t',
        type: 'label',
        visible: model.controls.t.showLabel,
        text: labelText('t', model.controls.t.showValue, model.t, timeUnit),
        semanticRole: 'label-t',
      },
      {
        id: 'label-dx',
        type: 'label',
        visible: model.hasDisplacement && model.controls.dx.showLabel,
        text: labelText('\u0394x', model.controls.dx.showValue, model.dx, xiUnit),
        semanticRole: 'label-dx',
      },
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
