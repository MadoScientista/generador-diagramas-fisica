import type { CharacterType } from '../../../core/types.ts';

export type { CharacterType };
export type BackgroundType = 'white' | 'park' | 'city' | 'beach';

interface DiagramAppearanceProps {
  character: CharacterType;
  background: BackgroundType;
  onCharacterChange: (type: CharacterType) => void;
  onBackgroundChange: (type: BackgroundType) => void;
}

const CHARACTER_OPTIONS: Array<{ value: CharacterType; label: string }> = [
  { value: 'square', label: 'Cuadrado' },
  { value: 'person', label: 'Persona' },
  { value: 'bike', label: 'Bicicleta' },
  { value: 'car', label: 'Automovil' },
];

const BACKGROUND_OPTIONS: Array<{ value: BackgroundType; label: string }> = [
  { value: 'white', label: 'Blanco' },
  { value: 'park', label: 'Parque' },
  { value: 'city', label: 'Ciudad' },
  { value: 'beach', label: 'Playa' },
];

export function DiagramAppearanceCard({
  character,
  background,
  onCharacterChange,
  onBackgroundChange,
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
      <div className="appearance-field">
        <label htmlFor="background-select">Fondo</label>
        <select
          id="background-select"
          value={background}
          onChange={(e) => onBackgroundChange(e.target.value as BackgroundType)}
        >
          {BACKGROUND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
