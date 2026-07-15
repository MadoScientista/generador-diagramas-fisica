import type { DistanceUnit, TimeUnit, VelocityUnit } from '../../core/units.ts';
import type { CharacterType } from '../../core/types.ts';

export type ComputedField = 'x0' | 'xf' | 'v' | 't' | null;

export interface ElementControls {
  showLabel: boolean;
  showValue: boolean;
  showVector?: boolean;
}

export type DiagramControls = {
  xi: ElementControls;
  xf: ElementControls;
  v: ElementControls & { showVector: boolean };
  t: ElementControls;
  dx: ElementControls & { showVector: boolean };
};

export interface MRUSolveInput {
  x0?: number;
  v?: number;
  t?: number;
  xf?: number;
  x0Unit: DistanceUnit;
  xfUnit: DistanceUnit;
  timeUnit: TimeUnit;
  velUnit: VelocityUnit;
}

export interface MRUResolvedVars {
  x0: number;
  v: number;
  t: number;
  xf: number;
  dx: number;
  computedField: ComputedField;
}

export interface MRUResult {
  x0: number;
  v: number;
  t: number;
  xf: number;
  dx: number;
  x0Unit: DistanceUnit;
  xfUnit: DistanceUnit;
  timeUnit: TimeUnit;
  velUnit: VelocityUnit;
  computedField: ComputedField;
  controls?: DiagramControls;
}

export interface MRUDiagramModel {
  direction: 'left' | 'right' | 'none';
  crossesOrigin: boolean;
  hasDisplacement: boolean;
  showVelocityVector: boolean;
  characterOrientation: 'left' | 'right' | 'none';
  x0: number;
  xf: number;
  v: number;
  t: number;
  dx: number;
  x0Unit: DistanceUnit;
  xfUnit: DistanceUnit;
  timeUnit: TimeUnit;
  velUnit: VelocityUnit;
  controls: DiagramControls;
  characterType: CharacterType;
}

