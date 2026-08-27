// Adaptive weighting for problem-type selection ("weighted mode").
//
// Each problem type carries a weight that biases how often it is chosen. A
// correct answer lowers that type's weight (you see it less); a miss raises it
// (you see it more). On every conclusion, all weights also decay a little back
// toward the baseline, so a type you have not practiced in a while gradually
// becomes common again while the types you keep getting right stay rare.

export const WEIGHT_RULES = {
  base: 1, // baseline weight every type decays toward
  correctFactor: 0.55, // multiply a type's weight by this on a correct answer
  missFactor: 1.7, // multiply a type's weight by this on a miss
  min: 0.2, // floor so a mastered type never fully disappears
  max: 5, // ceiling so a missed type never dominates entirely
  decay: 0.1, // fraction of the gap to base removed each conclusion
};

function clamp(w) {
  return Math.min(WEIGHT_RULES.max, Math.max(WEIGHT_RULES.min, w));
}

// One weight nudged back toward the baseline.
function decayToward(weight) {
  const { base, decay } = WEIGHT_RULES;
  return weight + (base - weight) * decay;
}

// Build a fresh weight map (all baseline) for the given type ids.
export function initWeights(ids = []) {
  const weights = {};
  for (const id of ids) weights[id] = WEIGHT_RULES.base;
  return weights;
}

// Return a new weight map after concluding `id` correctly or not. Every known
// type decays toward the baseline first (recovery), then the concluded type
// takes its sharp correct/miss adjustment. Unknown ids passed in `ensureIds`
// are seeded at the baseline so newly enabled types participate.
export function updateWeights(weights, id, correct, ensureIds = []) {
  const next = {};
  const ids = new Set([...Object.keys(weights), ...ensureIds, id]);
  for (const key of ids) {
    const current = Number.isFinite(weights[key]) ? weights[key] : WEIGHT_RULES.base;
    next[key] = decayToward(current);
  }
  const factor = correct ? WEIGHT_RULES.correctFactor : WEIGHT_RULES.missFactor;
  next[id] = clamp(next[id] * factor);
  return next;
}

// Weighted random choice over `ids`. `weights[id]` defaults to the baseline.
// `randFn` returns a float in [0, 1); it is injectable for testing.
export function pickWeighted(ids, weights = {}, randFn = Math.random) {
  if (ids.length === 0) return undefined;
  const entries = ids.map((id) => [id, Math.max(0, weights[id] ?? WEIGHT_RULES.base)]);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  if (total <= 0) return ids[Math.floor(randFn() * ids.length)] ?? ids[ids.length - 1];
  let threshold = randFn() * total;
  for (const [id, w] of entries) {
    threshold -= w;
    if (threshold < 0) return id;
  }
  return entries[entries.length - 1][0];
}
