import { pick, randInt, randStep, rng } from './random.js';

// Distractor mode: adds realistic but irrelevant details to a problem's prompt,
// the way exam questions do, so the learner has to pick out only the numbers
// the calculation needs. Distractors never change the answer.
//
// Each distractor has a `make(problem)` that returns its detail, and may
// restrict where it appears:
//   - `when(problem)`: only for problems this predicate accepts
//   - `only`:          only for these problem types
//   - `avoid`:         never for these types (they use that kind of value, so
//                      the "distractor" would conflict with or duplicate real data)
//
// A detail is a full sentence (`text`), plus optional shorter forms that let it
// be woven into the problem's own sentences rather than sitting apart:
//   - `post`:  a phrase that follows "patient"/"child" ("aged 67",
//              "admitted with pneumonia"), so "The patient weighs 70 kg."
//              becomes "The patient, aged 67, weighs 70 kg."
//   - `paren`: a label note for a product ("lot 4821K"), so "a 20% solution"
//              becomes "a 20% solution (lot 4821K)"
//   - `tail`:  words that end an order ("every 6 hours"), so "A medication is
//              ordered as 100 mg." becomes "…ordered as 100 mg every 6 hours."
// Details that aren't woven in are placed as their own sentence at a random
// point before the question, so there's no fixed spot to skip.

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
    make: (p) => {
      const age = isChild(p) ? randInt(1, 12) : randInt(19, 88);
      return { text: `${subject(p)} is ${age} years old.`, post: `aged ${age}` };
    },
  },
  {
    id: 'allergy',
    when: isPatient,
    make: (p) => {
      const [name, short] = pick([
        ['penicillin', 'penicillin'],
        ['sulfa drugs', 'sulfa'],
        ['codeine', 'codeine'],
        ['latex', 'latex'],
        ['shellfish', 'shellfish'],
        ['aspirin', 'aspirin'],
      ]);
      return {
        text: `${subject(p)} has a documented allergy to ${name}.`,
        post: `with a documented ${short} allergy`,
      };
    },
  },
  {
    id: 'diagnosis',
    when: isPatient,
    make: (p) => {
      const dx = pick(['pneumonia', 'cellulitis', 'a urinary tract infection', 'dehydration', 'a COPD exacerbation', 'a hip fracture']);
      return { text: `${subject(p)} was admitted with ${dx}.`, post: `admitted with ${dx}` };
    },
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
    make: (p) => {
      const t = `${randStep(97.6, 101.4, 0.2).toFixed(1)} °F`;
      return { text: `${subject(p)}'s temperature is ${t}.`, post: `with a temperature of ${t}` };
    },
  },
  {
    id: 'weight',
    when: isPatient,
    avoid: USES_WEIGHT,
    make: () => {
      const w = rng() < 0.5 ? `${randInt(50, 120)} kg` : `${randInt(110, 260)} lb`;
      return { text: `The patient weighs ${w}.`, post: `who weighs ${w}` };
    },
  },
  {
    id: 'height',
    when: isPatient,
    avoid: BSA_TYPES,
    make: (p) => {
      const h = isChild(p) ? randInt(80, 150) : randInt(150, 195);
      return { text: `${subject(p)} is ${h} cm tall.`, post: `who is ${h} cm tall` };
    },
  },
  {
    id: 'lab',
    when: isPatient,
    make: () => {
      const [name, value] = pick([
        ['serum creatinine', () => `${randStep(0.6, 1.4, 0.1).toFixed(1)} mg/dL`],
        ['serum potassium', () => `${randStep(3.5, 5.0, 0.1).toFixed(1)} mEq/L`],
        ['blood glucose', () => `${randInt(80, 180)} mg/dL`],
        ['hemoglobin', () => `${randStep(10, 16, 0.1).toFixed(1)} g/dL`],
      ]);
      const v = value();
      return {
        text: `${name[0].toUpperCase()}${name.slice(1)} is ${v}.`,
        post: `with a ${name} of ${v}`,
      };
    },
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
    make: () => {
      const freq = pick(['every 4 hours', 'every 6 hours', 'every 8 hours', 'every 12 hours', 'twice daily', 'once daily']);
      return { text: `The medication is ordered ${freq}.`, tail: freq };
    },
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
    make: () => {
      const days = randInt(2, 20);
      return {
        text: `The stock bottle was opened ${days} days ago.`,
        paren: `from a stock bottle opened ${days} days ago`,
        solutionOnly: true,
      };
    },
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
    make: () => {
      const lot = `${randInt(1000, 9999)}${pick(['A', 'B', 'C', 'K', 'X'])}`;
      return { text: `The product's lot number is ${lot}.`, paren: `lot ${lot}` };
    },
  },
  {
    id: 'cost',
    when: hasProduct,
    make: () => {
      const cost = `$${randStep(4, 60, 0.25).toFixed(2)}`;
      return { text: `The product costs ${cost}.`, paren: `cost ${cost}` };
    },
  },
  {
    id: 'storage',
    when: hasProduct,
    make: () =>
      pick([
        { text: 'Store at 20–25 °C (68–77 °F).', paren: 'store at 20–25 °C' },
        { text: 'Store refrigerated at 2–8 °C.', paren: 'store refrigerated at 2–8 °C' },
      ]),
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

// Sentences that lean on the one before ("It is available as…", "Express this
// as…", "How many grains is that?"), so nothing may be put in front of them.
const refersBack = (s) => /^(It|This|That|They|These|Express this)\b/.test(s) || /\bis that\b/.test(s);

// A patient mention a `post` phrase can follow: "The patient weighs…",
// "A child weighs…", "…for a 60 kg patient." Group 1 is the article; the
// lookahead (group 3) is what comes next.
const MENTION = /\b(The|the|A|a) (?:\d[\d.]* kg )?(patient|child)\b(?=([.?]| (?:weighs|is|was|has)\b))/;

// A patient described at the end of a question ("…of a patient 122 cm tall
// weighing 21 kg?"), where a `post` phrase can go on the end.
const MENTION_AT_END = /\b(?:patient|child) \d[^.?]*(?=\?$)/;

// A sentence about an order that a patient ("…for a patient aged 67.") can end.
const canEndWithPatient = (s) => /\b(ordered|The order is)\b/.test(s) && s.endsWith('.');

// An order sentence whose dose a frequency can follow ("…ordered as 100 mg every
// 6 hours."). Not one that goes on to name the supply or a division into doses.
const canEndWithTail = (s) =>
  /\b(ordered (as|at)|ordered dose is)\b/.test(s) && s.endsWith('.') && !/supplied|available|divided/.test(s);

// Product names a `paren` note can follow. Solutions ("20% solution",
// "1:300 solution", "A solution contains…") come first: they're the only kind a
// stock bottle fits.
const SOLUTION_SITES = [/\S*\d\S* solution\b/, /^A solution(?= contains)/];
const PRODUCT_SITES = [
  ...SOLUTION_SITES,
  /\bmg tablets\b/,
  /\bdispenses \d+ tablets\b/,
  /\bmg vial\b/,
  /\bA drip\b/,
  /^Heparin [\d,]+ units\b/,
  /\b(?:medication|drug)(?= is supplied)/,
];

const lowerFirst = (s) => (/^[A-Z][a-z ]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

// Ways `detail` could be woven into sentence `i` of `parts`. Each option's
// `apply()` rewrites that sentence and returns the exact text it inserted;
// `intro` marks one that brings a patient into a prompt that had none.
function weaveOptions(parts, i, q, detail, problem, patientDetails) {
  const s = parts[i];
  const options = [];
  const insert = (at, text, intro = false) => ({
    i,
    intro,
    apply: () => {
      parts[i] = s.slice(0, at) + text + s.slice(at);
      return text;
    },
  });

  if (detail.post) {
    const m = s.match(MENTION);
    if (m) {
      const at = m.index + m[0].length;
      // "A child aged 6 weighs…", "…for a 60 kg patient aged 72." but
      // "The patient, aged 67, weighs…"
      const bare = /^[.?]/.test(m[3]) || /^a$/i.test(m[1]);
      options.push(insert(at, bare ? ` ${detail.post}` : `, ${detail.post},`));
    } else if (MENTION_AT_END.test(s)) {
      const m = s.match(MENTION_AT_END);
      options.push(insert(m.index + m[0].length, ` ${detail.post}`));
    } else if (!/\b(patient|child)\b/i.test(parts.join(' '))) {
      // No one to attach to: introduce the patient in a clause of our own.
      // Not in the question when other patient details will need a spot
      // after the introduction.
      if (i === q && patientDetails > 1) return options;
      const who = isChild(problem) ? 'child' : 'patient';
      if (canEndWithPatient(s)) options.push(insert(s.length - 1, ` for a ${who} ${detail.post}`, true));
      if (!refersBack(s)) {
        const text = `For a ${who} ${detail.post}, `;
        options.push({
          i,
          intro: true,
          apply: () => {
            parts[i] = text + lowerFirst(s);
            return text;
          },
        });
      }
    }
  }

  if (detail.paren) {
    const sites = detail.solutionOnly ? SOLUTION_SITES : PRODUCT_SITES;
    const re = sites.find((r) => r.test(s));
    if (re) {
      const m = s.match(re);
      options.push(insert(m.index + m[0].length, ` (${detail.paren})`));
    }
  }

  if (detail.tail && canEndWithTail(s)) options.push(insert(s.length - 1, ` ${detail.tail}`));

  return options;
}

// Chance that a detail with a short form is woven in (when there's a place for
// it) rather than placed as its own sentence.
const WEAVE_CHANCE = 0.7;

// Return a copy of `problem` with `count` distractor details (1–3 by default)
// worked into the prompt, plus a first solution step that lists them as
// information not needed for the calculation. The answer is untouched.
//
// Details are woven into the problem's sentences where they fit, at most one
// per sentence; the rest become sentences of their own, dropped at random
// points before the question. Type-specific details stay after the opening
// sentence, since they refer back to it ("The medication is ordered…").
// `distractorInsertions` holds the exact text added, in the order it was added.
export function addDistractors(problem, count = randInt(1, 3)) {
  const pool = [...eligibleDistractors(problem)];
  const chosen = [];
  while (chosen.length < count && pool.length > 0) {
    const i = randInt(0, pool.length - 1);
    chosen.push(...pool.splice(i, 1));
  }
  if (chosen.length === 0) return problem;

  const details = chosen.map((d) => {
    const made = d.make(problem);
    return { specific: !!d.only, ...(typeof made === 'string' ? { text: made } : made) };
  });

  const parts = splitSentences(problem.prompt);
  const lastQuestion = parts.findLastIndex((s) => s.includes('?'));
  let q = lastQuestion === -1 ? parts.length - 1 : lastQuestion;

  const insertions = [];
  const woven = new Set();
  const loose = [];
  let introAt = -1; // sentence where a woven clause introduced the patient
  const patientDetails = details.filter((d) => d.post).length;
  for (const detail of details) {
    if (rng() < WEAVE_CHANCE) {
      const options = [];
      for (let i = 0; i <= q; i++) {
        if (!woven.has(i)) options.push(...weaveOptions(parts, i, q, detail, problem, patientDetails));
      }
      if (options.length > 0) {
        const option = pick(options);
        insertions.push(option.apply());
        woven.add(option.i);
        if (option.intro) introAt = option.i;
        continue;
      }
    }
    loose.push(detail);
  }

  for (const detail of loose) {
    // "The patient…" can't come before "For a patient…" introduces them.
    const after = detail.post && introAt >= 0 ? introAt + 1 : detail.specific ? 1 : 0;
    const lo = Math.min(after, q);
    const spots = [];
    for (let i = lo; i <= q; i++) if (!refersBack(parts[i])) spots.push(i);
    const at = spots.length > 0 ? pick(spots) : lo;
    parts.splice(at, 0, detail.text);
    insertions.push(`${detail.text} `);
    if (at <= introAt) introAt++;
    q++;
  }

  const sentences = details.map((d) => d.text);
  return {
    ...problem,
    prompt: parts.join(' '),
    distractors: sentences,
    distractorInsertions: insertions,
    steps: [
      {
        label: 'Pick out what the calculation needs. This information is not used:',
        expr: sentences.join(' • '),
      },
      ...problem.steps,
    ],
  };
}
