export interface Car {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  baseMaxHealth: number;
  baseMaxSpeed: number;
  baseHandling: number; // turning speed coefficient
  baseMagnetRadius: number; // coin pickup range
  size: { width: number; height: number };
  unlocked: boolean;
  upgrades: {
    speed: number;   // level 0 - 5
    health: number;  // level 0 - 5
    handling: number;// level 0 - 5
    magnet: number;  // level 0 - 5
  };
}

export interface UpgradeConfig {
  speedCost: number[];
  healthCost: number[];
  handlingCost: number[];
  magnetCost: number[];
}

export type EnemyType = 'policeman' | 'jackal_fast' | 'police_truck';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  size: number;
  color: string;
  isRedFlashing: number; // feedback timer when hit
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  isMega: boolean; // false ($100), true ($300)
  value: number;
  size: number;
}

export interface HealthPack {
  id: string;
  x: number;
  y: number;
  healAmount: number;
  size: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 to 1 decay
  color: string;
  size: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number; // 0 to 1 decay
  size: number;
}

export interface GameStats {
  score: number;
  coinsCollected: number;
  megaCoinsCollected: number;
  earnedInRun: number;
  timeSurvived: number; // seconds
}
