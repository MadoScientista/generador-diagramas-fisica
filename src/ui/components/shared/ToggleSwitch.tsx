interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  title?: string;
  onChange: () => void;
}

export function ToggleSwitch({ checked, disabled, label, title, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={title}
      disabled={disabled}
      className={checked ? 'toggle-switch on' : 'toggle-switch'}
      onClick={onChange}
    >
      <span className="toggle-knob" aria-hidden="true" />
    </button>
  );
}
