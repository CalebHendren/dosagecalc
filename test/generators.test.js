import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GENERATORS, generateProblem, ALL_GENERATOR_IDS } from '../src/lib/generators/index.js';
import { checkAnswer, parseNumericInput } from '../src/lib/checkAnswer.js';
import { round } from '../src/lib/random.js';

const RUNS = 300;

test('every generator produces a well-formed problem', () => {
  for (const gen of GENERATORS) {
    for (let i = 0; i < RUNS; i++) {
      const p = gen.generate();
      assert.ok(typeof p.prompt === 'string' && p.prompt.length > 0, `${gen.id} prompt`);
      assert.ok(Number.isFinite(p.answer), `${gen.id} answer finite (got ${p.answer})`);
      assert.ok(Array.isArray(p.steps) && p.steps.length >= 1, `${gen.id} has steps`);
      for (const s of p.steps) {
        assert.ok(typeof s.label === 'string' && s.label.length > 0, `${gen.id} step label`);
        assert.ok(typeof s.expr === 'string' && s.expr.length > 0, `${gen.id} step expr`);
      }
      assert.ok(typeof p.precision === 'number', `${gen.id} precision`);
    }
  }
});

test('the exact answer is always accepted', () => {
  for (const gen of GENERATORS) {
    for (let i = 0; i < RUNS; i++) {
      const p = gen.generate();
      const res = checkAnswer(p, String(p.answer));
      assert.ok(res.correct, `${gen.id}: exact answer ${p.answer} should be correct`);
    }
  }
});

test('a correctly-rounded answer is accepted', () => {
  for (const gen of GENERATORS) {
    for (let i = 0; i < RUNS; i++) {
      const p = gen.generate();
      const rounded = round(p.answer, p.precision);
      const res = checkAnswer(p, String(rounded));
      assert.ok(res.correct, `${gen.id}: rounded answer ${rounded} should be correct (exact ${p.answer})`);
    }
  }
});

test('a clearly wrong answer is rejected', () => {
  for (const gen of GENERATORS) {
    for (let i = 0; i < RUNS; i++) {
      const p = gen.generate();
      // Move well outside any tolerance band.
      const wrong = Math.abs(p.answer) * 3 + 25;
      const res = checkAnswer(p, String(wrong));
      assert.ok(!res.correct, `${gen.id}: ${wrong} should be wrong (answer ${p.answer})`);
    }
  }
});

test('parseNumericInput handles messy input', () => {
  assert.equal(parseNumericInput('2.31'), 2.31);
  assert.equal(parseNumericInput('2.31 %'), 2.31);
  assert.equal(parseNumericInput(' 3.36 mL'), 3.36);
  assert.equal(parseNumericInput('1:50'), 50);
  assert.equal(parseNumericInput('1 : 666.67'), 666.67);
  assert.equal(parseNumericInput('1,234.5'), 1234.5);
  assert.ok(Number.isNaN(parseNumericInput('')));
  assert.ok(Number.isNaN(parseNumericInput('abc')));
});

test('generateProblem respects enabled ids and avoids immediate repeats', () => {
  const only = ['kg-to-lbs', 'lbs-to-kg'];
  let prev = null;
  for (let i = 0; i < 50; i++) {
    const p = generateProblem(only, prev);
    assert.ok(only.includes(p.type), `type ${p.type} should be enabled`);
    if (prev) assert.notEqual(p.type, prev, 'should not immediately repeat when alternatives exist');
    prev = p.type;
  }
  // Empty enabled set falls back to everything.
  const p = generateProblem([], null);
  assert.ok(ALL_GENERATOR_IDS.includes(p.type));
});

// Spot-check specific formulas against hand calculations.
test('spot-check known formulas', () => {
  // Percentage: 16 g in 600 mL -> 2.6667%
  assert.equal(round((16 / 600) * 100, 4), 2.6667);
  // Ratio: 1500 mg in 1000 mL -> 1 : 666.67
  assert.equal(round(1000 / (1500 / 1000), 2), 666.67);
  // Dilution: 4 mL 5.2% + 5 mL -> 2.31%
  assert.equal(round((4 * 5.2) / 9, 2), 2.31);
  // mL of 1:420 to deliver 8 mg -> 3.36 mL
  assert.equal(round(8 / ((1 * 1000) / 420), 2), 3.36);
  // 2% as ratio -> 1:50
  assert.equal(round(100 / 2, 2), 50);
});
