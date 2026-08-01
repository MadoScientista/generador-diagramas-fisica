import type { GraphData } from '../../../../modules/mruv/graph-helpers.ts';
import type { DistanceUnit, TimeUnit } from '../../../../core/units.ts';
import { fromSI } from '../../../../core/units.ts';
import { renderGraph, renderEmptyGraph } from './shared.ts';

export function PositionTimeGraph({
  data,
  xiUnit,
  timeUnit,
}: {
  data: GraphData | null;
  xiUnit: DistanceUnit;
  timeUnit: TimeUnit;
}) {
  if (!data) return renderEmptyGraph('x', xiUnit, timeUnit, 'Posición', 'Tiempo');
  const points = data.points.map((p) => ({
    t: fromSI(p.t, timeUnit, 'time'),
    y: fromSI(p.x, xiUnit, 'distance'),
  }));
  return renderGraph(points, 'x', xiUnit, timeUnit, 'Posición', 'Tiempo');
}
