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
  left: string[];   // รองรับปุ่มหลักและปุ่มสำรอง เช่น ['KeyA', 'ArrowLeft']
  right: string[];  // เช่น ['KeyD', 'ArrowRight']
  up: string[];     // เช่น ['KeyW', 'ArrowUp']
  down: string[];   // เช่น ['KeyS', 'ArrowDown']
  jump: string[];   // เช่น ['Space']
  attack: string[]; // เช่น ['KeyP'] (ต่อย/โจมตี ปล่อย Hit Box)
  skill: string[];  // เช่น ['KeyO'] (สกิลระเบิดพลัง วงแหวนขยาย)
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

// 2. State ของตัวละครในเกมสำหรับเช็คเปลี่ยนแถวอนิเมชัน Sprite Sheet 
// แถว 1: นิ่ง (idle), แถว 2: เดิน (walk), แถว 3: โจมตี (attack), แถว 4: เต้น (dance)
export type CharacterAnimationState = 'idle' | 'walk' | 'attack' | 'dance';

// ==========================================
// ข้อมูลเริ่มต้นสำหรับป้องกันบัคหน้าเว็บว่าง (Fallback Data)
// ==========================================

export const CHARACTERS: Character[] = [
  {
    id: 'red',
    name: 'Red Guardian',
    thaiName: 'ผู้พิทักษ์แดง',
    color: '#ef4444',
    accentColor: '#b91c1c',
    description: 'Fierce warrior with high movement speed.',
    thaiDescription: 'นักรบผู้ดุดัน มาพร้อมความเร็วในการเคลื่อนที่สูง',
    speed: 7,
    jumpForce: 12,
    maxJumps: 2,
    specialAbility: 'Speed Dash',
    thaiSpecialAbility: 'แดชความเร็วสูง'
  },
  {
    id: 'green',
    name: 'Green Forester',
    thaiName: 'พรานไพรเขียว',
    color: '#22c55e',
    accentColor: '#15803d',
    description: 'Agile explorer capable of triple jumps.',
    thaiDescription: 'นักสำรวจผู้คล่องตัว สามารถกระโดดกลางอากาศได้ 3 ครั้ง',
    speed: 5,
    jumpForce: 11,
    maxJumps: 3,
    specialAbility: 'Triple Jump',
    thaiSpecialAbility: 'กระโดดสามชั้น'
  },
  {
    id: 'gold',
    name: 'Gold Monarch',
    thaiName: 'ราชาทองคำ',
    color: '#eab308',
    accentColor: '#a16207',
    description: 'Heavy champion with high jump force.',
    thaiDescription: 'แชมเปี้ยนผู้ทรงพลัง มีแรงกระโดดที่สูงมาก',
    speed: 5,
    jumpForce: 15,
    maxJumps: 2,
    specialAbility: 'Power Smash',
    thaiSpecialAbility: 'ทุบพื้นทรงพลัง'
  }
];

export const DEFAULT_SETTINGS: GameSettings = {
  volume: 70,
  soundEnabled: true,
  musicEnabled: true,
  showOnScreenButtons: false,
  controls: {
    left: ['KeyA', 'ArrowLeft'],
    right: ['KeyD', 'ArrowRight'],
    up: ['KeyW', 'ArrowUp'],
    down: ['KeyS', 'ArrowDown'],
    jump: ['Space'],
    attack: ['KeyP'],
    skill: ['KeyO']
  }
};
