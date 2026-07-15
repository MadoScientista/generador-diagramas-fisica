import type { SceneGraph } from '../../core/types.ts';
import { formatValue } from '../../core/format.ts';
import { toSI } from '../../core/units.ts';
import type { MRUDiagramModel } from './types.ts';

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
        id: 'velocity-vector',
        type: 'vector',
        visible: model.showVelocityVector && model.controls.v.showVector,
        vectorType: 'velocity',
        orientation: model.direction,
        magnitude: model.v,
      },
      {
        id: 'label-xi',
        type: 'label',
        visible: model.controls.xi.showLabel,
        text: labelText('xi', model.controls.xi.showValue, model.x0, x0Unit),
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
        id: 'label-v',
        type: 'label',
        visible: model.showVelocityVector && model.controls.v.showLabel,
        text: labelText('v', model.controls.v.showValue, model.v, velUnit),
        semanticRole: 'label-v',
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
        text: labelText('Δx', model.controls.dx.showValue, model.dx, x0Unit),
        semanticRole: 'label-dx',
      },
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
