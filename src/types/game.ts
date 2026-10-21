export type GameMode = 'endless' | 'missions' | 'story' | 'daily';

export type GameState = 'title' | 'cinematic' | 'playing' | 'paused' | 'caught';

export type WorldTheme = 'jungle' | 'garden' | 'sky' | 'temple';

export interface SkinItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unlocked: boolean;
  colors: {
    primary: string; // Hoodie / Dress
    secondary: string; // Pants / Ribbon
    accent: string; // Shoes / Highlights
    hair?: string;
  };
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  type: 'coins' | 'distance' | 'jumps' | 'slides' | 'evade_time' | 'reach_world';
}

export interface StoryChapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  world: WorldTheme;
  requiredDistance: number;
  requiredCoins: number;
  completed: boolean;
  dialogueIntro: { speaker: string; text: string }[];
  dialogueOutro: { speaker: string; text: string }[];
}

export interface DailyChallenge {
  dateKey: string; // YYYY-MM-DD
  title: string;
  description: string;
  targetMeters: number;
  targetCoins: number;
  rewardCoins: number;
  completed: boolean;
}

export interface PlayerStats {
  bestDistance: number;
  totalCoins: number;
  totalRuns: number;
  totalJumps: number;
  totalSlides: number;
  worldsVisited: WorldTheme[];
  equippedSenpaiSkin: string;
  equippedKikiSkin: string;
  unlockedSkins: string[];
  missions: Mission[];
  storyChapter: number;
  dailyChallenge: DailyChallenge;
  settings: {
    bgmVolume: number;
    sfxVolume: number;
    voiceVolume: number;
    showOnScreenControls: boolean;
    graphicsQuality: 'high' | 'medium' | 'low';
  };
}

export interface ActivePowerUps {
  shield: number; // remaining duration seconds (>0 = active)
  magnet: number;
  speed: number;
  secondChance: boolean;
}

export interface RunnerState {
  lane: -1 | 0 | 1;
  targetX: number;
  currentX: number;
  y: number;
  z: number;
  vy: number;
  isJumping: boolean;
  isSliding: boolean;
  jumpTimer: number;
  slideTimer: number;
  stumbleTimer: number;
  invulnerableTimer: number;
  speed: number;
  distance: number;
  coins: number;
  runJumps: number;
  runSlides: number;
  powerUps: ActivePowerUps;
}

export interface ChaseState {
  distanceBehind: number; // Distance in meters behind Senpai (e.g. 15m default, 0m = caught)
  tension: number; // 0 (calm) to 1 (breathing down Senpai's neck)
  isCatching: boolean;
  catchProgress: number; // 0 to 1 during catch sequence
}

export interface ObstacleData {
  id: number;
  type: 'low_barrier' | 'high_barrier' | 'monolith' | 'gap' | 'trap_spikes';
  lane: -1 | 0 | 1 | 99; // 99 means spans all lanes (requires jump/slide)
  z: number;
  width: number;
  height: number;
  depth: number;
  passed: boolean;
  cleared: boolean;
}

export interface CoinData {
  id: number;
  lane: -1 | 0 | 1;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}

export interface PowerUpItemData {
  id: number;
  type: 'shield' | 'magnet' | 'speed' | 'secondChance';
  lane: -1 | 0 | 1;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}
