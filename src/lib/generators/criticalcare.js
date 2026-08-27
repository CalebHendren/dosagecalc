import { pick, randStep } from '../random.js';
import { fmt } from '../format.js';

// Advanced IV and critical-care problems: infusion time, weight-based
// mcg/kg/min drips, unit-based (heparin) drips, and rate re-titration.

// How long a running IV will take: volume ÷ rate.
export function infusionTime() {
  const vol = randStep(100, 1000, 50);
  const rate = pick([50, 75, 100, 125, 150, 200]);
  const answer = vol / rate;
  return {
    type: 'infusion-time',
    category: 'Advanced IV & critical care',
    prompt: `An IV of ${vol} mL is infusing at ${rate} mL/hr. How many hours will it take to finish?`,
    roundingNote: 'Round to the nearest hundredth of an hour.',
    answer,
    precision: 2,
    unit: 'hr',
    steps: [{ label: 'Divide the volume by the rate.', expr: `${vol} mL ÷ ${rate} mL/hr = ${fmt(answer)} hr` }],
  };
}

// Critical-care drip ordered in mcg/kg/min, delivered from a mg-in-mL bag.
export function mcgKgMinDrip() {
  const mgInBag = pick([200, 250, 400, 500, 800, 1000]);
  const mlBag = pick([250, 500]);
  const dose = pick([2, 3, 5, 7.5, 10]);
  const kg = pick([60, 70, 75, 80, 90, 100]);
  const concMcgPerMl = (mgInBag * 1000) / mlBag;
  const answer = (dose * kg * 60) / concMcgPerMl;
  return {
    type: 'mcg-kg-min',
    category: 'Advanced IV & critical care',
    prompt: `A drip contains ${mgInBag} mg in ${mlBag} mL. The order is ${fmt(dose)} mcg/kg/min for a ${kg} kg patient. What pump rate (mL/hr) is needed?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL/hr',
    steps: [
      {
        label: 'Find the concentration in mcg/mL (mg × 1000 ÷ mL).',
        expr: `${mgInBag} mg × 1000 ÷ ${mlBag} mL = ${fmt(concMcgPerMl)} mcg/mL`,
      },
      {
        label: 'Multiply dose × weight × 60 min, then divide by the concentration.',
        expr: `(${fmt(dose)} × ${kg} × 60) ÷ ${fmt(concMcgPerMl)} = ${fmt(answer)} mL/hr`,
      },
    ],
  };
}

// Unit-based drip (e.g., heparin): ordered units/hr from a units-in-mL bag.
export function heparinDrip() {
  const unitsInBag = 25000;
  const mlBag = pick([250, 500]);
  const orderedPerHr = pick([500, 800, 1000, 1200, 1500, 1800]);
  const concUnitsPerMl = unitsInBag / mlBag;
  const answer = orderedPerHr / concUnitsPerMl;
  return {
    type: 'heparin-units-to-ml-hr',
    category: 'Advanced IV & critical care',
    prompt: `Heparin ${unitsInBag.toLocaleString()} units is in ${mlBag} mL. The order is ${orderedPerHr.toLocaleString()} units/hr. What is the pump rate in mL/hr?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL/hr',
    steps: [
      {
        label: 'Find the concentration in units/mL.',
        expr: `${unitsInBag.toLocaleString()} units ÷ ${mlBag} mL = ${fmt(concUnitsPerMl)} units/mL`,
      },
      {
        label: 'Divide the ordered units/hr by the concentration.',
        expr: `${orderedPerHr.toLocaleString()} units/hr ÷ ${fmt(concUnitsPerMl)} units/mL = ${fmt(answer)} mL/hr`,
      },
    ],
  };
}

// Re-titrate an infusion that is off schedule: remaining volume ÷ remaining time.
export function titrationRate() {
  const totalVol = randStep(500, 1000, 50);
  const totalHr = pick([8, 10, 12]);
  const elapsedHr = pick([2, 3, 4, 5]);
  const infused = randStep(100, totalVol - 100, 50);
  const remainingVol = totalVol - infused;
  const remainingHr = totalHr - elapsedHr;
  const answer = remainingVol / remainingHr;
  return {
    type: 'titration-rate',
    category: 'Advanced IV & critical care',
    prompt: `${totalVol} mL was ordered to infuse over ${totalHr} hr. After ${elapsedHr} hr, ${infused} mL has infused. What new rate (mL/hr) finishes it on time?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL/hr',
    steps: [
      { label: 'Volume remaining = ordered − infused.', expr: `${totalVol} − ${infused} = ${remainingVol} mL` },
      { label: 'Time remaining = ordered time − elapsed.', expr: `${totalHr} − ${elapsedHr} = ${remainingHr} hr` },
      {
        label: 'Divide the remaining volume by the remaining time.',
        expr: `${remainingVol} mL ÷ ${remainingHr} hr = ${fmt(answer)} mL/hr`,
      },
    ],
  };
}
