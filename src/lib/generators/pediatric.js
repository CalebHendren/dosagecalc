import { pick, randStep } from '../random.js';
import { fmt } from '../format.js';

// Pediatric dosing and body-surface-area (BSA) problems.

// mg/kg/day divided into a number of doses → mg per dose.
export function pediatricMgKgDay() {
  const perKgDay = pick([5, 6, 8, 10, 12, 15, 20, 25, 30, 40]);
  const lbs = randStep(20, 90, 1);
  const kg = lbs / 2.2;
  const dosesPerDay = pick([2, 3, 4]);
  const totalDay = perKgDay * kg;
  const answer = totalDay / dosesPerDay;
  return {
    type: 'peds-mg-kg-day',
    category: 'Pediatric & BSA',
    prompt: `A drug is ordered at ${perKgDay} mg/kg/day divided into ${dosesPerDay} doses. The child weighs ${fmt(lbs)} lb. How many mg is each dose?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mg',
    steps: [
      { label: 'Convert weight to kilograms (÷ 2.2).', expr: `${fmt(lbs)} lb ÷ 2.2 = ${fmt(kg)} kg` },
      { label: 'Total daily dose = mg/kg/day × weight.', expr: `${perKgDay} × ${fmt(kg)} = ${fmt(totalDay)} mg/day` },
      { label: 'Divide by the number of doses.', expr: `${fmt(totalDay)} ÷ ${dosesPerDay} = ${fmt(answer)} mg/dose` },
    ],
  };
}

// Safe-dose-range check, reframed numerically: the maximum safe daily amount.
export function safeDoseRange() {
  const minK = pick([10, 15, 20, 25]);
  const maxK = minK + pick([10, 15, 20]);
  const lbs = randStep(22, 88, 1);
  const kg = lbs / 2.2;
  const answer = maxK * kg;
  return {
    type: 'safe-dose-range',
    category: 'Pediatric & BSA',
    prompt: `The safe range for a drug is ${minK}–${maxK} mg/kg/day. A child weighs ${fmt(lbs)} lb. What is the maximum safe amount for one day (mg)?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mg',
    steps: [
      { label: 'Convert weight to kilograms (÷ 2.2).', expr: `${fmt(lbs)} lb ÷ 2.2 = ${fmt(kg)} kg` },
      {
        label: 'Maximum daily dose = upper limit × weight.',
        expr: `${maxK} mg/kg/day × ${fmt(kg)} kg = ${fmt(answer)} mg`,
      },
    ],
  };
}

// BSA-based dose using the Mosteller formula.
export function bsaDose() {
  const cm = randStep(100, 180, 1);
  const kg = randStep(20, 90, 1);
  const perM2 = pick([25, 50, 75, 100, 150, 200]);
  const bsa = Math.sqrt((cm * kg) / 3600);
  const answer = perM2 * bsa;
  return {
    type: 'bsa-dose',
    category: 'Pediatric & BSA',
    prompt: `A drug is ordered at ${perM2} mg/m². The patient is ${cm} cm tall and weighs ${kg} kg. How many mg should be given? (Mosteller BSA)`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mg',
    steps: [
      {
        label: 'Mosteller BSA = √((height_cm × weight_kg) ÷ 3600).',
        expr: `√((${cm} × ${kg}) ÷ 3600) = ${fmt(bsa)} m²`,
      },
      { label: 'Multiply the dose per m² by the BSA.', expr: `${perM2} mg/m² × ${fmt(bsa)} m² = ${fmt(answer)} mg` },
    ],
  };
}

// Compute BSA itself (Mosteller).
export function bsaValue() {
  const cm = randStep(100, 190, 1);
  const kg = randStep(20, 100, 1);
  const answer = Math.sqrt((cm * kg) / 3600);
  return {
    type: 'bsa-value',
    category: 'Pediatric & BSA',
    prompt: `Using the Mosteller formula, what is the body surface area (m²) of a patient ${cm} cm tall weighing ${kg} kg?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'm²',
    steps: [
      {
        label: 'Mosteller BSA = √((height_cm × weight_kg) ÷ 3600).',
        expr: `√((${cm} × ${kg}) ÷ 3600) = ${fmt(answer)} m²`,
      },
    ],
  };
}
