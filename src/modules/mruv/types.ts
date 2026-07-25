import type { DistanceUnit, TimeUnit, VelocityUnit, AccelerationUnit } from '../../core/units.ts';
import type { CharacterType } from '../../core/types.ts';

export interface ElementControls {
  showLabel: boolean;
  showValue: boolean;
  showVector?: boolean;
}

export type DiagramControls = {
  xi: ElementControls;
  xf: ElementControls;
  vi: ElementControls & { showVector: boolean };
  vf: ElementControls & { showVector: boolean };
  a: ElementControls & { showVector: boolean };
  t: ElementControls;
  dx: ElementControls & { showVector: boolean };
};

export interface MRUVSolveInput {
  xi?: number;
  xf?: number;
  vi?: number;
  vf?: number;
  a?: number;
  t?: number;
  xiUnit: DistanceUnit;
  xfUnit: DistanceUnit;
  viUnit: VelocityUnit;
  vfUnit: VelocityUnit;
  aUnit: AccelerationUnit;
  timeUnit: TimeUnit;
}

export interface MRUVResolvedVars {
  xi: number;
  xf: number;
  vi: number;
  vf: number;
  a: number;
  t: number;
  dx: number;
  computedField: null;
}

export interface MRUVResult {
  xi: number;
  xf: number;
  vi: number;
  vf: number;
  a: number;
  t: number;
  dx: number;
  xiUnit: DistanceUnit;
  xfUnit: DistanceUnit;
  viUnit: VelocityUnit;
  vfUnit: VelocityUnit;
  aUnit: AccelerationUnit;
  timeUnit: TimeUnit;
  computedField: null;
  controls?: DiagramControls;
}

export interface MRUVDiagramModel {
  direction: 'left' | 'right' | 'none';
  crossesOrigin: boolean;
  hasDisplacement: boolean;
  showViVector: boolean;
  showVfVector: boolean;
  showAccelerationVector: boolean;
  characterOrientation: 'left' | 'right' | 'none';
  xi: number;
  xf: number;
  vi: number;
  vf: number;
  a: number;
  t: number;
  dx: number;
  xiUnit: DistanceUnit;
  xfUnit: DistanceUnit;
  viUnit: VelocityUnit;
  vfUnit: VelocityUnit;
  aUnit: AccelerationUnit;
  timeUnit: TimeUnit;
  controls: DiagramControls;
  characterType: CharacterType;
}
