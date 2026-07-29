import type { GraphData } from '../../../../modules/mruv/graph-helpers.ts';
import { renderGraph } from './shared.ts';

export function AccelerationTimeGraph({ data }: { data: GraphData }) {
  return renderGraph(data.points, (p) => p.a, 'Aceleración (m/s²)');
}
