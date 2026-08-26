import { round } from './random.js';

// Format a number for display: round to `decimals`, then strip trailing zeros
// so "2.50" shows as "2.5" and "12.00" shows as "12".
export function fmt(value, decimals = 2) {
  if (!Number.isFinite(value)) return String(value);
  const r = round(value, decimals);
  // toFixed then trim trailing zeros and any dangling decimal point.
  let s = r.toFixed(decimals);
  if (s.includes('.')) {
    s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  return s;
}

// Format with an explicit unit suffix, e.g. "3.36 mL".
export function fmtUnit(value, unit, decimals = 2) {
  return `${fmt(value, decimals)} ${unit}`;
}

// Build the full display string for a problem's answer, including any ratio
// prefix (e.g. "1 : ") and unit suffix (e.g. " %").
export function formatAnswer(problem) {
  const prefix = problem.answerPrefix || '';
  const num = fmt(problem.answer, problem.precision ?? 2);
  const suffix = problem.unit ? ` ${problem.unit}` : '';
  return `${prefix}${num}${suffix}`;
}
