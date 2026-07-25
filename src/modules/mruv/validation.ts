import type { ValidationResult, ValidationError } from '../../core/types.ts';

export function validateMRUV(input: Record<string, string>): ValidationResult {
  const errors: ValidationError[] = [];
  const requiredFields = ['xi', 'vi', 'a', 't'];

  const labels: Record<string, string> = {
    xi: 'xi',
    vi: 'vi',
    a: 'a',
    t: 't',
  };

  for (const field of requiredFields) {
    const value = input[field]?.trim();
    if (value === undefined || value === '') {
      errors.push({ field, message: `${labels[field]} es requerido.` });
      continue;
    }
    if (isNaN(Number(value))) {
      errors.push({ field, message: `${labels[field]} debe ser un numero.` });
    }
  }

  const tVal = input['t']?.trim();
  if (tVal !== undefined && tVal !== '' && !isNaN(Number(tVal)) && Number(tVal) < 0) {
    errors.push({ field: 't', message: 'El tiempo no puede ser negativo.' });
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
