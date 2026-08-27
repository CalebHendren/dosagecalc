import { pick } from '../random.js';
import { fmt } from '../format.js';

// Reconstitution: a powdered drug is mixed to a stated concentration, then a
// volume is drawn up for the ordered dose.
export function reconstitution() {
  const totalMg = pick([500, 1000, 2000]);
  const conc = pick([50, 100, 125, 200, 250]);
  const fraction = pick([0.25, 0.5, 0.75, 1]);
  const ordered = totalMg * fraction;
  const answer = ordered / conc;
  return {
    type: 'reconstitution',
    category: 'Reconstitution',
    prompt: `A ${totalMg} mg vial is reconstituted to ${conc} mg/mL. How many mL are needed for a ${fmt(ordered)} mg dose?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL',
    steps: [
      {
        label: 'Divide the ordered dose by the reconstituted concentration.',
        expr: `${fmt(ordered)} mg ÷ ${conc} mg/mL = ${fmt(answer)} mL`,
      },
    ],
  };
}
