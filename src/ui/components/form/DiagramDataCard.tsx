import { DISTANCE_UNITS, TIME_UNITS, VELOCITY_UNITS } from '../../../core/units.ts';
import type { DistanceUnit, TimeUnit, VelocityUnit } from '../../../core/units.ts';
import { InputWithUnit } from './InputWithUnit.tsx';

interface DiagramDataCardProps {
  values: { x0: string; v: string; t: string; xf: string };
  onChange: (field: 'x0' | 'v' | 't' | 'xf', value: string) => void;
  x0Unit: DistanceUnit;
  xfUnit: DistanceUnit;
  timeUnit: TimeUnit;
  velUnit: VelocityUnit;
  onX0UnitChange: (unit: DistanceUnit) => void;
  onXfUnitChange: (unit: DistanceUnit) => void;
  onTimeUnitChange: (unit: TimeUnit) => void;
  onVelUnitChange: (unit: VelocityUnit) => void;
  onCalculate: () => void;
}

export function DiagramDataCard({
  values,
  onChange,
  x0Unit,
  xfUnit,
  timeUnit,
  velUnit,
  onX0UnitChange,
  onXfUnitChange,
  onTimeUnitChange,
  onVelUnitChange,
  onCalculate,
}: DiagramDataCardProps) {
  const filledCount = [values.x0, values.v, values.t, values.xf].filter((s) => s.trim() !== '').length;

  return (
    <div className="card">
      <h3>Datos del diagrama</h3>
      <InputWithUnit
        id="x0"
        label="Posicion inicial"
        value={values.x0}
        placeholder="xi"
        unit={x0Unit}
        units={DISTANCE_UNITS}
        onChange={(val) => onChange('x0', val)}
        onUnitChange={(unit) => onX0UnitChange(unit as DistanceUnit)}
      />
      <InputWithUnit
        id="v"
        label="Velocidad"
        value={values.v}
        placeholder="v"
        unit={velUnit}
        units={VELOCITY_UNITS}
        onChange={(val) => onChange('v', val)}
        onUnitChange={(unit) => onVelUnitChange(unit as VelocityUnit)}
      />
      <InputWithUnit
        id="t"
        label="Tiempo"
        value={values.t}
        placeholder="t"
        unit={timeUnit}
        units={TIME_UNITS}
        onChange={(val) => onChange('t', val)}
        onUnitChange={(unit) => onTimeUnitChange(unit as TimeUnit)}
      />
      <InputWithUnit
        id="xf"
        label="Posicion final"
        value={values.xf}
        placeholder="xf"
        unit={xfUnit}
        units={DISTANCE_UNITS}
        onChange={(val) => onChange('xf', val)}
        onUnitChange={(unit) => onXfUnitChange(unit as DistanceUnit)}
      />
      <button type="button" className="calculate-button" onClick={onCalculate} disabled={filledCount !== 3}>
        Calcular
      </button>
    </div>
  );
}
