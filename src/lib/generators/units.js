import { pick, rng } from '../random.js';
import { fmt } from '../format.js';

// Unit-conversion problems common on nursing and allied-health exams: metric
// (mass and volume), household/apothecary volume, grains, and temperature.

// --- Metric mass: mcg ↔ mg ↔ g ↔ kg (each step is a factor of 1,000) ---
export function metricMass() {
  const scale = { mcg: 1e-6, mg: 1e-3, g: 1, kg: 1e3 }; // grams per unit
  const pairs = [
    ['g', 'mg'],
    ['mg', 'mcg'],
    ['kg', 'g'],
    ['mg', 'g'],
    ['mcg', 'mg'],
    ['g', 'kg'],
  ];
  const [from, to] = pick(pairs);
  const factor = scale[from] / scale[to];
  const value =
    factor >= 1
      ? pick([0.25, 0.5, 1, 1.5, 2, 2.5, 5, 7.5, 10, 25, 50, 100])
      : pick([125, 250, 500, 750, 1000, 1500, 2000, 2500, 5000]);
  const answer = value * factor;
  const precision = factor >= 1 ? 2 : 3;
  const factorText = factor >= 1 ? fmt(factor, 0) : String(factor);
  return {
    type: 'metric-mass',
    category: 'Conversions',
    prompt: `Convert ${fmt(value, 3)} ${from} to ${to}.`,
    roundingNote: 'Each metric step is a factor of 1,000.',
    answer,
    precision,
    unit: to,
    steps: [
      {
        label:
          factor >= 1
            ? `Moving to a smaller unit, multiply by ${factorText}.`
            : `Moving to a larger unit, multiply by ${factorText}.`,
        expr: `${fmt(value, 3)} ${from} × ${factorText} = ${fmt(answer, precision)} ${to}`,
      },
    ],
  };
}

// --- Metric volume: mL ↔ L ---
export function metricVolume() {
  if (rng() < 0.5) {
    const liters = pick([0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3]);
    const answer = liters * 1000;
    return {
      type: 'metric-volume',
      category: 'Conversions',
      prompt: `Convert ${fmt(liters, 3)} L to mL.`,
      roundingNote: '1 L = 1,000 mL.',
      answer,
      precision: 2,
      unit: 'mL',
      steps: [
        { label: 'Multiply litres by 1,000.', expr: `${fmt(liters, 3)} L × 1000 = ${fmt(answer)} mL` },
      ],
    };
  }
  const mL = pick([100, 250, 500, 750, 1000, 1500, 2000, 2500]);
  const answer = mL / 1000;
  return {
    type: 'metric-volume',
    category: 'Conversions',
    prompt: `Convert ${mL} mL to L.`,
    roundingNote: '1,000 mL = 1 L.',
    answer,
    precision: 3,
    unit: 'L',
    steps: [{ label: 'Divide millilitres by 1,000.', expr: `${mL} mL ÷ 1000 = ${fmt(answer, 3)} L` }],
  };
}

// --- Household/apothecary volume: tsp, tbsp, oz, cup ↔ mL ---
export function householdVolume() {
  const units = [
    ['teaspoons (tsp)', 'tsp', 5],
    ['tablespoons (tbsp)', 'tbsp', 15],
    ['fluid ounces (oz)', 'oz', 30],
    ['cups', 'cup', 240],
  ];
  const [name, abbr, mlPer] = pick(units);
  if (rng() < 0.5) {
    const value = pick([0.5, 1, 1.5, 2, 3, 4, 5]);
    const answer = value * mlPer;
    return {
      type: 'household-volume',
      category: 'Conversions',
      prompt: `How many mL are in ${fmt(value)} ${abbr}?`,
      roundingNote: `1 ${abbr} = ${mlPer} mL.`,
      answer,
      precision: 2,
      unit: 'mL',
      steps: [
        { label: `Multiply by ${mlPer} mL per ${abbr}.`, expr: `${fmt(value)} ${abbr} × ${mlPer} = ${fmt(answer)} mL` },
      ],
    };
  }
  const count = pick([1, 2, 3, 4, 5, 6]);
  const mL = count * mlPer;
  return {
    type: 'household-volume',
    category: 'Conversions',
    prompt: `How many ${name} are in ${mL} mL?`,
    roundingNote: `1 ${abbr} = ${mlPer} mL.`,
    answer: count,
    precision: 2,
    unit: abbr,
    steps: [{ label: `Divide by ${mlPer} mL per ${abbr}.`, expr: `${mL} mL ÷ ${mlPer} = ${fmt(count)} ${abbr}` }],
  };
}

// --- Grains ↔ milligrams (nursing convention: 1 gr = 60 mg) ---
export function grainsToMg() {
  const MG_PER_GRAIN = 60;
  if (rng() < 0.5) {
    const gr = pick([0.25, 0.5, 1, 1.5, 2, 3, 5]);
    const answer = gr * MG_PER_GRAIN;
    return {
      type: 'grains-to-mg',
      category: 'Conversions',
      prompt: `A drug is ordered as gr ${fmt(gr)}. How many milligrams is that? (1 gr = 60 mg)`,
      roundingNote: 'Use 1 grain = 60 mg.',
      answer,
      precision: 2,
      unit: 'mg',
      steps: [{ label: 'Multiply grains by 60 mg/grain.', expr: `${fmt(gr)} gr × 60 = ${fmt(answer)} mg` }],
    };
  }
  const mg = pick([15, 30, 60, 90, 120, 180, 300]);
  const answer = mg / MG_PER_GRAIN;
  return {
    type: 'grains-to-mg',
    category: 'Conversions',
    prompt: `A drug is supplied as ${mg} mg. How many grains (gr) is that? (1 gr = 60 mg)`,
    roundingNote: 'Use 1 grain = 60 mg.',
    answer,
    precision: 2,
    unit: 'gr',
    steps: [{ label: 'Divide milligrams by 60 mg/grain.', expr: `${mg} mg ÷ 60 = ${fmt(answer)} gr` }],
  };
}

// --- Temperature: °F ↔ °C ---
export function temperature() {
  if (rng() < 0.5) {
    const f = pick([32, 95, 98.6, 99.5, 100.4, 101.2, 102, 103.1, 104]);
    const answer = ((f - 32) * 5) / 9;
    return {
      type: 'temperature',
      category: 'Conversions',
      prompt: `Convert ${fmt(f, 1)} °F to °C.`,
      roundingNote: 'Round to the nearest tenth.',
      answer,
      precision: 1,
      unit: '°C',
      steps: [
        { label: 'Subtract 32, then multiply by 5/9.', expr: `(${fmt(f, 1)} − 32) × 5/9 = ${fmt(answer, 1)} °C` },
      ],
    };
  }
  const c = pick([0, 35, 36.5, 37, 37.8, 38.5, 39, 40, 100]);
  const answer = (c * 9) / 5 + 32;
  return {
    type: 'temperature',
    category: 'Conversions',
    prompt: `Convert ${fmt(c, 1)} °C to °F.`,
    roundingNote: 'Round to the nearest tenth.',
    answer,
    precision: 1,
    unit: '°F',
    steps: [
      { label: 'Multiply by 9/5, then add 32.', expr: `(${fmt(c, 1)} × 9/5) + 32 = ${fmt(answer, 1)} °F` },
    ],
  };
}
