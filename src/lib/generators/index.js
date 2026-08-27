import { kgToLbs, lbsToKg } from './conversions.js';
import { unitsToVolume, weightBasedUnits, weightBasedMg } from './concentration.js';
import {
  pctFromGramsInMl,
  pctFromMgPerMl,
  pctFromMgInMl,
  pctFromRatio,
  mgInPctSolution,
  mgInRatioSolution,
} from './percentage.js';
import {
  ratioFromMgInMl,
  reduceRatio,
  pctToRatio,
  mgPerMlFromRatio,
  mlFromRatioToDeliverMg,
} from './ratio.js';
import { dilutionFinalPct, dilutionAddedVolume } from './dilution.js';
import {
  tabletsDesiredOverHave,
  liquidDesiredOverHave,
  mlPerHour,
  gttPerMin,
} from './clinical.js';
import { pick } from '../random.js';
import { pickWeighted } from '../weighting.js';

// The registry. Each entry has a stable `id` (used for the enabled-types
// setting), a human `label`, its `category`, and a `generate` function that
// returns a fresh, randomized problem each time it is called.
export const GENERATORS = [
  { id: 'kg-to-lbs', label: 'Kilograms → pounds', category: 'Conversions', generate: kgToLbs },
  { id: 'lbs-to-kg', label: 'Pounds → kilograms', category: 'Conversions', generate: lbsToKg },

  { id: 'units-to-volume', label: 'Units/mL → volume to deliver', category: 'Concentration & dosing', generate: unitsToVolume },
  { id: 'weight-based-units', label: 'Weight-based dose (units/kg)', category: 'Concentration & dosing', generate: weightBasedUnits },
  { id: 'weight-based-mg', label: 'Weight-based dose (mg/kg)', category: 'Concentration & dosing', generate: weightBasedMg },

  { id: 'pct-from-grams', label: 'Grams in mL → % strength', category: 'Percentage strength', generate: pctFromGramsInMl },
  { id: 'pct-from-mg-per-ml', label: 'mg/mL → % strength', category: 'Percentage strength', generate: pctFromMgPerMl },
  { id: 'pct-from-mg-in-ml', label: 'mg in mL → % strength', category: 'Percentage strength', generate: pctFromMgInMl },
  { id: 'pct-from-ratio', label: 'Ratio → % strength', category: 'Percentage strength', generate: pctFromRatio },
  { id: 'mg-in-pct-solution', label: 'mg of drug in a % solution', category: 'Percentage strength', generate: mgInPctSolution },
  { id: 'mg-in-ratio-solution', label: 'mg of drug in a ratio solution', category: 'Percentage strength', generate: mgInRatioSolution },

  { id: 'ratio-from-mg-in-ml', label: 'mg in mL → ratio', category: 'Ratios', generate: ratioFromMgInMl },
  { id: 'reduce-ratio', label: 'Reduce a ratio', category: 'Ratios', generate: reduceRatio },
  { id: 'pct-to-ratio', label: 'Percentage → ratio', category: 'Ratios', generate: pctToRatio },
  { id: 'mg-per-ml-from-ratio', label: 'Ratio → mg/mL', category: 'Ratios', generate: mgPerMlFromRatio },
  { id: 'ml-from-ratio-deliver-mg', label: 'mL of a ratio to deliver a dose', category: 'Ratios', generate: mlFromRatioToDeliverMg },

  { id: 'dilution-final-pct', label: 'Final % after dilution', category: 'Dilution', generate: dilutionFinalPct },
  { id: 'dilution-added-volume', label: 'Diluent needed to reach a %', category: 'Dilution', generate: dilutionAddedVolume },

  { id: 'tablets-d-over-h', label: 'Tablets (Desired ÷ Have)', category: 'Clinical calculations', generate: tabletsDesiredOverHave },
  { id: 'liquid-d-over-h', label: 'Liquid dose (D ÷ H × Q)', category: 'Clinical calculations', generate: liquidDesiredOverHave },
  { id: 'ml-per-hour', label: 'IV rate (mL/hr)', category: 'Clinical calculations', generate: mlPerHour },
  { id: 'gtt-per-min', label: 'IV drip rate (gtt/min)', category: 'Clinical calculations', generate: gttPerMin },
];

// Ordered list of category names, derived from the registry.
export const CATEGORIES = GENERATORS.reduce((acc, g) => {
  if (!acc.includes(g.category)) acc.push(g.category);
  return acc;
}, []);

export const ALL_GENERATOR_IDS = GENERATORS.map((g) => g.id);

const BY_ID = new Map(GENERATORS.map((g) => [g.id, g]));

export function getGenerator(id) {
  return BY_ID.get(id);
}

// Generate a problem from a random enabled generator. `enabledIds` is an array
// of generator ids; anything unknown/empty falls back to the full set. A
// `previousType` can be passed to avoid immediately repeating the same type
// when more than one is enabled. When a `weights` map (id → weight) is given,
// the pick is biased by those weights ("weighted mode"); otherwise it is
// uniform.
export function generateProblem(enabledIds, previousType, weights) {
  let pool = GENERATORS.filter((g) => enabledIds?.includes(g.id));
  if (pool.length === 0) pool = GENERATORS;
  if (pool.length > 1 && previousType) {
    const filtered = pool.filter((g) => g.id !== previousType);
    if (filtered.length > 0) pool = filtered;
  }
  let chosen;
  if (weights) {
    const id = pickWeighted(pool.map((g) => g.id), weights);
    chosen = BY_ID.get(id) || pick(pool);
  } else {
    chosen = pick(pool);
  }
  const problem = chosen.generate();
  problem.type = problem.type || chosen.id;
  problem.label = chosen.label;
  return problem;
}
