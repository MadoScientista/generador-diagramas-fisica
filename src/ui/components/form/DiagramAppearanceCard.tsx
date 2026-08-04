import type { CharacterType } from '../../../core/types.ts';

export type { CharacterType };
export type GroundType = 'line' | 'grass' | 'street' | 'beach';

interface DiagramAppearanceProps {
  character: CharacterType;
  onCharacterChange: (type: CharacterType) => void;
  ground?: GroundType;
  onGroundChange?: (type: GroundType) => void;
}

const CHARACTER_OPTIONS: Array<{ value: CharacterType; label: string }> = [
  { value: 'square', label: 'Cuadrado' },
  { value: 'person', label: 'Persona' },
  { value: 'bike', label: 'Bicicleta' },
  { value: 'car', label: 'Automovil' },
];

const GROUND_OPTIONS: Array<{ value: GroundType; label: string }> = [
  { value: 'line', label: 'Línea' },
  { value: 'grass', label: 'Pasto' },
  { value: 'street', label: 'Calle' },
  { value: 'beach', label: 'Playa' },
];

export function DiagramAppearanceCard({
  character,
  onCharacterChange,
  ground,
  onGroundChange,
}: DiagramAppearanceProps) {
  return (
    <div className="appearance-card">
      <div className="appearance-field">
        <label htmlFor="character-select">Movil</label>
        <select
          id="character-select"
          value={character}
          onChange={(e) => onCharacterChange(e.target.value as CharacterType)}
        >
          {CHARACTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {onGroundChange && ground ? (
        <div className="appearance-field">
          <label htmlFor="ground-select">Suelo</label>
          <select
            id="ground-select"
            value={ground}
            onChange={(e) => onGroundChange(e.target.value as GroundType)}
          >
            {GROUND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
