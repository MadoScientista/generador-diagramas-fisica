import type { GraphData } from '../../../../modules/mruv/graph-helpers.ts';
import type { VelocityUnit, TimeUnit } from '../../../../core/units.ts';
import { fromSI } from '../../../../core/units.ts';
import { renderGraph, renderEmptyGraph } from './shared.ts';

export function VelocityTimeGraph({
  data,
  viUnit,
  timeUnit,
}: {
  data: GraphData | null;
  viUnit: VelocityUnit;
  timeUnit: TimeUnit;
}) {
  if (!data) return renderEmptyGraph('v', viUnit, timeUnit, 'Velocidad', 'Tiempo');
  const points = data.points.map((p) => ({
    t: fromSI(p.t, timeUnit, 'time'),
    y: fromSI(p.v, viUnit, 'velocity'),
  }));
  return renderGraph(points, 'v', viUnit, timeUnit, 'Velocidad', 'Tiempo');
}
