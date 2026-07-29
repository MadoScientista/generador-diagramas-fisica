import { displayUnit } from '../../../core/units.ts';

interface InputWithUnitProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  unit: string;
  units: readonly string[];
  onChange: (value: string) => void;
  onUnitChange: (unit: string) => void;
  disabled?: boolean;
}

export function InputWithUnit({
  id,
  label,
  value,
  placeholder,
  unit,
  units,
  onChange,
  onUnitChange,
  disabled,
}: InputWithUnitProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-with-unit">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
        >
          {units.map((u) => (
            <option key={u} value={u}>{displayUnit(u)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
