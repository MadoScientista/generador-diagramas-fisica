import type { LayoutScene, PositionedNode, CharacterType } from './types.ts';
import { getSpriteConfig } from './sprite-registry.ts';

const TICK_SIZE = 8;

function renderAxis(node: PositionedNode): string {
  const { position, boundingBox } = node;
  const x1 = position.x;
  const x2 = position.x + boundingBox.width;
  const y = position.y;

  return `
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="black" stroke-width="2" />`;
}

function renderOrigin(node: PositionedNode): string {
  const { position, boundingBox } = node;
  const x = position.x;
  const y = position.y;
  const tickLen = boundingBox.height || TICK_SIZE;
  const label = node.node.type === 'origin' ? node.node.label : 'x = 0';

  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y + tickLen}" stroke="black" stroke-width="1.5" />
    <text x="${x}" y="${y + tickLen + 20}" font-family="Inter, Roboto, sans-serif" font-size="13" fill="black" text-anchor="middle">${escapeXml(label)}</text>`;
}

function renderPosition(node: PositionedNode): string {
  const { position, boundingBox } = node;
  const x = position.x;
  const y = position.y;
  const tickLen = boundingBox.height || TICK_SIZE;

  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y + tickLen}" stroke="black" stroke-width="1.5" />`;
}

function renderCharacter(node: PositionedNode): string {
  const { position, boundingBox } = node;
  const x = position.x;
  const y = position.y;
  const w = boundingBox.width;
  const h = boundingBox.height;
  const charType: CharacterType =
    node.node.type === 'character' ? (node.node.characterType ?? 'square') : 'square';
  const orientation = node.node.type === 'character' ? node.node.orientation : 'none';
  const flipTransform = orientation === 'left'
    ? ` transform="translate(${2 * x + w}, 0) scale(-1, 1)"`
    : '';

  const sprite = getSpriteConfig(charType);

  if (charType === 'square' || !sprite.path) {
    return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" stroke="black" stroke-width="2" />`;
  }

  return `<image href="${sprite.path}" x="${x}" y="${y}" width="${w}" height="${h}"${flipTransform} />`;
}

function renderVector(node: PositionedNode): string {
  const { position, boundingBox } = node;
  const startX = position.x;
  const startY = position.y;
  const w = boundingBox.width;
  const arrowSize = 10;
  const dir = w >= 0 ? 1 : -1;
  const endX = startX + w;
  const baseX = endX - dir * arrowSize;

  return `
    <line x1="${startX}" y1="${startY}" x2="${baseX}" y2="${startY}" stroke="black" stroke-width="2.5" />
    <polygon points="${endX},${startY} ${endX - dir * arrowSize},${startY - arrowSize / 2} ${endX - dir * arrowSize},${startY + arrowSize / 2}" fill="black" />`;
}

function renderDisplacementArrow(node: PositionedNode): string {
  const { position, boundingBox } = node;
  const x = position.x;
  const y = position.y;
  const w = boundingBox.width;
  const arrowSize = 8;
  const orientation = node.node.type === 'displacement-arrow' ? node.node.orientation : 'right';

  if (orientation === 'right') {
    const endX = x + w;
    const baseX = endX - arrowSize;
    return `
    <line x1="${x}" y1="${y}" x2="${baseX}" y2="${y}" stroke="black" stroke-width="2" />
    <polygon points="${endX},${y} ${endX - arrowSize},${y - arrowSize / 2} ${endX - arrowSize},${y + arrowSize / 2}" fill="black" />`;
  }

  const endX = x;
  const baseX = endX + arrowSize;
  return `
    <line x1="${x + w}" y1="${y}" x2="${baseX}" y2="${y}" stroke="black" stroke-width="2" />
    <polygon points="${endX},${y} ${endX + arrowSize},${y - arrowSize / 2} ${endX + arrowSize},${y + arrowSize / 2}" fill="black" />`;
}

function renderLabel(node: PositionedNode): string {
  const { position, node: originalNode } = node;
  const x = position.x;
  const y = position.y;

  if (originalNode.type !== 'label') return '';

  return `
    <text x="${x}" y="${y}" font-family="Inter, Roboto, sans-serif" font-size="14" fill="black" text-anchor="middle">${escapeXml(originalNode.text)}</text>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function render(layoutScene: LayoutScene): string {
  const { nodes, viewportWidth, viewportHeight } = layoutScene;

  const sorted = [...nodes].sort((a, b) => {
    const order: Record<string, number> = {
      axis: 0,
      positions: 1,
      character: 2,
      vectors: 3,
      displacement: 4,
      labels: 5,
      background: 6,
    };
    return (order[a.layer] ?? 0) - (order[b.layer] ?? 0);
  });

  const elements: string[] = [];

  for (const pn of sorted) {
    if (!pn.visible) continue;

    switch (pn.node.type) {
      case 'axis':
        elements.push(renderAxis(pn));
        break;
      case 'origin':
        elements.push(renderOrigin(pn));
        break;
      case 'position':
        elements.push(renderPosition(pn));
        break;
      case 'character':
        elements.push(renderCharacter(pn));
        break;
      case 'vector':
        elements.push(renderVector(pn));
        break;
      case 'displacement-arrow':
        elements.push(renderDisplacementArrow(pn));
        break;
      case 'label':
        elements.push(renderLabel(pn));
        break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewportWidth} ${viewportHeight}" width="100%" height="100%" role="img" aria-label="Physics diagram">
  <rect width="${viewportWidth}" height="${viewportHeight}" fill="white" />
  ${elements.join('\n')}
</svg>`;
}
