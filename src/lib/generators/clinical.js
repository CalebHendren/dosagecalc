import { pick, randStep } from '../random.js';
import { fmt } from '../format.js';

// Classic dosage-calculation problem types beyond the source worksheets, to
// broaden practice: tablets, liquid dose (D/H × Q), IV rate, and drip rate.

export function tabletsDesiredOverHave() {
  const have = pick([5, 10, 12.5, 25, 50, 100, 250, 500]);
  const tabs = pick([0.5, 1, 1.5, 2, 3]);
  const ordered = have * tabs;
  const answer = ordered / have;
  return {
    type: 'tablets-d-over-h',
    category: 'Clinical calculations',
    prompt: `A medication is ordered as ${fmt(ordered)} mg. It is available as ${have} mg tablets. How many tablets should be given?`,
    roundingNote: 'Round to the nearest half tablet.',
    answer,
    precision: 2,
    unit: 'tablet(s)',
    steps: [
      {
        label: 'Use Desired ÷ Have. Divide the ordered dose by the strength of each tablet.',
        expr: `${fmt(ordered)} mg ÷ ${have} mg/tablet = ${fmt(answer)} tablet(s)`,
      },
    ],
  };
}

export function liquidDesiredOverHave() {
  const have = pick([5, 10, 25, 40, 50, 100, 125, 250]);
  const vol = pick([1, 2, 5, 10]);
  const factor = pick([0.5, 1, 1.5, 2, 3]);
  const ordered = have * factor;
  const answer = (ordered / have) * vol;
  return {
    type: 'liquid-d-over-h',
    category: 'Clinical calculations',
    prompt: `A medication is ordered as ${fmt(ordered)} mg. It is available as ${have} mg per ${vol} mL. How many mL should be given?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL',
    steps: [
      {
        label: 'Use (Desired ÷ Have) × Quantity. Divide the ordered dose by the strength, then multiply by the volume it comes in.',
        expr: `(${fmt(ordered)} mg ÷ ${have} mg) × ${vol} mL = ${fmt(answer)} mL`,
      },
    ],
  };
}

export function mlPerHour() {
  const vol = randStep(100, 1000, 50);
  const hr = pick([2, 4, 6, 8, 10, 12, 24]);
  const answer = vol / hr;
  return {
    type: 'ml-per-hour',
    category: 'Clinical calculations',
    prompt: `An IV of ${vol} mL is ordered to infuse over ${hr} hours. What is the flow rate in mL/hr?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL/hr',
    steps: [
      {
        label: 'Divide the total volume by the time in hours.',
        expr: `${vol} mL ÷ ${hr} hr = ${fmt(answer)} mL/hr`,
      },
    ],
  };
}

export function gttPerMin() {
  const vol = randStep(50, 1000, 50);
  const min = pick([30, 60, 120, 240, 360, 480]);
  const gtt = pick([10, 15, 20, 60]);
  const answer = (vol * gtt) / min;
  return {
    type: 'gtt-per-min',
    category: 'Clinical calculations',
    prompt: `Infuse ${vol} mL over ${min} minutes using tubing with a drop factor of ${gtt} gtt/mL. What is the flow rate in gtt/min?`,
    roundingNote: 'Round to the nearest whole drop.',
    answer,
    precision: 0,
    unit: 'gtt/min',
    steps: [
      {
        label: 'Multiply the volume by the drop factor, then divide by the time in minutes.',
        expr: `(${vol} mL × ${gtt} gtt/mL) ÷ ${min} min = ${fmt(answer, 2)} gtt/min`,
      },
      {
        label: 'Round to the nearest whole drop (you cannot give a partial drop).',
        expr: `≈ ${fmt(answer, 0)} gtt/min`,
      },
    ],
  };
}
