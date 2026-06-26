export type CharacterId = 'red' | 'green' | 'gold';

export interface Character {
  id: CharacterId;
  name: string;
  thaiName: string;
  color: string;
  accentColor: string;
  description: string;
  thaiDescription: string;
  speed: number;
  jumpForce: number;
  maxJumps: number;
  specialAbility: string;
  thaiSpecialAbility: string;
}

export type ControlKey = 'left' | 'right' | 'jump' | 'action';

export interface ControlsConfig {
  left: string;
  right: string;
  jump: string;
  action: string;
}

export interface GameSettings {
  volume: number; // 0 to 100
  soundEnabled: boolean;
  musicEnabled: boolean;
  showOnScreenButtons: boolean; // Virtual controller
  controls: ControlsConfig;
}

export interface HighScore {
  name: string;
  score: number;
  characterId: CharacterId;
  date: string;
}
