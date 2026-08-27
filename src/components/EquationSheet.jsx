import { useState } from 'react';

// Reference sheet of the formulas behind every problem type, grouped by the
// same categories used in the generator registry. Opening the sheet counts as
// "referencing" it and spends XP (charged once per open via `onReference`).

const GROUPS = [
  {
    title: 'Conversions',
    rows: [
      ['Kilograms → pounds', 'lb = kg × 2.2'],
      ['Pounds → kilograms', 'kg = lb ÷ 2.2'],
    ],
  },
  {
    title: 'Concentration & dosing',
    rows: [
      ['Volume to deliver', 'Volume = Dose ordered ÷ Concentration'],
      ['Weight-based dose', 'Dose = Dose per kg × Weight (kg)'],
    ],
  },
  {
    title: 'Percentage strength',
    rows: [
      ['% strength (w/v)', '% = (grams of drug ÷ mL of solution) × 100'],
      ['mg/mL → %', '% = (mg/mL) ÷ 10'],
      ['Ratio 1:N → %', '% = (1 ÷ N) × 100'],
      ['mg of drug in a % solution', 'mg = (% ÷ 100) × mL × 1000'],
      ['Ratio strength 1:N', '1 g of drug in N mL of solution'],
    ],
  },
  {
    title: 'Ratios',
    rows: [
      ['mg/mL → ratio 1:N', 'N = 1000 ÷ (mg/mL)'],
      ['Percentage → ratio', '1 : (100 ÷ %)'],
      ['Ratio 1:N → mg/mL', 'mg/mL = 1000 ÷ N'],
      ['mL to deliver a dose', 'Volume = Dose (mg) ÷ (mg/mL)'],
    ],
  },
  {
    title: 'Dilution',
    rows: [
      ['Final strength', 'C₂ = (V₁ × C₁) ÷ V₂'],
      ['Diluent to add', 'Diluent = V₂ − V₁'],
    ],
  },
  {
    title: 'Clinical calculations',
    rows: [
      ['Tablets', 'Tablets = Desired ÷ Have'],
      ['Liquid dose', 'Volume = (Desired ÷ Have) × Quantity'],
      ['IV rate (mL/hr)', 'Rate = Total volume ÷ Time (hr)'],
      ['IV drip rate (gtt/min)', 'Rate = (Volume × Drop factor) ÷ Time (min)'],
    ],
  },
];

export default function EquationSheet({ cost, onReference }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((wasOpen) => {
      // Charge XP only when opening (referencing) the sheet, not when closing.
      if (!wasOpen) onReference(cost);
      return !wasOpen;
    });
  };

  return (
    <section className="card equation-sheet">
      <div className="eqsheet-head">
        <div>
          <h2 className="eqsheet-title">Equation sheet</h2>
          <p className="eqsheet-note">
            Referencing the sheet costs {cost} XP each time you open it.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="eqsheet-body"
        >
          {open ? 'Hide sheet' : `Reference sheet (−${cost} XP)`}
        </button>
      </div>

      {open ? (
        <div id="eqsheet-body" className="eqsheet-body">
          {GROUPS.map((group) => (
            <div className="eqsheet-group" key={group.title}>
              <h3 className="eqsheet-group-title">{group.title}</h3>
              <dl className="eqsheet-list">
                {group.rows.map(([name, formula]) => (
                  <div className="eqsheet-row" key={name}>
                    <dt>{name}</dt>
                    <dd>{formula}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
