// Answer checking that is forgiving of the rounding students actually do,
// without accepting answers produced by the wrong method.
//
// A problem provides:
//   answer     - the exact numeric answer
//   precision  - number of decimals the answer is displayed to
//   tolerance  - (optional) explicit absolute tolerance override
//
// An input is accepted when it falls within an absolute tolerance equal to the
// largest of:
//   - an explicit per-problem tolerance, when given
//   - half a unit in the last displayed decimal place (so any input that
//     rounds to the shown answer is correct)
//   - a 1% relative band (covers reasonable intermediate rounding)

const DEFAULT_RELATIVE_TOLERANCE = 0.01;

// Parse a free-form numeric answer. Accepts things like "2.31", "2.31 %",
// "1:50" (uses the part after the colon), "1,234.5", " 3.36 mL".
export function parseNumericInput(raw) {
  if (raw == null) return NaN;
  let s = String(raw).trim();
  if (s === '') return NaN;
  // For ratio answers written "1:50", grade the number after the colon.
  if (s.includes(':')) {
    const parts = s.split(':');
    s = parts[parts.length - 1];
  }
  // Remove thousands separators, unit words, percent signs, and spaces.
  s = s.replace(/,/g, '');
  s = s.replace(/[^0-9.\-+eE]/g, '');
  if (s === '' || s === '.' || s === '-' || s === '+') return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export function toleranceFor(problem) {
  const precision = problem.precision ?? 2;
  const halfUlp = 0.5 * Math.pow(10, -precision);
  const relative = Math.abs(problem.answer) * DEFAULT_RELATIVE_TOLERANCE;
  const floor = Math.max(halfUlp, relative);
  if (typeof problem.tolerance === 'number') {
    return Math.max(problem.tolerance, halfUlp);
  }
  return floor;
}

// Returns { valid, correct, parsed, tolerance }.
export function checkAnswer(problem, raw) {
  const parsed = parseNumericInput(raw);
  if (Number.isNaN(parsed)) {
    return { valid: false, correct: false, parsed: NaN, tolerance: 0 };
  }
  const tolerance = toleranceFor(problem);
  const correct = Math.abs(parsed - problem.answer) <= tolerance + Number.EPSILON;
  return { valid: true, correct, parsed, tolerance };
}
