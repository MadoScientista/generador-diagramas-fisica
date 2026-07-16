import type {
  SceneGraphNode,
  SceneGraph,
  LayoutScene,
  PositionedNode,
  Point,
  Layer,
  CharacterType,
} from './types.ts';
import { getSpriteConfig } from './sprite-registry.ts';

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 400;
const MARGIN = 60;
const USABLE_WIDTH = VIEWPORT_WIDTH - 2 * MARGIN;
const AXIS_Y = VIEWPORT_HEIGHT / 2 + 40;
const TICK_SIZE = 8;
const VECTOR_LENGTH = 80;
const POSITION_PADDING = 40;
const MIN_TICK_GAP = 50;
const LABEL_OFFSET_Y = 22;
const LABEL_GAP = 10;
const DISPLACEMENT_Y_OFFSET = 55;

function getLayer(node: SceneGraphNode): Layer {
  switch (node.type) {
    case 'axis':
      return 'axis';
    case 'origin':
    case 'position':
      return 'positions';
    case 'character':
      return 'character';
    case 'vector':
      return 'vectors';
    case 'displacement-arrow':
      return 'displacement';
    case 'label':
      return 'labels';
    default:
      return 'background';
  }
}

function buildPhysScreenMap(nodes: SceneGraphNode[], margin: number, usableWidth: number): Map<number, number> {
  const padMargin = margin + POSITION_PADDING;
  const padWidth = usableWidth - 2 * POSITION_PADDING;

  const set = new Set<number>();
  set.add(0);
  for (const n of nodes) {
    if (n.type === 'position' && n.visible) set.add(n.physicalValue);
  }
  const phys = Array.from(set).sort((a, b) => a - b);
  if (phys.length <= 1) return new Map([[phys[0], padMargin + padWidth / 2]]);

  const physMin = phys[0];
  const physMax = phys[phys.length - 1];
  const physRange = physMax - physMin || 1;
  const totalPx = padWidth;

  const linear = phys.map(v => padMargin + ((v - physMin) / physRange) * totalPx);
  let ok = true;
  for (let i = 1; i < phys.length; i++) {
    if (linear[i] - linear[i - 1] < MIN_TICK_GAP) { ok = false; break; }
  }
  if (ok) return new Map(phys.map((v, i) => [v, linear[i]]));

  const minTotal = (phys.length - 1) * MIN_TICK_GAP;
  const availProp = Math.max(0, totalPx - minTotal);
  const out: number[] = [padMargin];
  for (let i = 1; i < phys.length; i++) {
    const frac = physRange === 0 ? 0 : (phys[i] - phys[i - 1]) / physRange;
    out.push(out[i - 1] + MIN_TICK_GAP + frac * availProp);
  }
  return new Map(phys.map((v, i) => [v, out[i]]));
}

function flatten(root: SceneGraphNode): SceneGraphNode[] {
  const result: SceneGraphNode[] = [];

  function walk(node: SceneGraphNode): void {
    if (node.type === 'scene' || node.type === 'group') {
      if ('children' in node) {
        for (const child of (node as { children: SceneGraphNode[] }).children) {
          walk(child);
        }
      }
    } else {
      result.push(node);
    }
  }

  walk(root);
  return result;
}

function getInitialScreenX(nodes: SceneGraphNode[], map: Map<number, number>): number {
  for (const n of nodes) {
    if (n.type === 'position' && (n as { semanticRole: string }).semanticRole === 'initial' && n.visible) {
      return map.get((n as { physicalValue: number }).physicalValue)!;
    }
  }
  return map.get(0)!;
}

function getFinalScreenX(nodes: SceneGraphNode[], map: Map<number, number>): number {
  for (const n of nodes) {
    if (n.type === 'position' && (n as { semanticRole: string }).semanticRole === 'final' && n.visible) {
      return map.get((n as { physicalValue: number }).physicalValue)!;
    }
  }
  return map.get(0)!;
}

function getCharDimensions(nodes: SceneGraphNode[]): { w: number; h: number } {
  for (const n of nodes) {
    if (n.type === 'character' && n.visible) {
      const ct = (n as { characterType?: CharacterType }).characterType ?? 'square';
      const cfg = getSpriteConfig(ct);
      return { w: cfg.width, h: cfg.height };
    }
  }
  const cfg = getSpriteConfig('square');
  return { w: cfg.width, h: cfg.height };
}

export function layout(sceneGraph: SceneGraph): LayoutScene {
  const nodes = flatten(sceneGraph);
  const posMap = buildPhysScreenMap(nodes, MARGIN, USABLE_WIDTH);
  const positioned: PositionedNode[] = [];
  const { w: charW, h: charH } = getCharDimensions(nodes);

  for (const node of nodes) {
    if (!node.visible) {
      positioned.push({
        id: node.id,
        node,
        position: { x: 0, y: 0 },
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        layer: getLayer(node),
        rotation: 0,
        visible: false,
      });
      continue;
    }

    let pos: Point;
    let w = 0;
    let h = 0;

    switch (node.type) {
      case 'axis':
        pos = { x: MARGIN, y: AXIS_Y };
        w = USABLE_WIDTH;
        break;

      case 'origin': {
        const sx = posMap.get(0)!;
        pos = { x: sx, y: AXIS_Y };
        h = TICK_SIZE;
        break;
      }

      case 'position': {
        const sx = posMap.get(node.physicalValue)!;
        pos = { x: sx, y: AXIS_Y };
        h = TICK_SIZE;
        break;
      }

      case 'character': {
        const cx = getInitialScreenX(nodes, posMap);
        pos = { x: cx - charW / 2, y: AXIS_Y - charH };
        w = charW;
        h = charH;
        break;
      }

      case 'vector': {
        const ix = getInitialScreenX(nodes, posMap);
        const arrowLen = node.orientation === 'left' ? -VECTOR_LENGTH : VECTOR_LENGTH;
        const startX = node.orientation === 'right'
          ? ix + charW / 2
          : ix - charW / 2;
        pos = { x: startX, y: AXIS_Y - charH / 2 };
        w = arrowLen;
        break;
      }

      case 'displacement-arrow': {
        const sx = posMap.get(node.physicalXi)!;
        const ex = posMap.get(node.physicalXf)!;
        const arrowY = AXIS_Y + DISPLACEMENT_Y_OFFSET;
        pos = { x: Math.min(sx, ex), y: arrowY };
        w = Math.abs(ex - sx);
        break;
      }

      case 'label': {
        const ix = getInitialScreenX(nodes, posMap);
        const fx = getFinalScreenX(nodes, posMap);
        let labelX = ix;
        let labelY = AXIS_Y + TICK_SIZE + LABEL_OFFSET_Y;

        if (node.semanticRole === 'label-xi') {
          const originSx = posMap.get(0)!;
          const xiSx = getInitialScreenX(nodes, posMap);
          const screenDist = Math.abs(xiSx - originSx);
          if (screenDist < 50) {
            labelY = AXIS_Y - charH - LABEL_GAP;
          } else {
            labelY = AXIS_Y + TICK_SIZE + LABEL_OFFSET_Y;
          }
        } else if (node.semanticRole === 'label-xf') {
          labelX = fx;
          const originSx = posMap.get(0)!;
          const xfSx = getFinalScreenX(nodes, posMap);
          const xfDist = Math.abs(xfSx - originSx);
          if (xfDist < 50) {
            const xiSx = getInitialScreenX(nodes, posMap);
            const xiDist = Math.abs(xiSx - originSx);
            if (xiDist < 50) {
              labelY = AXIS_Y - charH - LABEL_GAP - 18;
            } else {
              labelY = AXIS_Y - charH - LABEL_GAP;
            }
          } else {
            labelY = AXIS_Y + TICK_SIZE + LABEL_OFFSET_Y;
          }
        } else if (node.semanticRole === 'label-v') {
          const dir = ix <= fx ? 1 : -1;
          const baseOffset = charW / 2 + VECTOR_LENGTH / 2;
          const estHalfWidth = node.text.length * 4;
          const minOffset = charW / 2 + 10 + estHalfWidth;
          const offset = Math.max(baseOffset, minOffset);
          labelX = ix + dir * offset;
          labelY = AXIS_Y - charH / 2 - 14;
        } else if (node.semanticRole === 'label-t') {
          labelX = (ix + fx) / 2;
          labelY = AXIS_Y - charH - LABEL_GAP;
        } else if (node.semanticRole === 'label-dx') {
          labelX = (ix + fx) / 2;
          labelY = AXIS_Y + DISPLACEMENT_Y_OFFSET + LABEL_OFFSET_Y;
        }

        pos = { x: labelX, y: labelY };
        break;
      }

      default:
        pos = { x: 0, y: 0 };
    }

    positioned.push({
      id: node.id,
      node,
      position: pos,
      boundingBox: { x: pos.x, y: pos.y, width: w, height: h },
      layer: getLayer(node),
      rotation: 0,
      visible: node.visible,
    });
  }

  return {
    nodes: positioned,
    viewportWidth: VIEWPORT_WIDTH,
    viewportHeight: VIEWPORT_HEIGHT,
  };
}
