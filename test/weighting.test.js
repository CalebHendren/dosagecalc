import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  WEIGHT_RULES,
  initWeights,
  updateWeights,
  pickWeighted,
} from '../src/lib/weighting.js';

test('initWeights seeds every id at the baseline', () => {
  const w = initWeights(['a', 'b', 'c']);
  assert.deepEqual(w, { a: 1, b: 1, c: 1 });
});

test('a correct answer lowers that type, a miss raises it', () => {
  const start = initWeights(['a', 'b']);
  const afterCorrect = updateWeights(start, 'a', true);
  assert.ok(afterCorrect.a < 1, 'correct lowers the weight');

  const afterMiss = updateWeights(start, 'a', false);
  assert.ok(afterMiss.a > 1, 'miss raises the weight');
});

test('repeated correct answers on one type let others recover toward baseline', () => {
  let w = initWeights(['a', 'b']);
  // Drive down both, then keep answering only 'a' correctly.
  w = updateWeights(w, 'b', false); // b spikes up
  const bHigh = w.b;
  for (let i = 0; i < 20; i += 1) {
    w = updateWeights(w, 'a', true);
  }
  assert.ok(w.a <= WEIGHT_RULES.min + 1e-9, 'a driven to its floor');
  assert.ok(w.b < bHigh, 'b decays back down toward baseline while untouched');
  assert.ok(Math.abs(w.b - WEIGHT_RULES.base) < Math.abs(bHigh - WEIGHT_RULES.base));
});

test('weights stay within the clamped range', () => {
  let w = initWeights(['a']);
  for (let i = 0; i < 50; i += 1) w = updateWeights(w, 'a', false);
  assert.ok(w.a <= WEIGHT_RULES.max + 1e-9);
  for (let i = 0; i < 50; i += 1) w = updateWeights(w, 'a', true);
  assert.ok(w.a >= WEIGHT_RULES.min - 1e-9);
});

test('a newly enabled id is seeded via ensureIds', () => {
  const w = updateWeights({ a: 1 }, 'a', true, ['a', 'b']);
  assert.ok(Number.isFinite(w.b), 'b was seeded');
});

test('pickWeighted favors the heavier id', () => {
  const ids = ['a', 'b'];
  const weights = { a: 9, b: 1 };
  let aCount = 0;
  // Deterministic sweep of the [0,1) range.
  const N = 1000;
  for (let i = 0; i < N; i += 1) {
    const r = i / N;
    if (pickWeighted(ids, weights, () => r) === 'a') aCount += 1;
  }
  assert.ok(aCount / N > 0.85, `expected ~90% a, got ${aCount / N}`);
});

test('pickWeighted falls back to uniform when all weights are zero', () => {
  const got = pickWeighted(['a', 'b'], { a: 0, b: 0 }, () => 0.5);
  assert.ok(got === 'a' || got === 'b');
});
