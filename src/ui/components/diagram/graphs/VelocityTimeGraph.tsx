import type { GraphData } from '../../../../modules/mruv/graph-helpers.ts';
import { renderGraph } from './shared.ts';

export function VelocityTimeGraph({ data }: { data: GraphData }) {
  return renderGraph(data.points, (p) => p.v, 'Velocidad (m/s)');
}
