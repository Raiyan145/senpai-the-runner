import { ActivePowerUps, ObstacleData, RunnerState, WorldTheme } from '../types/game';

export const LANE_WIDTH = 2.8;
export const BASE_RUN_SPEED = 16;
export const MAX_RUN_SPEED = 30;
export const SPEED_BOOST_BONUS = 8;
export const DEFAULT_CHASE_DISTANCE = 16;
export const MAX_CHASE_DISTANCE = 25;
export const MIN_CHASE_DISTANCE = 0;
export const STUMBLE_CHASE_PENALTY = 6.5;

export function getLaneX(lane: -1 | 0 | 1): number {
  return lane * LANE_WIDTH;
}

export function getWorldThemeForDistance(distance: number): WorldTheme {
  const loopDist = distance % 2400;
  if (loopDist < 600) return 'jungle';
  if (loopDist < 1200) return 'garden';
  if (loopDist < 1800) return 'sky';
  return 'temple';
}

export function calculateRunSpeed(distance: number, hasSpeedBoost: boolean): number {
  // Smooth logarithmic-style ramp from BASE_RUN_SPEED to MAX_RUN_SPEED
  const speedRamp = Math.min(distance / 2000, 1) * (MAX_RUN_SPEED - BASE_RUN_SPEED);
  const currentBase = BASE_RUN_SPEED + speedRamp;
  return hasSpeedBoost ? currentBase + SPEED_BOOST_BONUS : currentBase;
}

export function updateChaseDistance(
  currentDistanceBehind: number,
  dt: number,
  isCleanRunning: boolean,
  hasSpeedBoost: boolean
): { newDistanceBehind: number; tension: number; isCaught: boolean } {
  let delta = 0;
  if (hasSpeedBoost) {
    delta = 5.0 * dt; // Rapidly pulling away
  } else if (isCleanRunning) {
    delta = 0.8 * dt; // Gradually creating separation
  } else {
    delta = -1.5 * dt; // Kiki closing in
  }

  const newDistanceBehind = Math.max(
    MIN_CHASE_DISTANCE,
    Math.min(MAX_CHASE_DISTANCE, currentDistanceBehind + delta)
  );

  const tension = Math.max(0, Math.min(1, 1 - newDistanceBehind / 18));
  const isCaught = newDistanceBehind <= MIN_CHASE_DISTANCE;

  return { newDistanceBehind, tension, isCaught };
}

export function checkObstacleCollision(
  runner: Pick<RunnerState, 'lane' | 'y' | 'z' | 'isJumping' | 'isSliding' | 'invulnerableTimer'>,
  obstacle: ObstacleData
): { collided: boolean; safe: boolean; reason?: 'hit' | 'jumped_over' | 'slid_under' | 'different_lane' | 'invulnerable' } {
  // If player is invulnerable from a recent hit/shield break, ignore
  if (runner.invulnerableTimer > 0) {
    return { collided: false, safe: true, reason: 'invulnerable' };
  }

  // Z-overlap check
  const zDiff = Math.abs(runner.z - obstacle.z);
  const zThreshold = (obstacle.depth / 2) + 0.55;
  if (zDiff > zThreshold) {
    return { collided: false, safe: true };
  }

  // Lane check
  const inSameLane = obstacle.lane === 99 || obstacle.lane === runner.lane;
  if (!inSameLane) {
    return { collided: false, safe: true, reason: 'different_lane' };
  }

  // Type specific handling
  if (obstacle.type === 'low_barrier' || obstacle.type === 'trap_spikes') {
    // Requires jump!
    if (runner.y > 0.85) {
      return { collided: false, safe: true, reason: 'jumped_over' };
    }
    return { collided: true, safe: false, reason: 'hit' };
  }

  if (obstacle.type === 'high_barrier') {
    // Requires slide!
    if (runner.isSliding) {
      return { collided: false, safe: true, reason: 'slid_under' };
    }
    return { collided: true, safe: false, reason: 'hit' };
  }

  if (obstacle.type === 'gap') {
    // Road hole - requires jump
    if (runner.y > 0.6) {
      return { collided: false, safe: true, reason: 'jumped_over' };
    }
    return { collided: true, safe: false, reason: 'hit' };
  }

  // Monolith or direct lane block
  return { collided: true, safe: false, reason: 'hit' };
}

export function handleCollisionImpact(
  powerUps: ActivePowerUps,
  currentChaseDistance: number
): {
  shieldAbsorbed: boolean;
  newPowerUps: ActivePowerUps;
  newChaseDistance: number;
  newInvulnerableTimer: number;
} {
  if (powerUps.shield > 0) {
    // Shield absorbs the hit!
    return {
      shieldAbsorbed: true,
      newPowerUps: { ...powerUps, shield: 0 },
      newChaseDistance: currentChaseDistance, // no chase penalty
      newInvulnerableTimer: 1.2,
    };
  }

  // No shield: stumble penalty
  const newChaseDistance = Math.max(0, currentChaseDistance - STUMBLE_CHASE_PENALTY);
  return {
    shieldAbsorbed: false,
    newPowerUps: { ...powerUps },
    newChaseDistance,
    newInvulnerableTimer: 1.5,
  };
}

export function generateDailyChallenge(dateString: string) {
  // Deterministic seed from date e.g. "2026-10-21"
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const targets = [
    { targetMeters: 600, targetCoins: 40, title: 'Morning Jog from Kiki', desc: 'Escape 600 meters and collect 40 coins before she catches up!' },
    { targetMeters: 900, targetCoins: 60, title: 'The Great Temple Escape', desc: 'Cover 900 meters across ancient paths and pocket 60 coins.' },
    { targetMeters: 1200, targetCoins: 90, title: 'Marathon of Freedom', desc: 'Reach 1,200 meters in a single continuous dash and gather 90 coins.' },
    { targetMeters: 800, targetCoins: 50, title: 'Sakura Sprint Challenge', desc: 'Speed through 800 meters of cherry blossom petals with 50 coins.' },
  ];

  const selected = targets[positiveHash % targets.length];
  return {
    dateKey: dateString,
    title: selected.title,
    description: selected.desc,
    targetMeters: selected.targetMeters,
    targetCoins: selected.targetCoins,
    rewardCoins: 250,
    completed: false,
  };
}
