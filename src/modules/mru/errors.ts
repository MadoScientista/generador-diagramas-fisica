export const MruErrorCategory = {
  INVALID_DOMAIN: 'INVALID_DOMAIN',
  PHYSICAL_CONTRADICTION: 'PHYSICAL_CONTRADICTION',
  UNDERDETERMINED: 'UNDERDETERMINED',
  INCONSISTENT_OVERDETERMINED: 'INCONSISTENT_OVERDETERMINED',
  INSUFFICIENT_INPUTS: 'INSUFFICIENT_INPUTS',
} as const;

export type MruErrorCategory = (typeof MruErrorCategory)[keyof typeof MruErrorCategory];

export class MruError extends Error {
  readonly category: MruErrorCategory;
  readonly field?: string;

  constructor(category: MruErrorCategory, message: string, field?: string) {
    super(message);
    this.name = 'MruError';
    this.category = category;
    this.field = field;
  }
}
