import { randStep } from '../random.js';
import { fmt } from '../format.js';

// 1 kg = 2.2 lb is the factor used throughout nursing dosage calculations.
const KG_PER_LB = 2.2;

export function kgToLbs() {
  const kg = randStep(3, 150, 0.5);
  const answer = kg * KG_PER_LB;
  return {
    type: 'kg-to-lbs',
    category: 'Conversions',
    prompt: `How many pounds (lb) are in ${fmt(kg)} kg?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'lb',
    steps: [
      {
        label: 'To convert kilograms to pounds, multiply by 2.2 (1 kg = 2.2 lb).',
        expr: `${fmt(kg)} kg × 2.2 lb/kg`,
      },
      { label: 'Multiply.', expr: `= ${fmt(answer)} lb` },
    ],
  };
}

export function lbsToKg() {
  const lbs = randStep(5, 300, 1);
  const answer = lbs / KG_PER_LB;
  return {
    type: 'lbs-to-kg',
    category: 'Conversions',
    prompt: `How many kilograms (kg) are in ${fmt(lbs)} lb?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'kg',
    steps: [
      {
        label: 'To convert pounds to kilograms, divide by 2.2 (always divide by 2.2).',
        expr: `${fmt(lbs)} lb ÷ 2.2`,
      },
      { label: 'Divide.', expr: `= ${fmt(answer)} kg` },
    ],
  };
}
