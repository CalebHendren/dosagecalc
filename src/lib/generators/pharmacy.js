import { pick } from '../random.js';
import { fmt } from '../format.js';

// Allied-health / pharmacy-technician staples: alligation and days supply.

// Alligation (alternate): how much of the higher-strength solution to mix with
// the lower-strength one to make a target strength.
export function alligation() {
  const combos = [
    { low: 0, target: 5, high: 20 },
    { low: 5, target: 10, high: 25 },
    { low: 10, target: 20, high: 50 },
    { low: 0, target: 10, high: 50 },
    { low: 20, target: 30, high: 70 },
    { low: 5, target: 15, high: 25 },
  ];
  const { low, target, high } = pick(combos);
  const totalMl = pick([100, 200, 250, 500, 1000]);
  const answer = (totalMl * (target - low)) / (high - low);
  return {
    type: 'alligation',
    category: 'Pharmacy calculations',
    prompt: `How many mL of ${high}% solution must be mixed with ${low}% solution to make ${totalMl} mL of ${target}%?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL',
    steps: [
      { label: 'Parts of the high strength = target − low.', expr: `${target} − ${low} = ${target - low} parts` },
      { label: 'Total parts = high − low.', expr: `${high} − ${low} = ${high - low} parts` },
      {
        label: 'Volume of high strength = total × (parts high ÷ total parts).',
        expr: `${totalMl} × (${target - low} ÷ ${high - low}) = ${fmt(answer)} mL`,
      },
    ],
  };
}

// Days supply: total quantity ÷ amount used per day.
export function daysSupply() {
  const perDose = pick([0.5, 1, 2]);
  const freq = pick([1, 2, 3, 4]);
  const days = pick([5, 7, 10, 14, 30, 90]);
  const perDay = perDose * freq;
  const qty = perDay * days;
  const answer = qty / perDay;
  return {
    type: 'days-supply',
    category: 'Pharmacy calculations',
    prompt: `A prescription dispenses ${fmt(qty)} tablets. The sig is ${fmt(perDose)} tablet(s) ${freq} time(s) daily. How many days will it last?`,
    roundingNote: 'Round down to whole days.',
    answer,
    precision: 0,
    unit: 'day(s)',
    steps: [
      { label: 'Tablets per day = amount per dose × doses per day.', expr: `${fmt(perDose)} × ${freq} = ${fmt(perDay)} tablets/day` },
      { label: 'Days supply = total tablets ÷ tablets per day.', expr: `${fmt(qty)} ÷ ${fmt(perDay)} = ${answer} days` },
    ],
  };
}
