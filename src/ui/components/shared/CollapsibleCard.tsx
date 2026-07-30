import { useState, type ReactNode } from 'react';

interface CollapsibleCardProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  open?: boolean;
  onToggle?: () => void;
}

export function CollapsibleCard({ title, defaultOpen = true, children, open, onToggle }: CollapsibleCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isOpen = open ?? internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

  return (
    <div className={`collapsible-card${isOpen ? ' open' : ''}`}>
      <button
        type="button"
        className="collapsible-card-header"
        onClick={handleToggle}
      >
        <span>{title}</span>
        <span className={`chevron${isOpen ? ' open' : ''}`}>&#9660;</span>
      </button>
      <div className={`collapsible-card-body${isOpen ? ' open' : ''}`}>
        {children}
      </div>
    </div>
  );
}
