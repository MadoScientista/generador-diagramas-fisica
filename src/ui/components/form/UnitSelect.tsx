import { useState, useEffect, useCallback, useRef } from 'react';
import { displayUnitHTML } from '../../../core/units.ts';

interface UnitSelectProps {
  value: string;
  units: readonly string[];
  onChange: (unit: string) => void;
  disabled?: boolean;
}

export function UnitSelect({ value, units, onChange, disabled }: UnitSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  return (
    <div className="unit-select" ref={ref}>
      <button
        className="unit-select-trigger"
        onClick={() => { if (!disabled) setOpen((prev) => !prev); }}
        disabled={disabled}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span dangerouslySetInnerHTML={{ __html: displayUnitHTML(value) }} />
      </button>
      {open && (
        <ul className="unit-select-dropdown" role="listbox" tabIndex={-1}>
          {units.map((u) => (
            <li
              key={u}
              role="option"
              aria-selected={u === value}
              className={`unit-select-option${u === value ? ' selected' : ''}`}
              onClick={() => { onChange(u); setOpen(false); }}
              dangerouslySetInnerHTML={{ __html: displayUnitHTML(u) }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
