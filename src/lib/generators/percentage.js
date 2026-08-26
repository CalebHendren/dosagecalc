import { pick, randInt, randStep } from '../random.js';
import { fmt } from '../format.js';

// Percentage strength (% w/v) is grams of drug per 100 mL of solution.

export function pctFromGramsInMl() {
  const g = randInt(1, 60);
  const mL = randStep(50, 1000, 10);
  const answer = (g / mL) * 100;
  return {
    type: 'pct-from-grams',
    category: 'Percentage strength',
    prompt: `${g} grams of a drug are dissolved in ${mL} mL of solution. What is the percentage strength (% w/v)?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: '%',
    steps: [
      {
        label: 'Percentage strength (% w/v) is grams of drug per 100 mL.',
        expr: `(${g} g ÷ ${mL} mL) × 100`,
      },
      { label: 'Divide, then multiply by 100.', expr: `= ${fmt(answer)} %` },
    ],
  };
}

export function pctFromMgPerMl() {
  const mg = randInt(1, 200);
  const g = mg / 1000;
  const answer = g * 100; // grams per 1 mL, times 100
  return {
    type: 'pct-from-mg-per-ml',
    category: 'Percentage strength',
    prompt: `A drug is supplied at a strength of ${mg} mg/mL. What is the percentage strength (% w/v)?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: '%',
    steps: [
      { label: 'Convert mg to grams (divide by 1000).', expr: `${mg} mg = ${fmt(g, 4)} g` },
      {
        label: 'Percentage strength is grams per 100 mL.',
        expr: `(${fmt(g, 4)} g ÷ 1 mL) × 100 = ${fmt(answer)} %`,
      },
    ],
  };
}

export function pctFromMgInMl() {
  const mg = randInt(5, 500);
  const mL = randStep(5, 100, 5);
  const g = mg / 1000;
  const answer = (g / mL) * 100;
  return {
    type: 'pct-from-mg-in-ml',
    category: 'Percentage strength',
    prompt: `A solution contains ${mg} mg of drug in ${mL} mL. What is the percentage strength (% w/v)?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: '%',
    steps: [
      { label: 'Convert mg to grams (divide by 1000).', expr: `${mg} mg = ${fmt(g, 4)} g` },
      {
        label: 'Percentage strength is grams per 100 mL.',
        expr: `(${fmt(g, 4)} g ÷ ${mL} mL) × 100 = ${fmt(answer)} %`,
      },
    ],
  };
}

export function pctFromRatio() {
  const a = randInt(1, 10);
  const b = pick([50, 100, 200, 300, 500, 1000, 2000, 3000]);
  const answer = (a / b) * 100;
  return {
    type: 'pct-from-ratio',
    category: 'Percentage strength',
    prompt: `What is the percentage strength (% w/v) of a ${a}:${b} solution?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: '%',
    steps: [
      {
        label: 'A ratio a:b means a grams of drug in b mL of solution.',
        expr: `${a} g in ${b} mL`,
      },
      {
        label: 'Percentage strength is grams per 100 mL.',
        expr: `(${a} g ÷ ${b} mL) × 100 = ${fmt(answer)} %`,
      },
    ],
  };
}

export function mgInPctSolution() {
  const pct = pick([1, 2, 2.5, 5, 10, 20, 25, 50]);
  const mL = randInt(1, 50);
  const grams = (pct / 100) * mL;
  const answer = grams * 1000;
  return {
    type: 'mg-in-pct-solution',
    category: 'Percentage strength',
    prompt: `How many milligrams of drug are in ${mL} mL of a ${pct}% solution?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mg',
    steps: [
      { label: `A ${pct}% solution contains ${pct} g per 100 mL.`, expr: `${pct} g / 100 mL` },
      {
        label: `Find the grams in ${mL} mL.`,
        expr: `(${pct} g ÷ 100 mL) × ${mL} mL = ${fmt(grams, 4)} g`,
      },
      {
        label: 'Convert grams to milligrams (multiply by 1000).',
        expr: `${fmt(grams, 4)} g × 1000 = ${fmt(answer)} mg`,
      },
    ],
  };
}

export function mgInRatioSolution() {
  const a = randInt(1, 10);
  const b = pick([50, 100, 200, 250, 500, 1000]);
  const V = randInt(2, 40);
  const gPerMl = a / b;
  const answer = gPerMl * V * 1000;
  return {
    type: 'mg-in-ratio-solution',
    category: 'Percentage strength',
    prompt: `How many milligrams of drug are in ${V} mL of a ${a}:${b} solution?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mg',
    steps: [
      { label: 'A ratio a:b means a grams in b mL.', expr: `${a} g in ${b} mL` },
      { label: 'Find the concentration in grams per mL.', expr: `${a} g ÷ ${b} mL = ${fmt(gPerMl, 5)} g/mL` },
      {
        label: 'Multiply by the volume, then convert grams to mg (× 1000).',
        expr: `${fmt(gPerMl, 5)} g/mL × ${V} mL × 1000 = ${fmt(answer)} mg`,
      },
    ],
  };
}
