import { Mission, PlayerStats, SkinItem, StoryChapter } from '../types/game';
import { generateDailyChallenge } from './logic';

export const SENPAI_SKINS: SkinItem[] = [
  {
    id: 'senpai_classic',
    name: 'Classic Blue Hoodie',
    description: 'Senpai’s signature casual blue hoodie, light jeans, and white sneakers.',
    price: 0,
    unlocked: true,
    colors: {
      primary: '#1d4ed8', // Blue hoodie
      secondary: '#60a5fa', // Light blue jeans
      accent: '#f8fafc', // White sneakers
      hair: '#0f172a', // Dark blue/black hair
    },
  },
  {
    id: 'senpai_ninja',
    name: 'Midnight Shinobi',
    description: 'Sleek stealth black hoodie with crimson highlights for evasive sprints.',
    price: 350,
    unlocked: false,
    colors: {
      primary: '#18181b', // Midnight black
      secondary: '#dc2626', // Crimson accents
      accent: '#f43f5e',
      hair: '#09090b',
    },
  },
  {
    id: 'senpai_golden',
    name: 'Varsity Gold Star',
    description: 'High-energy golden athletic hoodie with bright white track pants.',
    price: 600,
    unlocked: false,
    colors: {
      primary: '#eab308', // Gold
      secondary: '#f8fafc', // White pants
      accent: '#ca8a04',
      hair: '#78350f',
    },
  },
  {
    id: 'senpai_sakura',
    name: 'Sakura Breeze',
    description: 'Pastel pink and white spring aesthetic with cherry blossom accents.',
    price: 900,
    unlocked: false,
    colors: {
      primary: '#f472b6', // Soft pink
      secondary: '#fed7aa', // Beige
      accent: '#ec4899',
      hair: '#475569',
    },
  },
  {
    id: 'senpai_cyber',
    name: 'Neo Cyberpunk 2099',
    description: 'High-tech neon cyan and violet holographic runner gear.',
    price: 1500,
    unlocked: false,
    colors: {
      primary: '#06b6d4', // Cyan
      secondary: '#8b5cf6', // Violet
      accent: '#ec4899', // Neon pink
      hair: '#0284c7',
    },
  },
];

export const KIKI_SKINS: SkinItem[] = [
  {
    id: 'kiki_rose',
    name: 'Elegant Rose Dress',
    description: 'Kiki’s beloved romantic pink sundress and scarlet red shoes.',
    price: 0,
    unlocked: true,
    colors: {
      primary: '#f43f5e', // Rose dress
      secondary: '#fb7185', // Frills
      accent: '#b91c1c', // Red shoes
      hair: '#1e1b4b', // Dark hair with blue highlights
    },
  },
  {
    id: 'kiki_gothic',
    name: 'Gothic Lolita Heart',
    description: 'Dramatic black velvet dress with purple ribbons and obsidian pumps.',
    price: 450,
    unlocked: false,
    colors: {
      primary: '#312e81', // Deep purple
      secondary: '#18181b', // Black velvet
      accent: '#a855f7',
      hair: '#0f172a',
    },
  },
  {
    id: 'kiki_miko',
    name: 'Shrine Maiden Miko',
    description: 'Traditional red and white shrine maiden hakama for spiritual devotion.',
    price: 750,
    unlocked: false,
    colors: {
      primary: '#ef4444', // Red hakama
      secondary: '#ffffff', // White top
      accent: '#991b1b',
      hair: '#1e293b',
    },
  },
  {
    id: 'kiki_pastel',
    name: 'Pastel Sweetheart',
    description: 'Lavender and mint floral dress with delicate butterfly clips.',
    price: 1000,
    unlocked: false,
    colors: {
      primary: '#c084fc', // Lavender
      secondary: '#6ee7b7', // Mint
      accent: '#e879f9',
      hair: '#4338ca',
    },
  },
  {
    id: 'kiki_bride',
    name: 'Eternal Wedding Gown',
    description: 'Pure white bridal gown and veil. She is 100% prepared for the altar!',
    price: 2000,
    unlocked: false,
    colors: {
      primary: '#ffffff', // Bridal white
      secondary: '#fef08a', // Gold lace
      accent: '#e11d48', // Scarlet bouquet
      hair: '#172554',
    },
  },
];

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'Chapter 1: The Surprise Proposal',
    subtitle: 'Ancient Jungle Escape',
    description: 'Kiki ambushed Senpai with a marriage contract right in the ancient jungle ruins. Run for your life!',
    world: 'jungle',
    requiredDistance: 450,
    requiredCoins: 30,
    completed: false,
    dialogueIntro: [
      { speaker: 'Kiki', text: 'Senpai! I brought the marriage certificate! Sign right here and let’s be together forever!' },
      { speaker: 'Senpai', text: 'Wait, what?! We’re only in high school! I don’t want to marry you!' },
      { speaker: 'Kiki', text: 'Don’t be shy, Senpai! You cannot run away from destiny!' },
    ],
    dialogueOutro: [
      { speaker: 'Senpai', text: '*Panting* I think I lost her among the jungle pillars... wait, why is there sakura petals here?!' },
      { speaker: 'Kiki', text: 'SENPAIII~! True love crosses all boundaries!' },
    ],
  },
  {
    id: 2,
    title: 'Chapter 2: Petals of Determination',
    subtitle: 'Blossom Garden Dash',
    description: 'Leap over blossom carts and slide under hanging lanterns across the enchanted cherry garden.',
    world: 'garden',
    requiredDistance: 800,
    requiredCoins: 60,
    completed: false,
    dialogueIntro: [
      { speaker: 'Kiki', text: 'Look at the sakura petals falling, Senpai! Isn’t it the perfect romantic setting for our wedding?' },
      { speaker: 'Senpai', text: 'No way! I gotta keep sprinting before she traps me with a bouquet!' },
    ],
    dialogueOutro: [
      { speaker: 'Senpai', text: 'Made it past the garden bridge! The air is getting thinner... are those floating islands?!' },
      { speaker: 'Kiki', text: 'Even in the sky, our vows will echo!' },
    ],
  },
  {
    id: 3,
    title: 'Chapter 3: Flight into the Clouds',
    subtitle: 'Sky Ruins Parkour',
    description: 'Jump across chasm gaps and navigate perilous floating sky platforms high above the world.',
    world: 'sky',
    requiredDistance: 1200,
    requiredCoins: 90,
    completed: false,
    dialogueIntro: [
      { speaker: 'Kiki', text: 'If you leap, I will leap with you! That’s what couples do!' },
      { speaker: 'Senpai', text: 'Watch out for the cliffs! I didn’t sign up for skydiving without a parachute!' },
    ],
    dialogueOutro: [
      { speaker: 'Senpai', text: 'A moonlight glow is illuminating that shrine ahead... almost safe!' },
      { speaker: 'Kiki', text: 'The moon is beautiful tonight, isn’t it, darling?' },
    ],
  },
  {
    id: 4,
    title: 'Chapter 4: Vows Under the Moonlight',
    subtitle: 'Moonlit Temple Climax',
    description: 'Dodge the ultimate obstacle gauntlet across the crimson temple at midnight!',
    world: 'temple',
    requiredDistance: 1600,
    requiredCoins: 120,
    completed: false,
    dialogueIntro: [
      { speaker: 'Kiki', text: 'This shrine has witnessed countless eternal lovers! Today it will bless us too!' },
      { speaker: 'Senpai', text: 'Not on my watch! Bachelor freedom is on the line!' },
    ],
    dialogueOutro: [
      { speaker: 'Senpai', text: 'I escaped! I actually made it through the whole gauntlet!' },
      { speaker: 'Kiki', text: 'Hehe, you ran so fast and looked so cool, Senpai... Tomorrow, I’ll chase you even harder! ♥' },
    ],
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'First Sprint', description: 'Run 300 meters in a single run', target: 300, current: 0, reward: 50, completed: false, claimed: false, type: 'distance' },
  { id: 'm2', title: 'Coin Collector', description: 'Collect 50 coins total', target: 50, current: 0, reward: 60, completed: false, claimed: false, type: 'coins' },
  { id: 'm3', title: 'High Jumper', description: 'Jump over 10 obstacles', target: 10, current: 0, reward: 80, completed: false, claimed: false, type: 'jumps' },
  { id: 'm4', title: 'Slide Master', description: 'Slide under 8 barriers', target: 8, current: 0, reward: 80, completed: false, claimed: false, type: 'slides' },
  { id: 'm5', title: 'Distance Sprinter', description: 'Run 1,000 meters in a single run', target: 1000, current: 0, reward: 150, completed: false, claimed: false, type: 'distance' },
  { id: 'm6', title: 'Treasure Hunter', description: 'Collect 150 coins in a single run', target: 150, current: 0, reward: 200, completed: false, claimed: false, type: 'coins' },
  { id: 'm7', title: 'Blossom Explorer', description: 'Reach Blossom Garden (600m)', target: 600, current: 0, reward: 120, completed: false, claimed: false, type: 'reach_world' },
  { id: 'm8', title: 'Sky Diver', description: 'Reach Sky Ruins (1,200m)', target: 1200, current: 0, reward: 250, completed: false, claimed: false, type: 'reach_world' },
  { id: 'm9', title: 'Heartbeat Survivor', description: 'Survive with Kiki closer than 8m for 20 seconds', target: 20, current: 0, reward: 300, completed: false, claimed: false, type: 'evade_time' },
  { id: 'm10', title: 'Untouchable Bachelor', description: 'Run 800m without any stumbling', target: 800, current: 0, reward: 400, completed: false, claimed: false, type: 'distance' },
];

const STORAGE_KEY = 'senpai_endless_chase_v1';

export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultPlayerStats(): PlayerStats {
  const todayKey = getTodayKey();
  return {
    bestDistance: 0,
    totalCoins: 100, // starting bonus coins!
    totalRuns: 0,
    totalJumps: 0,
    totalSlides: 0,
    worldsVisited: ['jungle'],
    equippedSenpaiSkin: 'senpai_classic',
    equippedKikiSkin: 'kiki_rose',
    unlockedSkins: ['senpai_classic', 'kiki_rose'],
    missions: INITIAL_MISSIONS,
    storyChapter: 1,
    dailyChallenge: generateDailyChallenge(todayKey),
    settings: {
      bgmVolume: 0.7,
      sfxVolume: 0.85,
      voiceVolume: 0.9,
      showOnScreenControls: true,
      graphicsQuality: 'high',
    },
  };
}

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPlayerStats();
    const parsed = JSON.parse(raw);
    const defaults = getDefaultPlayerStats();

    // Check if daily challenge is from a previous day
    const todayKey = getTodayKey();
    if (!parsed.dailyChallenge || parsed.dailyChallenge.dateKey !== todayKey) {
      parsed.dailyChallenge = generateDailyChallenge(todayKey);
    }

    // Merge missing fields safely
    return {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
      missions: defaults.missions.map((m) => {
        const saved = (parsed.missions || []).find((s: Mission) => s.id === m.id);
        return saved ? { ...m, ...saved } : m;
      }),
    };
  } catch (err) {
    console.warn('Failed to load player stats from localStorage, using defaults', err);
    return getDefaultPlayerStats();
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save player stats to localStorage', err);
  }
}
