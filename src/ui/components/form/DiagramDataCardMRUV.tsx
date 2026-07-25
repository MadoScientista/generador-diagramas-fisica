import { DISTANCE_UNITS, TIME_UNITS, VELOCITY_UNITS, ACCELERATION_UNITS } from '../../../core/units.ts';
import type { DistanceUnit, TimeUnit, VelocityUnit, AccelerationUnit } from '../../../core/units.ts';
import { InputWithUnit } from '../form/InputWithUnit.tsx';

interface DiagramDataCardMRUVProps {
  values: { xi: string; vi: string; a: string; t: string };
  computedValues: { xf: string; vf: string } | null;
  onChange: (field: 'xi' | 'vi' | 'a' | 't', value: string) => void;
  xiUnit: DistanceUnit;
  xfUnit: DistanceUnit;
  viUnit: VelocityUnit;
  vfUnit: VelocityUnit;
  aUnit: AccelerationUnit;
  timeUnit: TimeUnit;
  onXiUnitChange: (unit: DistanceUnit) => void;
  onXfUnitChange: (unit: DistanceUnit) => void;
  onViUnitChange: (unit: VelocityUnit) => void;
  onVfUnitChange: (unit: VelocityUnit) => void;
  onAUnitChange: (unit: AccelerationUnit) => void;
  onTimeUnitChange: (unit: TimeUnit) => void;
}

export function DiagramDataCardMRUV({
  values,
  computedValues,
  onChange,
  xiUnit,
  xfUnit,
  viUnit,
  vfUnit,
  aUnit,
  timeUnit,
  onXiUnitChange,
  onXfUnitChange,
  onViUnitChange,
  onVfUnitChange,
  onAUnitChange,
  onTimeUnitChange,
}: DiagramDataCardMRUVProps) {
  return (
    <div className="card">
      <h3>Datos del diagrama</h3>
      <InputWithUnit
        id="xi"
        label="Posicion inicial"
        value={values.xi}
        placeholder="xi"
        unit={xiUnit}
        units={DISTANCE_UNITS}
        onChange={(val) => onChange('xi', val)}
        onUnitChange={(unit) => onXiUnitChange(unit as DistanceUnit)}
      />
      <InputWithUnit
        id="vi"
        label="Velocidad inicial"
        value={values.vi}
        placeholder="vi"
        unit={viUnit}
        units={VELOCITY_UNITS}
        onChange={(val) => onChange('vi', val)}
        onUnitChange={(unit) => onViUnitChange(unit as VelocityUnit)}
      />
      <InputWithUnit
        id="a"
        label="Aceleracion"
        value={values.a}
        placeholder="a"
        unit={aUnit}
        units={ACCELERATION_UNITS}
        onChange={(val) => onChange('a', val)}
        onUnitChange={(unit) => onAUnitChange(unit as AccelerationUnit)}
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
        id="vf"
        label="Velocidad final"
        value={computedValues?.vf ?? ''}
        placeholder="--"
        unit={vfUnit}
        units={VELOCITY_UNITS}
        disabled
        onChange={() => {}}
        onUnitChange={(unit) => onVfUnitChange(unit as VelocityUnit)}
      />
      <InputWithUnit
        id="xf"
        label="Posicion final"
        value={computedValues?.xf ?? ''}
        placeholder="--"
        unit={xfUnit}
        units={DISTANCE_UNITS}
        disabled
        onChange={() => {}}
        onUnitChange={(unit) => onXfUnitChange(unit as DistanceUnit)}
      />
    </div>
  );
}
