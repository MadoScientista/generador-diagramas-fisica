import type { GraphData } from '../../../../modules/mruv/graph-helpers.ts';
import type { AccelerationUnit, TimeUnit } from '../../../../core/units.ts';
import { fromSI } from '../../../../core/units.ts';
import { renderGraph, renderEmptyGraph } from './shared.ts';

export function AccelerationTimeGraph({
  data,
  aUnit,
  timeUnit,
}: {
  data: GraphData | null;
  aUnit: AccelerationUnit;
  timeUnit: TimeUnit;
}) {
  if (!data) return renderEmptyGraph('a', aUnit, timeUnit, 'Aceleración', 'Tiempo');
  const points = data.points.map((p) => ({
    t: fromSI(p.t, timeUnit, 'time'),
    y: fromSI(p.a, aUnit, 'acceleration'),
  }));
  return renderGraph(points, 'a', aUnit, timeUnit, 'Aceleración', 'Tiempo');
}
