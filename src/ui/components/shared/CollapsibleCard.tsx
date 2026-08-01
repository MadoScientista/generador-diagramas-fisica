import { useState, useRef, useLayoutEffect, useCallback, type ReactNode } from 'react';

interface CollapsibleCardProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  open?: boolean;
  onToggle?: () => void;
}

export function CollapsibleCard({ title, defaultOpen = true, children, open, onToggle }: CollapsibleCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(() => (open ?? defaultOpen) ? 1000 : 0);
  const prevOpenRef = useRef(open ?? internalOpen);

  const isOpen = open ?? internalOpen;

  const measureHeight = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const h = el.scrollHeight;
    if (h <= 0) return;
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
    const openPad = (0.75 + 1.5) * fs;
    setMaxHeight(h + openPad);
  }, []);

  useLayoutEffect(measureHeight, [children, measureHeight]);
  useLayoutEffect(() => {
    const prev = prevOpenRef.current;
    prevOpenRef.current = isOpen;
    if (isOpen && !prev) measureHeight();
  }, [isOpen, measureHeight]);

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
      <div
        ref={bodyRef}
        className={`collapsible-card-body${isOpen ? ' open' : ''}`}
        style={{ maxHeight: isOpen ? maxHeight : 0 }}
      >
        {children}
      </div>
    </div>
  );
}
