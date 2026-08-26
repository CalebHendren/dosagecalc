import { pick, randInt, randStep, round } from '../random.js';
import { fmt } from '../format.js';

// How many mL to deliver a given number of units, from a units/mL supply.
export function unitsToVolume() {
  const conc = pick([100, 150, 200, 250, 500, 1000, 5000, 10000]);
  const desiredMl = randStep(0.5, 10, 0.5);
  const target = Math.round(conc * desiredMl);
  const answer = round(target / conc, 2);
  return {
    type: 'units-to-volume',
    category: 'Concentration & dosing',
    prompt: `A medication is supplied at ${conc} units/mL. How many mL are needed to deliver ${target.toLocaleString()} units?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL',
    steps: [
      {
        label: 'Divide the ordered units by the concentration (units/mL). The units cancel, leaving mL.',
        expr: `${target.toLocaleString()} units ÷ ${conc} units/mL`,
      },
      { label: 'Divide.', expr: `= ${fmt(answer)} mL` },
    ],
  };
}

// Weight-based loading dose in units/kg from a units/mL supply.
export function weightBasedUnits() {
  const conc = pick([1000, 2500, 5000, 10000]);
  const dose = pick([10, 15, 20, 25, 30, 40, 50]);
  const lbs = randStep(20, 260, 1);
  const kg = lbs / 2.2;
  const totalUnits = kg * dose;
  const answer = totalUnits / conc;
  return {
    type: 'weight-based-units',
    category: 'Concentration & dosing',
    prompt: `A medication is supplied as ${conc.toLocaleString()} units/mL. The ordered dose is ${dose} units/kg. The patient weighs ${fmt(lbs)} lb. How many mL should be given?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL',
    steps: [
      {
        label: 'Convert the weight to kilograms (divide by 2.2).',
        expr: `${fmt(lbs)} lb ÷ 2.2 = ${fmt(kg)} kg`,
      },
      {
        label: 'Multiply the weight by the dose to get the total units ordered.',
        expr: `${fmt(kg)} kg × ${dose} units/kg = ${fmt(totalUnits)} units`,
      },
      {
        label: 'Divide the total units by the concentration to get mL.',
        expr: `${fmt(totalUnits)} units ÷ ${conc.toLocaleString()} units/mL = ${fmt(answer)} mL`,
      },
    ],
  };
}

// Weight-based dose in mg/kg from a mg/mL supply.
export function weightBasedMg() {
  const supply = pick([1, 2, 4, 5, 10]);
  const dose = pick([0.5, 1, 2, 3, 5]);
  const lbs = randStep(20, 260, 1);
  const kg = lbs / 2.2;
  const totalMg = kg * dose;
  const answer = totalMg / supply;
  return {
    type: 'weight-based-mg',
    category: 'Concentration & dosing',
    prompt: `A medication is ordered at ${dose} mg/kg and supplied as ${supply} mg/mL. The patient weighs ${fmt(lbs)} lb. How many mL should be given?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL',
    steps: [
      {
        label: 'Convert the weight to kilograms (divide by 2.2).',
        expr: `${fmt(lbs)} lb ÷ 2.2 = ${fmt(kg)} kg`,
      },
      {
        label: 'Multiply the weight by the dose to get the total mg ordered.',
        expr: `${fmt(kg)} kg × ${dose} mg/kg = ${fmt(totalMg)} mg`,
      },
      {
        label: 'Divide the total mg by the concentration to get mL.',
        expr: `${fmt(totalMg)} mg ÷ ${supply} mg/mL = ${fmt(answer)} mL`,
      },
    ],
  };
}
