import type { GraphData } from '../../../../modules/mruv/graph-helpers.ts';
import { renderGraph } from './shared.ts';

export function PositionTimeGraph({ data }: { data: GraphData }) {
  return renderGraph(data.points, (p) => p.x, 'Posición (m)');
}
