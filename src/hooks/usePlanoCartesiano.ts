import { useState, useCallback, useMemo } from 'react';
import type { PlanoCartesianoSettings, PlanoCartesianoSection } from '../modules/plano-cartesiano/types.ts';
import { PLANO_CARTESIANO_DEFAULTS } from '../modules/plano-cartesiano/defaults.ts';
import { renderPlanoCartesiano } from '../modules/plano-cartesiano/render.ts';

export function usePlanoCartesiano() {
  const [settings, setSettings] = useState<PlanoCartesianoSettings>(PLANO_CARTESIANO_DEFAULTS);

  const update = useCallback((section: PlanoCartesianoSection, patch: Partial<PlanoCartesianoSettings[PlanoCartesianoSection]>) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }));
  }, []);

  const reset = useCallback(() => {
    setSettings(PLANO_CARTESIANO_DEFAULTS);
  }, []);

  const applySettings = useCallback((next: PlanoCartesianoSettings) => {
    setSettings(next);
  }, []);

  const { svg, error } = useMemo(() => renderPlanoCartesiano(settings), [settings]);

  return { settings, update, reset, applySettings, svg, error };
}
