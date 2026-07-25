export const MruvErrorCategory = {
  INVALID_DOMAIN: 'INVALID_DOMAIN',
  INSUFFICIENT_INPUTS: 'INSUFFICIENT_INPUTS',
  POSITION_UNANCHORED: 'POSITION_UNANCHORED',
  PHYSICAL_CONTRADICTION: 'PHYSICAL_CONTRADICTION',
  UNDERDETERMINED: 'UNDERDETERMINED',
  NO_REAL_SOLUTION: 'NO_REAL_SOLUTION',
  AMBIGUOUS_SIGN: 'AMBIGUOUS_SIGN',
  INCONSISTENT_OVERDETERMINED: 'INCONSISTENT_OVERDETERMINED',
  EQUAL_VALUES: 'EQUAL_VALUES',
} as const;

export type MruvErrorCategory = (typeof MruvErrorCategory)[keyof typeof MruvErrorCategory];

export class MruvError extends Error {
  readonly category: MruvErrorCategory;
  readonly field?: string;

  constructor(category: MruvErrorCategory, message: string, field?: string) {
    super(message);
    this.name = 'MruvError';
    this.category = category;
    this.field = field;
  }
}
