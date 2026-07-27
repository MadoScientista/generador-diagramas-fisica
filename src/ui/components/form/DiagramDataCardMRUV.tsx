import { DISTANCE_UNITS, TIME_UNITS, VELOCITY_UNITS, ACCELERATION_UNITS } from '../../../core/units.ts';
import type { DistanceUnit, TimeUnit, VelocityUnit, AccelerationUnit } from '../../../core/units.ts';
import { InputWithUnit } from '../form/InputWithUnit.tsx';

interface DiagramDataCardMRUVProps {
  values: { xi: string; xf: string; vi: string; vf: string; a: string; t: string };
  computedValues: Record<string, string> | null;
  onChange: (field: 'xi' | 'xf' | 'vi' | 'vf' | 'a' | 't', value: string) => void;
  xiUnit: DistanceUnit;
  viUnit: VelocityUnit;
  aUnit: AccelerationUnit;
  timeUnit: TimeUnit;
  onXiUnitChange: (unit: DistanceUnit) => void;
  onViUnitChange: (unit: VelocityUnit) => void;
  onAUnitChange: (unit: AccelerationUnit) => void;
  onTimeUnitChange: (unit: TimeUnit) => void;
  onClear: () => void;
}

export function DiagramDataCardMRUV({
  values,
  computedValues,
  onChange,
  xiUnit,
  viUnit,
  aUnit,
  timeUnit,
  onXiUnitChange,
  onViUnitChange,
  onAUnitChange,
  onTimeUnitChange,
  onClear,
}: DiagramDataCardMRUVProps) {
  return (
    <div className="card">
      <h3>Datos del diagrama</h3>
      <InputWithUnit
        id="xi"
        label="Posicion inicial"
        value={computedValues?.xi ?? values.xi}
        placeholder="xi"
        unit={xiUnit}
        units={DISTANCE_UNITS}
        onChange={(val) => onChange('xi', val)}
        onUnitChange={(unit) => onXiUnitChange(unit as DistanceUnit)}
      />
      {/* TODO: re-habilitar cuando se vuelvan a mostrar xf
      <InputWithUnit
        id="xf"
        label="Posicion final"
        value={computedValues?.xf ?? values.xf}
        placeholder="xf"
        unit={xfUnit}
        units={DISTANCE_UNITS}
        onChange={(val) => onChange('xf', val)}
        onUnitChange={(unit) => onXfUnitChange(unit as DistanceUnit)}
      />
      */}
      <InputWithUnit
        id="vi"
        label="Velocidad inicial"
        value={computedValues?.vi ?? values.vi}
        placeholder="vi"
        unit={viUnit}
        units={VELOCITY_UNITS}
        onChange={(val) => onChange('vi', val)}
        onUnitChange={(unit) => onViUnitChange(unit as VelocityUnit)}
      />
      {/* TODO: re-habilitar cuando se vuelvan a mostrar vf
      <InputWithUnit
        id="vf"
        label="Velocidad final"
        value={computedValues?.vf ?? values.vf}
        placeholder="vf"
        unit={vfUnit}
        units={VELOCITY_UNITS}
        onChange={(val) => onChange('vf', val)}
        onUnitChange={(unit) => onVfUnitChange(unit as VelocityUnit)}
      />
      */}
      <InputWithUnit
        id="a"
        label="Aceleracion"
        value={computedValues?.a ?? values.a}
        placeholder="a"
        unit={aUnit}
        units={ACCELERATION_UNITS}
        onChange={(val) => onChange('a', val)}
        onUnitChange={(unit) => onAUnitChange(unit as AccelerationUnit)}
      />
      <InputWithUnit
        id="t"
        label="Tiempo"
        value={computedValues?.t ?? values.t}
        placeholder="t"
        unit={timeUnit}
        units={TIME_UNITS}
        onChange={(val) => onChange('t', val)}
        onUnitChange={(unit) => onTimeUnitChange(unit as TimeUnit)}
      />
      <button type="button" className="clear-button" onClick={onClear}>
        Borrar datos
      </button>
    </div>
  );
}
