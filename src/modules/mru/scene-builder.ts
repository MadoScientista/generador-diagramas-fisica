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
      },
      {
        id: 'velocity-vector',
        type: 'vector',
        visible: model.showVelocityVector,
        vectorType: 'velocity',
        orientation: model.direction,
        magnitude: model.v,
      },
      {
        id: 'label-xi',
        type: 'label',
        visible: true,
        text: labelText('xi', model.showValues.xi, model.x0, x0Unit),
        semanticRole: 'label-xi',
      },
      {
        id: 'label-xf',
        type: 'label',
        visible: true,
        text: labelText('xf', model.showValues.xf, model.xf, xfUnit),
        semanticRole: 'label-xf',
      },
      {
        id: 'label-v',
        type: 'label',
        visible: model.showVelocityVector,
        text: labelText('v', model.showValues.v, model.v, velUnit),
        semanticRole: 'label-v',
      },
      {
        id: 'label-t',
        type: 'label',
        visible: true,
        text: labelText('t', model.showValues.t, model.t, timeUnit),
        semanticRole: 'label-t',
      },
      {
        id: 'label-dx',
        type: 'label',
        visible: model.hasDisplacement,
        text: labelText('Δx', model.showValues.dx, model.dx, x0Unit),
        semanticRole: 'label-dx',
      },
      {
        id: 'displacement-arrow',
        type: 'displacement-arrow',
        visible: model.hasDisplacement,
        orientation: model.direction,
        physicalXi: toSI(model.x0, model.x0Unit, 'distance'),
        physicalXf: toSI(model.xf, model.xfUnit, 'distance'),
      },
    ],
  };
}
