import type { ValidationResult, ValidationError } from '../../core/types.ts';

export function validateMRUV(input: Record<string, string>): ValidationResult {
  const errors: ValidationError[] = [];
  const allFields = ['xi', 'xf', 'vi', 'vf', 'a', 't'];

  const labels: Record<string, string> = {
    xi: 'xi', xf: 'xf', vi: 'vi', vf: 'vf', a: 'a', t: 't',
  };

  for (const field of allFields) {
    const value = input[field]?.trim();
    if (value === undefined || value === '') continue;
    if (isNaN(Number(value))) {
      errors.push({ field, message: `${labels[field]} debe ser un numero.` });
    }
  }

  const tVal = input['t']?.trim();
  if (tVal !== undefined && tVal !== '' && !isNaN(Number(tVal)) && Number(tVal) <= 0) {
    errors.push({ field: 't', message: 'El tiempo debe ser estrictamente mayor que 0.' });
  }

  const xiVal = input['xi']?.trim();
  const xfVal = input['xf']?.trim();
  if (xiVal !== undefined && xiVal !== '' && xfVal !== undefined && xfVal !== '' && !isNaN(Number(xiVal)) && !isNaN(Number(xfVal)) && Number(xiVal) === Number(xfVal)) {
    errors.push({ field: 'xi', message: 'xi y xf deben ser distintos.' });
  }

  const viVal = input['vi']?.trim();
  const vfVal = input['vf']?.trim();
  if (viVal !== undefined && viVal !== '' && vfVal !== undefined && vfVal !== '' && !isNaN(Number(viVal)) && !isNaN(Number(vfVal)) && Number(viVal) === Number(vfVal)) {
    errors.push({ field: 'vi', message: 'vi y vf deben ser distintos.' });
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
