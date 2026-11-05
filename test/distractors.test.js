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
      // Taking out exactly what was inserted gives back the original prompt
      // (up to the first letter of a sentence an opening clause was put on).
      let rest = d.prompt;
      for (const text of d.distractorInsertions) {
        assert.ok(rest.includes(text), `${gen.id} inserted "${text}"`);
        rest = rest.replace(text, '');
      }
      assert.equal(rest.toLowerCase(), p.prompt.toLowerCase(), `${gen.id} keeps its prompt`);
      assert.equal(d.distractorInsertions.length, d.distractors.length, `${gen.id} one insertion each`);
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

test('distractors are not always at the start of the prompt', () => {
  for (const gen of GENERATORS) {
    const p0 = make(gen);
    // A one-sentence prompt with nowhere to weave has only one place to put them.
    if (!/[.?] [A-Z]/.test(p0.prompt) && !/patient|child|solution|tablets|vial|drip|supplied|ordered/i.test(p0.prompt)) continue;
    let elsewhere = 0;
    for (let i = 0; i < RUNS; i++) {
      const p = make(gen);
      const d = addDistractors(p, 1);
      // Opening the prompt as its own sentence is the easy-to-skip spot.
      if (!d.prompt.startsWith(`${d.distractors[0]} `)) elsewhere++;
    }
    assert.ok(elsewhere > RUNS / 4, `${gen.id}: only ${elsewhere}/${RUNS} placed past the opening`);
  }
});

test('woven clauses read as part of the sentence', () => {
  for (const gen of GENERATORS) {
    for (let i = 0; i < RUNS; i++) {
      const d = addDistractors(make(gen), 3);
      assert.ok(!/  |\( |,\.| ,|\.\./.test(d.prompt), `${gen.id} spacing: ${d.prompt}`);
      // A woven clause introduces the patient at most once.
      assert.ok((d.prompt.match(/\b[Ff]or a (patient|child)\b/g) || []).length <= 1, `${gen.id}: ${d.prompt}`);
      // No sentence comes between a sentence and one that refers back to it.
      for (const text of d.distractors) {
        for (const next of ['It ', 'This ', 'That ', 'Express this ']) {
          assert.ok(!d.prompt.includes(`${text} ${next}`), `${gen.id}: ${d.prompt}`);
        }
      }
    }
  }
});
