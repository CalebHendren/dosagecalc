import { pick, randInt, randStep, rng } from './random.js';

// Distractor mode: adds realistic but irrelevant details to a problem's prompt,
// the way exam questions do, so the learner has to pick out only the numbers
// the calculation needs. Distractors never change the answer.
//
// Each distractor has a `make(problem)` that returns one sentence, and may
// restrict where it appears:
//   - `when(problem)`: only for problems this predicate accepts
//   - `only`:          only for these problem types
//   - `avoid`:         never for these types (they use that kind of value, so
//                      the "distractor" would conflict with or duplicate real data)
// Type-specific (`only`) distractors are placed just before the question;
// the rest open the prompt.

const PATIENT_CATEGORIES = [
  'Conversions',
  'Concentration & dosing',
  'Clinical calculations',
  'Advanced IV & critical care',
  'Pediatric & BSA',
  'Reconstitution',
];

const COMPOUNDING_CATEGORIES = [
  'Percentage strength',
  'Ratios',
  'Dilution (V₁C₁ = V₂C₂)',
];

// Problems about a patient (days supply is a prescription for one).
const isPatient = (p) => PATIENT_CATEGORIES.includes(p.category) || p.type === 'days-supply';
// Problems about preparing a product (alligation is a compounding mix).
const isCompounding = (p) => COMPOUNDING_CATEGORIES.includes(p.category) || p.type === 'alligation';
// Label details (lot, cost, storage) make sense anywhere but bare unit conversions.
const hasProduct = (p) => p.category !== 'Conversions';

// Types whose prompts already use the patient's weight.
const USES_WEIGHT = [
  'kg-to-lbs',
  'lbs-to-kg',
  'metric-mass',
  'weight-based-units',
  'weight-based-mg',
  'mcg-kg-min',
  'peds-mg-kg-day',
  'safe-dose-range',
  'bsa-dose',
  'bsa-value',
];

const BSA_TYPES = ['bsa-dose', 'bsa-value'];

// Types that are about time or rate, where a clock time could be mistaken for data.
const TIMED_TYPES = ['ml-per-hour', 'gtt-per-min', 'infusion-time', 'titration-rate'];

// IV problems answered in mL/hr (or hours), where a drop factor is unneeded.
const ML_HR_TYPES = ['ml-per-hour', 'infusion-time', 'mcg-kg-min', 'heparin-units-to-ml-hr', 'titration-rate'];

// Single-dose problems where an order frequency doesn't affect the dose.
const SINGLE_DOSE_TYPES = [
  'tablets-d-over-h',
  'liquid-d-over-h',
  'units-to-volume',
  'weight-based-units',
  'weight-based-mg',
  'reconstitution',
  'bsa-dose',
];

const isChild = (problem) => /\bchild\b/i.test(problem.prompt);
const subject = (problem) => (isChild(problem) ? 'The child' : 'The patient');

const DISTRACTORS = [
  // --- Patient context ---
  {
    id: 'age',
    when: isPatient,
    avoid: BSA_TYPES,
    make: (p) =>
      isChild(p)
        ? `The child is ${randInt(1, 12)} years old.`
        : `The patient is ${randInt(19, 88)} years old.`,
  },
  {
    id: 'allergy',
    when: isPatient,
    make: (p) =>
      `${subject(p)} has a documented allergy to ${pick(['penicillin', 'sulfa drugs', 'codeine', 'latex', 'shellfish', 'aspirin'])}.`,
  },
  {
    id: 'diagnosis',
    when: isPatient,
    make: (p) =>
      `${subject(p)} was admitted with ${pick(['pneumonia', 'cellulitis', 'a urinary tract infection', 'dehydration', 'a COPD exacerbation', 'a hip fracture'])}.`,
  },
  {
    id: 'vitals',
    when: isPatient,
    make: () =>
      `Vital signs: BP ${randInt(100, 150)}/${randInt(60, 92)} mmHg, HR ${randInt(60, 110)} bpm, RR ${randInt(12, 22)}/min, SpO₂ ${randInt(92, 100)}%.`,
  },
  {
    id: 'body-temp',
    when: isPatient,
    avoid: ['temperature'],
    make: (p) => `${subject(p)}'s temperature is ${randStep(97.6, 101.4, 0.2).toFixed(1)} °F.`,
  },
  {
    id: 'weight',
    when: isPatient,
    avoid: USES_WEIGHT,
    make: () =>
      rng() < 0.5 ? `The patient weighs ${randInt(50, 120)} kg.` : `The patient weighs ${randInt(110, 260)} lb.`,
  },
  {
    id: 'height',
    when: isPatient,
    avoid: BSA_TYPES,
    make: (p) => `${subject(p)} is ${isChild(p) ? randInt(80, 150) : randInt(150, 195)} cm tall.`,
  },
  {
    id: 'lab',
    when: isPatient,
    make: () =>
      pick([
        `Serum creatinine is ${randStep(0.6, 1.4, 0.1).toFixed(1)} mg/dL.`,
        `Serum potassium is ${randStep(3.5, 5.0, 0.1).toFixed(1)} mEq/L.`,
        `Blood glucose is ${randInt(80, 180)} mg/dL.`,
        `Hemoglobin is ${randStep(10, 16, 0.1).toFixed(1)} g/dL.`,
      ]),
  },
  {
    id: 'order-time',
    when: isPatient,
    avoid: TIMED_TYPES,
    make: () => `The order was written at ${pick(['0600', '0800', '0930', '1200', '1400', '1630', '2000', '2200'])}.`,
  },

  // --- Type-specific ---
  {
    id: 'drop-factor',
    only: ML_HR_TYPES,
    make: () => `The available tubing has a drop factor of ${pick([10, 15, 20, 60])} gtt/mL.`,
  },
  {
    id: 'frequency',
    only: SINGLE_DOSE_TYPES,
    make: () => `The medication is ordered ${pick(['every 4 hours', 'every 6 hours', 'every 8 hours', 'every 12 hours', 'twice daily', 'once daily'])}.`,
  },
  {
    id: 'bottle-count',
    only: ['tablets-d-over-h'],
    make: () => `The bottle on hand contains ${pick([30, 60, 90, 100])} tablets.`,
  },
  {
    id: 'bottle-volume',
    only: ['liquid-d-over-h'],
    make: () => `The bottle on hand contains ${pick([60, 100, 120, 150, 240])} mL.`,
  },
  {
    id: 'last-dose',
    only: ['tablets-d-over-h', 'liquid-d-over-h', 'reconstitution'],
    make: () => `The last dose was given ${pick([3, 4, 6, 8])} hours ago.`,
  },
  {
    id: 'aptt',
    only: ['heparin-units-to-ml-hr'],
    make: () => `The patient's most recent aPTT was ${randInt(40, 70)} seconds.`,
  },
  {
    id: 'vial-stability',
    only: ['reconstitution'],
    make: () => `Once reconstituted, the vial is stable for ${pick([24, 48, 72])} hours under refrigeration.`,
  },
  {
    id: 'refills',
    only: ['days-supply'],
    make: () => `The prescription has ${randInt(1, 5)} refills.`,
  },

  // --- Compounding / product context ---
  {
    id: 'stock-bottle',
    when: isCompounding,
    make: () => `The stock bottle was opened ${randInt(2, 20)} days ago.`,
  },
  {
    id: 'prep-time',
    when: isCompounding,
    make: () => `The technician has ${pick([10, 15, 20, 30])} minutes to prepare the order.`,
  },

  // --- Any problem ---
  {
    id: 'lot',
    when: hasProduct,
    make: () => `The product's lot number is ${randInt(1000, 9999)}${pick(['A', 'B', 'C', 'K', 'X'])}.`,
  },
  {
    id: 'cost',
    when: hasProduct,
    make: () => `The product costs $${randStep(4, 60, 0.25).toFixed(2)}.`,
  },
  {
    id: 'storage',
    when: hasProduct,
    make: () => pick(['Store at 20–25 °C (68–77 °F).', 'Store refrigerated at 2–8 °C.']),
  },
];

// Distractors that may be used for a given problem.
export function eligibleDistractors(problem) {
  return DISTRACTORS.filter((d) => {
    if (d.only && !d.only.includes(problem.type)) return false;
    if (d.avoid && d.avoid.includes(problem.type)) return false;
    if (d.when && !d.when(problem)) return false;
    return true;
  });
}

// Split a prompt into sentences without breaking on decimals ("2.5 mg").
function splitSentences(prompt) {
  return prompt.split(/(?<=[.?!)])\s+(?=[A-Z(])/);
}

// Return a copy of `problem` with `count` distractor sentences (1–3 by default)
// added to the prompt, plus a first solution step that lists them as
// information not needed for the calculation. The answer is untouched.
// General context opens the prompt, so it never separates a pronoun ("It is
// available as…", "Express this as…") from what it refers to.
export function addDistractors(problem, count = randInt(1, 3)) {
  const pool = [...eligibleDistractors(problem)];
  const chosen = [];
  while (chosen.length < count && pool.length > 0) {
    const i = randInt(0, pool.length - 1);
    chosen.push(...pool.splice(i, 1));
  }
  if (chosen.length === 0) return problem;

  const opening = chosen.filter((d) => !d.only).map((d) => d.make(problem));
  const specific = chosen.filter((d) => d.only).map((d) => d.make(problem));
  const parts = splitSentences(problem.prompt);
  const lastQuestion = parts.findLastIndex((s) => s.includes('?'));
  const q = lastQuestion === -1 ? parts.length - 1 : lastQuestion;
  parts.splice(q, 0, ...specific);
  const sentences = [...opening, ...specific];

  return {
    ...problem,
    prompt: [...opening, ...parts].join(' '),
    distractors: sentences,
    steps: [
      {
        label: 'Pick out what the calculation needs. This information is not used:',
        expr: sentences.join(' • '),
      },
      ...problem.steps,
    ],
  };
}
