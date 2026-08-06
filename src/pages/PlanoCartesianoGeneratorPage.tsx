import { useState, useCallback } from 'react';
import { usePlanoCartesiano } from '../hooks/usePlanoCartesiano.ts';
import { CollapsibleCard } from '../ui/components/shared/CollapsibleCard.tsx';
import { GeneralSection, AxisSection } from '../ui/components/form/PlanoCartesianoSettingsSections.tsx';
import { PlanoCartesianoCard } from '../ui/components/diagram/PlanoCartesianoCard.tsx';

type SettingsCard = 'general' | 'ejeX' | 'ejeY';

export function PlanoCartesianoGeneratorPage() {
  const { settings, update, svg, error } = usePlanoCartesiano();
  const [openCard, setOpenCard] = useState<SettingsCard | null>('general');

  const handleToggleCard = useCallback((card: SettingsCard) => {
    setOpenCard((prev) => (prev === card ? null : card));
  }, []);

  return (
    <div className="generator-page">
      <section className="input-section">
        <CollapsibleCard title="General" open={openCard === 'general'} onToggle={() => handleToggleCard('general')}>
          <GeneralSection axes={settings.axes} grid={settings.grid} onChange={update} />
        </CollapsibleCard>
        <CollapsibleCard title="Eje X" open={openCard === 'ejeX'} onToggle={() => handleToggleCard('ejeX')}>
          <AxisSection axis="xAxis" settings={settings.xAxis} onChange={update} />
        </CollapsibleCard>
        <CollapsibleCard title="Eje Y" open={openCard === 'ejeY'} onToggle={() => handleToggleCard('ejeY')}>
          <AxisSection axis="yAxis" settings={settings.yAxis} onChange={update} />
        </CollapsibleCard>
      </section>
      <section className="diagram-section">
        <PlanoCartesianoCard svg={svg} error={error} />
      </section>
    </div>
  );
}
