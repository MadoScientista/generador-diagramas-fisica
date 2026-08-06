import { useState, useCallback } from 'react';
import { usePlanoCartesiano } from '../hooks/usePlanoCartesiano.ts';
import { CollapsibleCard } from '../ui/components/shared/CollapsibleCard.tsx';
import {
  GeneralSection,
  AxesCardSection,
  AppearanceSection,
} from '../ui/components/form/PlanoCartesianoSettingsSections.tsx';
import { PlanoCartesianoCard } from '../ui/components/diagram/PlanoCartesianoCard.tsx';
import { PLANO_CARTESIANO_PRESETS } from '../modules/plano-cartesiano/presets.ts';

type SettingsCard = 'general' | 'ejes' | 'apariencia';

export function PlanoCartesianoGeneratorPage() {
  const { settings, update, applySettings, svg, error } = usePlanoCartesiano();
  const [openCard, setOpenCard] = useState<SettingsCard | null>('general');

  const handleToggleCard = useCallback((card: SettingsCard) => {
    setOpenCard((prev) => (prev === card ? null : card));
  }, []);

  return (
    <div className="generator-page plano-page">
      <section className="input-section">
        <div className="plano-presets" aria-label="Plantillas rápidas">
          {PLANO_CARTESIANO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="plano-preset-btn"
              onClick={() => applySettings(preset.settings)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <CollapsibleCard title="General" open={openCard === 'general'} onToggle={() => handleToggleCard('general')}>
          <GeneralSection axes={settings.axes} grid={settings.grid} onChange={update} />
        </CollapsibleCard>
        <CollapsibleCard title="Ejes" open={openCard === 'ejes'} onToggle={() => handleToggleCard('ejes')}>
          <AxesCardSection xAxis={settings.xAxis} yAxis={settings.yAxis} onChange={update} />
        </CollapsibleCard>
        <CollapsibleCard
          title="Apariencia"
          open={openCard === 'apariencia'}
          onToggle={() => handleToggleCard('apariencia')}
        >
          <AppearanceSection settings={settings.appearance} onChange={update} />
        </CollapsibleCard>
      </section>
      <section className="diagram-section">
        <PlanoCartesianoCard svg={svg} error={error} />
      </section>
    </div>
  );
}
