import type { MRUVResult, MRUVDiagramModel, DiagramControls } from './types.ts';
import type { CharacterType } from '../../core/types.ts';

export function inferMRUV(result: MRUVResult & { controls?: DiagramControls; characterType?: CharacterType }): MRUVDiagramModel {
  const controls = result.controls ?? {
    xi: { showLabel: true, showValue: true },
    xf: { showLabel: true, showValue: true },
    vi: { showLabel: true, showValue: true, showVector: true },
    vf: { showLabel: true, showValue: true, showVector: true },
    a: { showLabel: true, showValue: true, showVector: true },
    t: { showLabel: true, showValue: true },
    dx: { showLabel: true, showValue: true, showVector: true },
  };

  let direction: 'left' | 'right' | 'none';
  let characterOrientation: 'left' | 'right' | 'none';

  if (result.vi > 0) {
    direction = 'right';
    characterOrientation = 'right';
  } else if (result.vi < 0) {
    direction = 'left';
    characterOrientation = 'left';
  } else if (result.a > 0) {
    direction = 'right';
    characterOrientation = 'right';
  } else if (result.a < 0) {
    direction = 'left';
    characterOrientation = 'left';
  } else {
    direction = 'none';
    characterOrientation = 'none';
  }

  const showViVector = result.vi !== 0;
  const showVfVector = result.vf !== 0;
  const showAccelerationVector = result.a !== 0;

  const showCharacterXi = controls.xi.showCharacter ?? true;
  const showCharacterXf = controls.xf.showCharacter ?? false;

  const crossesOrigin =
    (result.xi < 0 && result.xf > 0) || (result.xi > 0 && result.xf < 0);

  const hasDisplacement = result.dx !== 0;

  return {
    direction,
    crossesOrigin,
    hasDisplacement,
    showViVector,
    showVfVector,
    showAccelerationVector,
    showCharacterXi,
    showCharacterXf,
    characterOrientation,
    xi: result.xi,
    xf: result.xf,
    vi: result.vi,
    vf: result.vf,
    a: result.a,
    t: result.t,
    dx: result.dx,
    xiUnit: result.xiUnit,
    xfUnit: result.xfUnit,
    viUnit: result.viUnit,
    vfUnit: result.vfUnit,
    aUnit: result.aUnit,
    timeUnit: result.timeUnit,
    controls,
    characterType: result.characterType ?? 'square',
  };
}
