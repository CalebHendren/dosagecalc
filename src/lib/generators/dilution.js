import { pick, randStep } from '../random.js';
import { fmt } from '../format.js';

// Dilution problems use V1C1 = V2C2.

export function dilutionFinalPct() {
  const V1 = randStep(1, 20, 1);
  const C1 = pick([1, 2, 3, 4, 5, 5.2, 6, 10, 20, 33, 50]);
  const diluent = randStep(1, 20, 1);
  const V2 = V1 + diluent;
  const answer = (V1 * C1) / V2;
  return {
    type: 'dilution-final-pct',
    category: 'Dilution (V₁C₁ = V₂C₂)',
    prompt: `${V1} mL of a ${C1}% solution is diluted with ${diluent} mL of diluent. What is the percentage strength of the final solution?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: '%',
    steps: [
      {
        label: 'The final volume V₂ is the starting volume plus the diluent added.',
        expr: `V₂ = ${V1} mL + ${diluent} mL = ${V2} mL`,
      },
      {
        label: 'Rearrange V₁C₁ = V₂C₂ to solve for the final concentration C₂ = (V₁ × C₁) ÷ V₂.',
        expr: `(${V1} × ${C1}) ÷ ${V2} = ${fmt(answer)} %`,
      },
    ],
  };
}

export function dilutionAddedVolume() {
  const V1 = randStep(10, 100, 5);
  const C1 = pick([2, 3, 4, 5, 6, 8, 10, 20]);
  const C2 = randStep(1, C1 - 0.5, 0.5);
  const V2 = (V1 * C1) / C2;
  const answer = V2 - V1;
  return {
    type: 'dilution-added-volume',
    category: 'Dilution (V₁C₁ = V₂C₂)',
    prompt: `${V1} mL of a ${C1}% solution is diluted to a final concentration of ${C2}%. How much diluent must be added?`,
    roundingNote: 'Round to the nearest hundredth.',
    answer,
    precision: 2,
    unit: 'mL',
    steps: [
      {
        label: 'Rearrange V₁C₁ = V₂C₂ to solve for the final volume V₂ = (V₁ × C₁) ÷ C₂.',
        expr: `(${V1} × ${C1}) ÷ ${C2} = ${fmt(V2)} mL`,
      },
      {
        label: 'The diluent added is the final volume minus the starting volume.',
        expr: `${fmt(V2)} mL − ${V1} mL = ${fmt(answer)} mL`,
      },
    ],
  };
}
