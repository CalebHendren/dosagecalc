import { ALL_GENERATOR_IDS } from './generators/index.js';

// Curated bundles of problem-type ids, grouped by exam / audience. Selecting a
// preset sets the enabled types to exactly its list; users can then mix and
// match individual types. The NCLEX / Med-Math preset is enabled by default.

export const PRESETS = [
  {
    id: 'nclex',
    name: 'NCLEX / Med-Math (Nursing)',
    description:
      'Core nursing dosage-calc: conversions, oral & IV dosing, drip rates, infusion time, critical-care and pediatric dosing, reconstitution.',
    typeIds: [
      'kg-to-lbs',
      'lbs-to-kg',
      'metric-mass',
      'metric-volume',
      'household-volume',
      'grains-to-mg',
      'temperature',
      'units-to-volume',
      'weight-based-units',
      'weight-based-mg',
      'tablets-d-over-h',
      'liquid-d-over-h',
      'ml-per-hour',
      'gtt-per-min',
      'infusion-time',
      'mcg-kg-min',
      'heparin-units-to-ml-hr',
      'titration-rate',
      'peds-mg-kg-day',
      'safe-dose-range',
      'bsa-dose',
      'bsa-value',
      'reconstitution',
    ],
  },
  {
    id: 'pharmacy-tech',
    name: 'Pharmacy Technician (PTCB)',
    description:
      'Percentage strength, ratios, dilution, alligation, days supply, conversions, and reconstitution.',
    typeIds: [
      'metric-mass',
      'metric-volume',
      'household-volume',
      'grains-to-mg',
      'units-to-volume',
      'weight-based-mg',
      'pct-from-grams',
      'pct-from-mg-per-ml',
      'pct-from-mg-in-ml',
      'pct-from-ratio',
      'mg-in-pct-solution',
      'mg-in-ratio-solution',
      'ratio-from-mg-in-ml',
      'reduce-ratio',
      'pct-to-ratio',
      'mg-per-ml-from-ratio',
      'ml-from-ratio-deliver-mg',
      'dilution-final-pct',
      'dilution-added-volume',
      'reconstitution',
      'alligation',
      'days-supply',
    ],
  },
  {
    id: 'critical-care',
    name: 'Critical Care / ICU',
    description: 'Weight-based and unit-based drips, infusion time, and rate re-titration.',
    typeIds: [
      'weight-based-units',
      'weight-based-mg',
      'ml-per-hour',
      'gtt-per-min',
      'infusion-time',
      'mcg-kg-min',
      'heparin-units-to-ml-hr',
      'titration-rate',
      'reconstitution',
    ],
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Weight- and BSA-based pediatric dosing and safe-dose-range checks.',
    typeIds: [
      'kg-to-lbs',
      'lbs-to-kg',
      'weight-based-mg',
      'liquid-d-over-h',
      'peds-mg-kg-day',
      'safe-dose-range',
      'bsa-dose',
      'bsa-value',
    ],
  },
  {
    id: 'conversions',
    name: 'Conversions only',
    description: 'Metric, household/apothecary, weight, and temperature conversions.',
    typeIds: [
      'kg-to-lbs',
      'lbs-to-kg',
      'metric-mass',
      'metric-volume',
      'household-volume',
      'grains-to-mg',
      'temperature',
    ],
  },
  {
    id: 'all',
    name: 'Everything',
    description: 'All problem types.',
    typeIds: [...ALL_GENERATOR_IDS],
  },
];

const BY_ID = new Map(PRESETS.map((p) => [p.id, p]));

export function getPreset(id) {
  return BY_ID.get(id);
}

// The preset applied to a first-time visitor.
export const DEFAULT_PRESET_ID = 'nclex';
export const DEFAULT_ENABLED_TYPE_IDS = getPreset(DEFAULT_PRESET_ID).typeIds;
