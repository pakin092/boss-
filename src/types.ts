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

// 1. เพิ่มปุ่มควบคุมให้ครบตามเงื่อนไข (WASD, Arrow Keys, P, O)
export type ControlKey = 'left' | 'right' | 'up' | 'down' | 'jump' | 'attack' | 'skill';

export interface ControlsConfig {
  left: string;   // เช่น 'KeyA' หรือ 'ArrowLeft'
  right: string;  // เช่น 'KeyD' หรือ 'ArrowRight'
  up: string;     // เช่น 'KeyW' หรือ 'ArrowUp'
  down: string;   // เช่น 'KeyS' หรือ 'ArrowDown'
  jump: string;   // เช่น 'Space'
  attack: string; // เช่น 'KeyP' (ต่อย/โจมตี ปล่อย Hit Box)
  skill: string;  // เช่น 'KeyO' (สกิลระเบิดพลัง วงแหวนขยาย)
}

export interface GameSettings {
  volume: number; // 0 to 100
  soundEnabled: boolean;
  musicEnabled: boolean;
  showOnScreenButtons: boolean; // Virtual controller สำหรับมือถือ
  controls: ControlsConfig;
}

export interface HighScore {
  name: string;
  score: number;
  characterId: CharacterId;
  date: string;
}

// 2. เพิ่มเติม State ของตัวละครในเกม (มีประโยชน์มากในไฟล์ App.tsx หรือ Player.tsx)
// สำหรับใช้เช็คเพื่อเปลี่ยนแถวอนิเมชัน Sprite Sheet (แถว 1: นิ่ง, แถว 2: เดิน, แถว 3: โจมตี, แถว 4: เต้น)
export type CharacterAnimationState = 'idle' | 'walk' | 'attack' | 'dance';
