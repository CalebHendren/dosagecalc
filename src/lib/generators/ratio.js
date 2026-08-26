import { pick, randInt, randStep } from '../random.js';
import { fmt } from '../format.js';

// By convention here, medication ratios are grams : mL and are reduced so the
// drug side equals 1 (1 : x). Answers of this shape set `answerPrefix: '1 : '`
// and the student supplies only the value of x.

export function ratioFromMgInMl() {
  const mg = randInt(50, 2000);
  const mL = randStep(50, 1000, 10);
  const g = mg / 1000;
  const answer = mL / g;
  return {
    type: 'ratio-from-mg-in-ml',
    category: 'Ratios',
    prompt: `A solution contains ${mg} mg of drug in ${mL} mL. Express this as a ratio in the form 1 : ?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: '',
    answerPrefix: '1 : ',
    steps: [
      {
        label: 'Ratios are expressed in grams : mL, so convert mg to grams (÷ 1000).',
        expr: `${mg} mg = ${fmt(g, 4)} g  →  ${fmt(g, 4)} g : ${mL} mL`,
      },
      {
        label: `Divide both sides by the drug amount (${fmt(g, 4)}) so the left side becomes 1.`,
        expr: `(${fmt(g, 4)} ÷ ${fmt(g, 4)}) : (${mL} ÷ ${fmt(g, 4)}) = 1 : ${fmt(answer)}`,
      },
    ],
  };
}

export function reduceRatio() {
  const a = randStep(1.5, 9, 0.1);
  const b = randStep(a * 3, a * 30, 0.1);
  const answer = b / a;
  return {
    type: 'reduce-ratio',
    category: 'Ratios',
    prompt: `Reduce the ratio ${fmt(a)} : ${fmt(b)} to the form 1 : ?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: '',
    answerPrefix: '1 : ',
    steps: [
      {
        label: `Divide both sides by the smaller number (${fmt(a)}).`,
        expr: `(${fmt(a)} ÷ ${fmt(a)}) : (${fmt(b)} ÷ ${fmt(a)})`,
      },
      { label: 'Simplify.', expr: `= 1 : ${fmt(answer)}` },
    ],
  };
}

export function pctToRatio() {
  const pct = pick([0.5, 1, 2, 4, 5, 10, 20, 25, 50]);
  const answer = 100 / pct;
  return {
    type: 'pct-to-ratio',
    category: 'Ratios',
    prompt: `Express ${pct}% as a ratio in the form 1 : ?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: '',
    answerPrefix: '1 : ',
    steps: [
      { label: `A percentage is parts per 100, so ${pct}% = ${pct} / 100.`, expr: `${pct} / 100` },
      {
        label: `Divide both parts by ${pct} so the left side becomes 1.`,
        expr: `(${pct} ÷ ${pct}) : (100 ÷ ${pct}) = 1 : ${fmt(answer)}`,
      },
    ],
  };
}

export function mgPerMlFromRatio() {
  let a, b;
  if (Math.random() < 0.5) {
    a = 1;
    b = pick([100, 200, 500, 1000, 2000, 5000, 10000]);
  } else {
    a = randInt(2, 50);
    b = pick([100, 200, 300, 500, 600, 1000]);
  }
  const answer = (a * 1000) / b;
  return {
    type: 'mg-per-ml-from-ratio',
    category: 'Ratios',
    prompt: `How many mg/mL are in a ${a}:${b} solution?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mg/mL',
    steps: [
      { label: 'A ratio a:b means a grams in b mL.', expr: `${a} g in ${b} mL` },
      {
        label: 'Convert the grams to mg (× 1000), then divide by the mL.',
        expr: `(${a} × 1000) mg ÷ ${b} mL = ${fmt(answer)} mg/mL`,
      },
    ],
  };
}

export function mlFromRatioToDeliverMg() {
  const a = pick([1, 1, 2, 3, 5]);
  const b = pick([100, 200, 250, 300, 420, 500, 1000]);
  const target = randInt(1, 50);
  const mgPerMl = (a * 1000) / b;
  const answer = target / mgPerMl;
  return {
    type: 'ml-from-ratio-deliver-mg',
    category: 'Ratios',
    prompt: `How many mL of a ${a}:${b} solution are needed to deliver ${target} mg of drug?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL',
    steps: [
      {
        label: `A ratio a:b means a grams in b mL. Convert the grams to mg (× 1000).`,
        expr: `${a} g = ${a * 1000} mg in ${b} mL`,
      },
      {
        label: 'Find the concentration in mg/mL.',
        expr: `${a * 1000} mg ÷ ${b} mL = ${fmt(mgPerMl, 4)} mg/mL`,
      },
      {
        label: 'Divide the ordered dose by the concentration to get mL.',
        expr: `${target} mg ÷ ${fmt(mgPerMl, 4)} mg/mL = ${fmt(answer)} mL`,
      },
    ],
  };
}
