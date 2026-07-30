import { identToHTML } from '../../../core/format.ts';
import { UnitSelect } from './UnitSelect.tsx';

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
  const richPlaceholder = identToHTML(placeholder);

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-with-unit">
        <div className="input-wrap">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={richPlaceholder ? '' : placeholder}
            disabled={disabled}
            autoComplete="off"
          />
          {richPlaceholder && !value && (
            <span className="input-rich-placeholder" aria-hidden="true" dangerouslySetInnerHTML={{ __html: richPlaceholder }} />
          )}
        </div>
        <UnitSelect
          value={unit}
          units={units}
          onChange={onUnitChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
