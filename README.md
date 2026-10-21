# Senpai — The Endless Chase 🏃💨💍

A complete, high-quality 3D anime endless runner game built in Three.js and React.

## Game Concept
A funny romantic chase adventure where **Kiki** desperately wants to marry **Senpai**, but Senpai is sprinting for his bachelor freedom! Instead of monsters, Kiki relentlessly chases Senpai through 4 continuously changing worlds with dynamic AI distance tracking, obstacle gauntlets, and comedic cutscenes.

---

## Features
- **3D Runner Mechanics**: 3 responsive lanes, jumping over low barriers and spikes, sliding beneath overhead beams, dodging monolithic pillars, and collecting coins.
- **Dynamic Kiki Chase AI**: Dynamic distance meter with tension scaling. When Senpai stumbles, Kiki gains ground and heartbeat tension pulses. If Kiki reaches 0m, the hilarious wedding ceremony cutscene triggers!
- **4 Continuously Changing Worlds**:
  1. *Ancient Jungle*: Overgrown stone paths, mossy ruins, jungle palms.
  2. *Blossom Garden*: Cherry blossom trees, falling sakura petals, red torii gates and paper lanterns.
  3. *Sky Ruins*: Ethereal marble bridges, floating sky rocks, cloud layers.
  4. *Moonlit Temple*: Midnight crimson shrine architecture and purple atmospheric glow.
- **4 Game Modes**:
  - **Endless Run**: High-score survival chase.
  - **Story Mode**: 4 chapter story campaign with narrative objectives.
  - **Missions & Bounties**: 10 progressive mission goals with coin rewards.
  - **Daily Challenge**: Date-seeded unique challenge with daily bounties.
- **Character Wardrobe**: Outfits for both Senpai (*Classic Blue, Midnight Shinobi, Varsity Gold Star, Sakura Breeze, Neo Cyberpunk 2099*) and Kiki (*Elegant Rose Dress, Gothic Lolita, Shrine Maiden Miko, Pastel Sweetheart, Eternal Wedding Gown*).
- **Procedural Audio Synthesizer**: 100% self-contained Web Audio API synth soundtrack with dynamic BPM acceleration, jump/slide/coin/collision SFX, sub-bass heartbeat pulse, and Speech Synthesis dialogue.
- **Mobile & Desktop Controls**:
  - Desktop: WASD / Arrow Keys, Space (Jump), S / Down (Slide), Esc (Pause).
  - Mobile: Touch swipe gestures + optional on-screen buttons.

---

## Local Development & Build

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run unit tests
npx tsx --test src/game/logic.test.ts

# Production build
npm run build

# Preview build
npm run preview
```

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and import the GitHub repository.
3. Select **Vite** as the framework preset (Build Command: `npm run build`, Output Directory: `dist`).
4. Click **Deploy**.
