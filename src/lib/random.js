// Small deterministic-friendly random helpers used by the problem generators.
// Everything funnels through `rng()` so a seeded generator could be dropped in
// later; today it just wraps Math.random.

export function rng() {
  return Math.random();
}

// Random integer in [min, max] inclusive.
export function randInt(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// Random multiple of `step` within [min, max] inclusive. Useful for keeping
// generated numbers "sensible" (e.g. weights in 5 lb steps, volumes in whole
// mL) instead of arbitrary decimals.
export function randStep(min, max, step) {
  const steps = Math.floor((max - min) / step);
  return round(min + randInt(0, steps) * step, 6);
}

// Pick a random element from an array.
export function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

// Round to a fixed number of decimal places, avoiding binary-float artifacts
// like 2.30000000000004.
export function round(value, decimals = 2) {
  if (!Number.isFinite(value)) return value;
  const f = Math.pow(10, decimals);
  // The +Number.EPSILON nudge fixes classic cases such as round(1.005, 2).
  return Math.round((value + Number.EPSILON) * f) / f;
}

// Greatest common divisor for integer ratio reduction.
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}
