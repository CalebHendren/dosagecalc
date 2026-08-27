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
//
// `variants` is the theoretical number of distinct problems the generator can
// produce: the count of independent parameter combinations, derived from the
// random ranges inside each generator (a randStep(min, max, step) draw has
// floor((max − min) / step) + 1 possible values, a pick([...]) has one per
// distinct option). Where one parameter's range depends on another, the counts
// are summed over the dependent range. Summed across all generators
// (TOTAL_VARIANTS) it drives the "distinct problems" figure shown in the footer.
export const GENERATORS = [
  { id: 'kg-to-lbs', label: 'Kilograms → pounds', category: 'Conversions', generate: kgToLbs, variants: 295 },
  { id: 'lbs-to-kg', label: 'Pounds → kilograms', category: 'Conversions', generate: lbsToKg, variants: 296 },

  { id: 'units-to-volume', label: 'Units/mL → volume to deliver', category: 'Concentration & dosing', generate: unitsToVolume, variants: 160 },
  { id: 'weight-based-units', label: 'Weight-based dose (units/kg)', category: 'Concentration & dosing', generate: weightBasedUnits, variants: 6748 },
  { id: 'weight-based-mg', label: 'Weight-based dose (mg/kg)', category: 'Concentration & dosing', generate: weightBasedMg, variants: 6025 },

  { id: 'pct-from-grams', label: 'Grams in mL → % strength', category: 'Percentage strength', generate: pctFromGramsInMl, variants: 5760 },
  { id: 'pct-from-mg-per-ml', label: 'mg/mL → % strength', category: 'Percentage strength', generate: pctFromMgPerMl, variants: 200 },
  { id: 'pct-from-mg-in-ml', label: 'mg in mL → % strength', category: 'Percentage strength', generate: pctFromMgInMl, variants: 9920 },
  { id: 'pct-from-ratio', label: 'Ratio → % strength', category: 'Percentage strength', generate: pctFromRatio, variants: 80 },
  { id: 'mg-in-pct-solution', label: 'mg of drug in a % solution', category: 'Percentage strength', generate: mgInPctSolution, variants: 400 },
  { id: 'mg-in-ratio-solution', label: 'mg of drug in a ratio solution', category: 'Percentage strength', generate: mgInRatioSolution, variants: 2340 },

  { id: 'ratio-from-mg-in-ml', label: 'mg in mL → ratio', category: 'Ratios', generate: ratioFromMgInMl, variants: 187296 },
  { id: 'reduce-ratio', label: 'Reduce a ratio', category: 'Ratios', generate: reduceRatio, variants: 107806 },
  { id: 'pct-to-ratio', label: 'Percentage → ratio', category: 'Ratios', generate: pctToRatio, variants: 9 },
  { id: 'mg-per-ml-from-ratio', label: 'Ratio → mg/mL', category: 'Ratios', generate: mgPerMlFromRatio, variants: 301 },
  { id: 'ml-from-ratio-deliver-mg', label: 'mL of a ratio to deliver a dose', category: 'Ratios', generate: mlFromRatioToDeliverMg, variants: 1400 },

  { id: 'dilution-final-pct', label: 'Final % after dilution', category: 'Dilution (V₁C₁ = V₂C₂)', generate: dilutionFinalPct, variants: 4400 },
  { id: 'dilution-added-volume', label: 'Diluent needed to reach a %', category: 'Dilution (V₁C₁ = V₂C₂)', generate: dilutionAddedVolume, variants: 1900 },

  { id: 'tablets-d-over-h', label: 'Tablets (Desired ÷ Have)', category: 'Clinical calculations', generate: tabletsDesiredOverHave, variants: 40 },
  { id: 'liquid-d-over-h', label: 'Liquid dose (D ÷ H × Q)', category: 'Clinical calculations', generate: liquidDesiredOverHave, variants: 160 },
  { id: 'ml-per-hour', label: 'IV rate (mL/hr)', category: 'Clinical calculations', generate: mlPerHour, variants: 133 },
  { id: 'gtt-per-min', label: 'IV drip rate (gtt/min)', category: 'Clinical calculations', generate: gttPerMin, variants: 480 },
];

// Theoretical total number of distinct problems across all generators.
export const TOTAL_VARIANTS = GENERATORS.reduce((sum, g) => sum + (g.variants || 0), 0);

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
