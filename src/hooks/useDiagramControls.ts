import { useState, useCallback } from 'react';
import type { ElementControls } from '../modules/mru/types.ts';

export type { ElementControls };

type ControlField = keyof ElementControls | 'showCharacter';

export function useDiagramControls<T extends Record<string, ElementControls & Partial<Record<'showCharacter', boolean>>>>(defaultControls: T) {
  const [controls, setControls] = useState<T>(defaultControls);

  const handleControlChange = useCallback(
    (element: keyof T, field: ControlField, value: boolean) => {
      setControls((prev) => ({
        ...prev,
        [element]: { ...prev[element], [field]: value },
      }));
    },
    []
  );

  const resetControls = useCallback(() => {
    setControls(defaultControls);
  }, [defaultControls]);

  return { controls, handleControlChange, resetControls };
}
