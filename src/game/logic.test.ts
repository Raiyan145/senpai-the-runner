import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLaneX,
  getWorldThemeForDistance,
  calculateRunSpeed,
  updateChaseDistance,
  checkObstacleCollision,
  handleCollisionImpact,
  generateDailyChallenge,
  LANE_WIDTH,
  BASE_RUN_SPEED,
} from './logic';

test('getLaneX maps lanes accurately', () => {
  assert.equal(getLaneX(-1), -LANE_WIDTH);
  assert.equal(getLaneX(0), 0);
  assert.equal(getLaneX(1), LANE_WIDTH);
});

test('getWorldThemeForDistance progresses across all 4 worlds', () => {
  assert.equal(getWorldThemeForDistance(100), 'jungle');
  assert.equal(getWorldThemeForDistance(750), 'garden');
  assert.equal(getWorldThemeForDistance(1400), 'sky');
  assert.equal(getWorldThemeForDistance(2000), 'temple');
  // Infinite looping test
  assert.equal(getWorldThemeForDistance(2500), 'jungle');
});

test('calculateRunSpeed scales with distance and speed boost', () => {
  const startSpeed = calculateRunSpeed(0, false);
  assert.equal(startSpeed, BASE_RUN_SPEED);

  const fastSpeed = calculateRunSpeed(1500, false);
  assert.ok(fastSpeed > startSpeed);

  const boostSpeed = calculateRunSpeed(0, true);
  assert.ok(boostSpeed > startSpeed);
});

test('updateChaseDistance calculates tension and catch status', () => {
  // Clean running widens distance
  const clean = updateChaseDistance(15, 1.0, true, false);
  assert.ok(clean.newDistanceBehind > 15);
  assert.equal(clean.isCaught, false);

  // Stumbling/slow running shrinks distance
  const fallingBehind = updateChaseDistance(5, 1.0, false, false);
  assert.ok(fallingBehind.newDistanceBehind < 5);
  assert.ok(fallingBehind.tension > clean.tension);

  // Catch threshold
  const caught = updateChaseDistance(0.5, 1.0, false, false);
  assert.equal(caught.newDistanceBehind, 0);
  assert.equal(caught.isCaught, true);
});

test('checkObstacleCollision respects jump, slide, and lane positions', () => {
  // Low barrier: jump clears it
  const lowBarrier = {
    id: 1,
    type: 'low_barrier' as const,
    lane: 0 as const,
    z: 50,
    width: 2,
    height: 1,
    depth: 1,
    passed: false,
    cleared: false,
  };

  // Jumping runner clears
  const jumpingRunner = {
    lane: 0 as const,
    y: 1.5,
    z: 50,
    isJumping: true,
    isSliding: false,
    invulnerableTimer: 0,
  };
  const clearResult = checkObstacleCollision(jumpingRunner, lowBarrier);
  assert.equal(clearResult.collided, false);
  assert.equal(clearResult.reason, 'jumped_over');

  // Ground runner hits low barrier
  const groundRunner = {
    lane: 0 as const,
    y: 0,
    z: 50,
    isJumping: false,
    isSliding: false,
    invulnerableTimer: 0,
  };
  const hitResult = checkObstacleCollision(groundRunner, lowBarrier);
  assert.equal(hitResult.collided, true);
  assert.equal(hitResult.reason, 'hit');

  // Different lane runner is safe
  const leftLaneRunner = {
    lane: -1 as const,
    y: 0,
    z: 50,
    isJumping: false,
    isSliding: false,
    invulnerableTimer: 0,
  };
  const safeLaneResult = checkObstacleCollision(leftLaneRunner, lowBarrier);
  assert.equal(safeLaneResult.collided, false);
  assert.equal(safeLaneResult.reason, 'different_lane');
});

test('handleCollisionImpact tests shield absorption and stumble penalty', () => {
  // With shield active
  const withShield = handleCollisionImpact(
    { shield: 5.0, magnet: 0, speed: 0, secondChance: false },
    15
  );
  assert.equal(withShield.shieldAbsorbed, true);
  assert.equal(withShield.newPowerUps.shield, 0);
  assert.equal(withShield.newChaseDistance, 15); // Kiki did not catch up!

  // Without shield
  const withoutShield = handleCollisionImpact(
    { shield: 0, magnet: 0, speed: 0, secondChance: false },
    15
  );
  assert.equal(withoutShield.shieldAbsorbed, false);
  assert.ok(withoutShield.newChaseDistance < 15); // Kiki gained ground
});

test('generateDailyChallenge produces deterministic outputs for same date', () => {
  const d1 = generateDailyChallenge('2026-10-21');
  const d2 = generateDailyChallenge('2026-10-21');
  assert.equal(d1.title, d2.title);
  assert.equal(d1.targetMeters, d2.targetMeters);
  assert.equal(d1.targetCoins, d2.targetCoins);
});
