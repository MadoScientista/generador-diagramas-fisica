export type DistanceUnit = 'm' | 'km';
export type TimeUnit = 's' | 'min' | 'h';
export type VelocityUnit = 'm/s' | 'km/h';
export type AccelerationUnit = 'm/s^2' | 'km/h^2';

export const DISTANCE_UNITS: DistanceUnit[] = ['m', 'km'];
export const TIME_UNITS: TimeUnit[] = ['s', 'min', 'h'];
export const VELOCITY_UNITS: VelocityUnit[] = ['m/s', 'km/h'];
export const ACCELERATION_UNITS: AccelerationUnit[] = ['m/s^2', 'km/h^2'];

const DISTANCE_TO_M: Record<DistanceUnit, number> = { m: 1, km: 1000 };
const TIME_TO_S: Record<TimeUnit, number> = { s: 1, min: 60, h: 3600 };
const VELOCITY_TO_MS: Record<VelocityUnit, number> = { 'm/s': 1, 'km/h': 1 / 3.6 };
const ACCELERATION_TO_MS2: Record<AccelerationUnit, number> = { 'm/s^2': 1, 'km/h^2': 1 / 12960 };

export function toSI(
  value: number,
  unit: DistanceUnit | TimeUnit | VelocityUnit | AccelerationUnit,
  kind: 'distance' | 'time' | 'velocity' | 'acceleration'
): number {
  switch (kind) {
    case 'distance':
      return value * DISTANCE_TO_M[unit as DistanceUnit];
    case 'time':
      return value * TIME_TO_S[unit as TimeUnit];
    case 'velocity':
      return value * VELOCITY_TO_MS[unit as VelocityUnit];
    case 'acceleration':
      return value * ACCELERATION_TO_MS2[unit as AccelerationUnit];
  }
}

export function fromSI(
  value: number,
  unit: DistanceUnit | TimeUnit | VelocityUnit | AccelerationUnit,
  kind: 'distance' | 'time' | 'velocity' | 'acceleration'
): number {
  switch (kind) {
    case 'distance':
      return value / DISTANCE_TO_M[unit as DistanceUnit];
    case 'time':
      return value / TIME_TO_S[unit as TimeUnit];
    case 'velocity':
      return value / VELOCITY_TO_MS[unit as VelocityUnit];
    case 'acceleration':
      return value / ACCELERATION_TO_MS2[unit as AccelerationUnit];
  }
}
