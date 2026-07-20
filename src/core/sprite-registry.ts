import type { CharacterType } from './types.ts';

import personaRaw from '../assets/sprites/persona_caminando_1.svg?raw';
import bikeRaw from '../assets/sprites/bicicleta_1.svg?raw';
import carRaw from '../assets/sprites/automovil_1.svg?raw';

export interface SpriteConfig {
  path: string;
  width: number;
  height: number;
}

function parseSvgDimensions(raw: string): { width: number; height: number } {
  const widthMatch = raw.match(/\bwidth="([^"]+)"/);
  const heightMatch = raw.match(/\bheight="([^"]+)"/);
  if (widthMatch && heightMatch) {
    return { width: parseFloat(widthMatch[1]), height: parseFloat(heightMatch[1]) };
  }
  const viewBoxMatch = raw.match(/\bviewBox="([^"]+)"/);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
    if (parts.length === 4) {
      return { width: parts[2], height: parts[3] };
    }
  }
  return { width: 50, height: 50 };
}

function toDataUri(rawSvg: string): string {
  return 'data:image/svg+xml;base64,' + btoa(rawSvg);
}

const personaDims = parseSvgDimensions(personaRaw);
const bikeDims = parseSvgDimensions(bikeRaw);
const carDims = parseSvgDimensions(carRaw);

export const SPRITE_REGISTRY: Record<CharacterType, SpriteConfig> = {
  square: { path: '', width: 50, height: 50 },
  person: { path: toDataUri(personaRaw), width: personaDims.width, height: personaDims.height },
  bike: { path: toDataUri(bikeRaw), width: bikeDims.width, height: bikeDims.height },
  car: { path: toDataUri(carRaw), width: carDims.width, height: carDims.height },
};

export function getSpriteConfig(type: CharacterType): SpriteConfig {
  return SPRITE_REGISTRY[type];
}
