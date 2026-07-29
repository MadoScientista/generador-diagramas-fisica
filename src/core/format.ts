import type { TextSegment } from './types.ts';

function parseUnit(unit: string): TextSegment[] {
  const idx = unit.indexOf('^');
  if (idx === -1) {
    return [{ text: unit, dy: 0, fontSize: 14 }];
  }
  const base = unit.slice(0, idx);
  const exp = unit.slice(idx + 1);
  const result: TextSegment[] = [];
  if (base) {
    result.push({ text: base, dy: 0, fontSize: 14 });
  }
  result.push({ text: exp, dy: -4, fontSize: 10 });
  return result;
}

export function formatValue(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  const str = rounded.toString();
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  const parts = str.split('.');
  if (parts.length === 2) {
    const trimmed = parts[1].replace(/0+$/, '');
    if (trimmed.length === 0) return parts[0];
    return `${parts[0]}.${trimmed}`;
  }
  return str;
}

function parseIdentifier(prefix: string): TextSegment[] {
  switch (prefix) {
    case 'xi':
      return [
        { text: 'x', dy: 0, fontSize: 14 },
        { text: 'i', dy: 4, fontSize: 10 },
      ];
    case 'xf':
      return [
        { text: 'x', dy: 0, fontSize: 14 },
        { text: 'f', dy: 4, fontSize: 10 },
      ];
    case 'vi':
      return [
        { text: 'v', dy: 0, fontSize: 14 },
        { text: 'i', dy: 4, fontSize: 10 },
      ];
    case 'vf':
      return [
        { text: 'v', dy: 0, fontSize: 14 },
        { text: 'f', dy: 4, fontSize: 10 },
      ];
    case 'dx':
      return [{ text: '\u0394x', dy: 0, fontSize: 14 }];
    default:
      return [{ text: prefix, dy: 0, fontSize: 14 }];
  }
}

export interface LabelSegments {
  segments: TextSegment[];
  text: string;
}

export function buildLabelSegments(
  prefix: string,
  showValue: boolean,
  value: number,
  unit: string
): LabelSegments {
  const prefixSegments = parseIdentifier(prefix);

  if (!showValue) {
    const text = prefixSegments.map(s => s.text).join('');
    return { segments: prefixSegments, text };
  }

  const valueStr = formatValue(value);
  const valueSegments: TextSegment[] = [
    { text: ' = ', dy: 0, fontSize: 14 },
    { text: valueStr, dy: 0, fontSize: 14 },
    { text: ' ', dy: 0, fontSize: 14 },
    ...parseUnit(unit),
  ];

  const allSegments = [...prefixSegments, ...valueSegments];
  const text = allSegments.map(s => s.text).join('');
  return { segments: allSegments, text };
}
