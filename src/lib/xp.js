// Experience-points (XP) rules for the practice session.
//
// A solved problem earns a base amount, reduced by each failed attempt on that
// problem, with a floor so a hard-won solve is still worth something. A streak
// of consecutive correct answers adds a bonus, capped so it stays modest.
// Referencing the equation sheet spends XP (see EquationSheet), and XP never
// drops below zero.

export const XP_RULES = {
  base: 100, // XP for a first-try solve with no streak
  failPenalty: 25, // XP lost per failed attempt on the solved problem
  floor: 10, // minimum XP a solve can earn
  streakBonus: 10, // XP added per prior consecutive solve
  streakBonusCap: 100, // ceiling on the streak bonus
  sheetCost: 20, // XP spent each time the equation sheet is opened
  perLevel: 500, // XP needed to advance one level
};

// XP earned for a solve. `failedAttempts` is the number of wrong guesses before
// the correct one; `streakAfter` is the streak count including this solve.
export function xpForSolve(failedAttempts, streakAfter) {
  const solve = Math.max(
    XP_RULES.floor,
    XP_RULES.base - XP_RULES.failPenalty * Math.max(0, failedAttempts),
  );
  const bonus = Math.min(
    XP_RULES.streakBonusCap,
    Math.max(0, streakAfter - 1) * XP_RULES.streakBonus,
  );
  return solve + bonus;
}

// XP cost to reference the equation sheet, scaled by level: the further you
// progress, the more a peek costs. Level 1 costs the base; each level adds
// another base's worth.
export function sheetCostForLevel(level) {
  return XP_RULES.sheetCost * Math.max(1, level);
}

// Level and progress toward the next level for a given total XP.
export function levelProgress(xp) {
  const safe = Math.max(0, xp);
  const level = Math.floor(safe / XP_RULES.perLevel) + 1;
  const into = safe % XP_RULES.perLevel;
  return {
    level,
    into,
    size: XP_RULES.perLevel,
    pct: Math.round((into / XP_RULES.perLevel) * 100),
  };
}
