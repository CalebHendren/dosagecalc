import { test } from 'node:test';
import assert from 'node:assert/strict';
import { XP_RULES, xpForSolve, levelProgress, sheetCostForLevel } from '../src/lib/xp.js';

test('first-try solve with no streak earns the base amount', () => {
  assert.equal(xpForSolve(0, 1), XP_RULES.base);
});

test('failed attempts reduce the XP earned', () => {
  assert.equal(xpForSolve(1, 1), XP_RULES.base - XP_RULES.failPenalty);
  assert.equal(xpForSolve(2, 1), XP_RULES.base - 2 * XP_RULES.failPenalty);
});

test('earned XP never falls below the floor', () => {
  assert.equal(xpForSolve(100, 1), XP_RULES.floor);
});

test('a streak adds a capped bonus', () => {
  // Streak of 3 => 2 prior consecutive solves => 2 * streakBonus.
  assert.equal(xpForSolve(0, 3), XP_RULES.base + 2 * XP_RULES.streakBonus);
  // Very long streaks are capped.
  assert.equal(xpForSolve(0, 1000), XP_RULES.base + XP_RULES.streakBonusCap);
});

test('the equation-sheet cost rises with level', () => {
  assert.equal(sheetCostForLevel(1), XP_RULES.sheetCost);
  assert.equal(sheetCostForLevel(2), XP_RULES.sheetCost * 2);
  assert.equal(sheetCostForLevel(5), XP_RULES.sheetCost * 5);
  // Guards against a non-positive level.
  assert.equal(sheetCostForLevel(0), XP_RULES.sheetCost);
  assert.ok(sheetCostForLevel(3) > sheetCostForLevel(2));
});

test('level progress advances every perLevel XP', () => {
  assert.equal(levelProgress(0).level, 1);
  assert.equal(levelProgress(XP_RULES.perLevel - 1).level, 1);
  assert.equal(levelProgress(XP_RULES.perLevel).level, 2);
  assert.equal(levelProgress(XP_RULES.perLevel * 2).level, 3);
});

test('level progress is clamped for negative XP', () => {
  const p = levelProgress(-50);
  assert.equal(p.level, 1);
  assert.equal(p.into, 0);
});
