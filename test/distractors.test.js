import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GENERATORS } from '../src/lib/generators/index.js';
import { addDistractors, eligibleDistractors } from '../src/lib/distractors.js';
import { checkAnswer } from '../src/lib/checkAnswer.js';

const RUNS = 200;

const make = (gen) => {
  const p = gen.generate();
  p.type = p.type || gen.id;
  return p;
};

test('every problem type has at least one eligible distractor', () => {
  for (const gen of GENERATORS) {
    assert.ok(eligibleDistractors(make(gen)).length > 0, `${gen.id} has distractors`);
  }
});

test('distractors keep the original prompt and answer', () => {
  for (const gen of GENERATORS) {
    for (let i = 0; i < RUNS; i++) {
      const p = make(gen);
      const d = addDistractors(p);
      let rest = d.prompt;
      for (const sentence of d.distractors) rest = rest.replace(`${sentence} `, '');
      assert.equal(rest, p.prompt, `${gen.id} keeps its prompt`);
      assert.ok(d.distractors.length >= 1 && d.distractors.length <= 3, `${gen.id} count`);
      assert.equal(new Set(d.distractors).size, d.distractors.length, `${gen.id} no repeats`);
      assert.equal(d.answer, p.answer, `${gen.id} answer unchanged`);
      assert.equal(d.steps.length, p.steps.length + 1, `${gen.id} adds an ignore step`);
      assert.ok(checkAnswer(d, String(p.answer)).correct, `${gen.id} still accepts the answer`);
    }
  }
});

test('distractors never duplicate data the problem uses', () => {
  for (const gen of GENERATORS) {
    for (let i = 0; i < RUNS; i++) {
      const d = addDistractors(make(gen), 3).distractors.join(' ');
      if (/weigh|\bkg\b|\blb\b/.test(gen.generate().prompt)) {
        assert.ok(!/weighs/.test(d), `${gen.id} got a weight distractor`);
      }
      if (/tall|cm/.test(gen.generate().prompt)) {
        assert.ok(!/tall/.test(d), `${gen.id} got a height distractor`);
      }
      if (gen.id === 'temperature') assert.ok(!/°[CF]/.test(d), 'temperature got a temperature');
      if (gen.id === 'gtt-per-min') assert.ok(!/gtt/.test(d), 'gtt-per-min got a drop factor');
    }
  }
});
