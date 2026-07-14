import { useState, useCallback } from 'react';
import type { DiagramControls, ElementControls } from '../modules/mru/types.ts';

const DEFAULT_CONTROLS: DiagramControls = {
  xi: { showLabel: true, showValue: true },
  xf: { showLabel: true, showValue: true },
  v: { showLabel: true, showValue: true, showVector: true },
  t: { showLabel: true, showValue: true },
  dx: { showLabel: true, showValue: true, showVector: true },
};

export function useDiagramControls() {
  const [controls, setControls] = useState<DiagramControls>(DEFAULT_CONTROLS);

  const handleControlChange = useCallback(
    (element: keyof DiagramControls, field: keyof ElementControls, value: boolean) => {
      setControls((prev) => ({
        ...prev,
        [element]: { ...prev[element], [field]: value },
      }));
    },
    []
  );

  const resetControls = useCallback(() => {
    setControls(DEFAULT_CONTROLS);
  }, []);

  return { controls, handleControlChange, resetControls };
}
