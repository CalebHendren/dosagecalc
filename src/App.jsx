import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import ScoreBar from './components/ScoreBar.jsx';
import ProblemCard from './components/ProblemCard.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Footer from './components/Footer.jsx';
import Calculator from './components/Calculator.jsx';
import EquationSheet from './components/EquationSheet.jsx';
import MilestoneNotice from './components/MilestoneNotice.jsx';
import { useSettings } from './context/SettingsContext.jsx';
import { useProblem } from './hooks/useProblem.js';
import { xpForSolve, levelProgress, sheetCostForLevel } from './lib/xp.js';

const INITIAL_SCORE = {
  attempted: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  xp: 0,
  lastDelta: 0, // XP change from the most recent action (+earned / −spent)
};

// The streak fields are persisted so a returning visitor keeps their progress;
// the rest of the score (attempts, XP, last delta) stays per-session.
const STREAK_KEY = 'dosagecalc.streaks';

// Streak length that triggers the "you're competent" milestone notice.
const MILESTONE_STREAK = 100;

function loadInitialScore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    return {
      ...INITIAL_SCORE,
      streak: Number.isFinite(saved.streak) ? saved.streak : 0,
      bestStreak: Number.isFinite(saved.bestStreak) ? saved.bestStreak : 0,
    };
  } catch {
    return { ...INITIAL_SCORE };
  }
}

export default function App() {
  const { settings } = useSettings();
  const [score, setScore] = useState(loadInitialScore);
  const [showMilestone, setShowMilestone] = useState(false);

  // Fire the milestone notice when the streak first reaches 100, re-arming only
  // after the streak drops back below it. A returning visitor whose saved streak
  // is already at/over the milestone starts disarmed, so it does not re-fire on load.
  const milestoneArmedRef = useRef(score.streak < MILESTONE_STREAK);
  useEffect(() => {
    if (score.streak >= MILESTONE_STREAK) {
      if (milestoneArmedRef.current) {
        setShowMilestone(true);
        milestoneArmedRef.current = false;
      }
    } else {
      milestoneArmedRef.current = true;
    }
  }, [score.streak]);

  // Persist the streaks whenever they change so they survive leaving the site.
  useEffect(() => {
    try {
      localStorage.setItem(
        STREAK_KEY,
        JSON.stringify({ streak: score.streak, bestStreak: score.bestStreak }),
      );
    } catch {
      /* storage unavailable — ignore */
    }
  }, [score.streak, score.bestStreak]);

  // `attemptCount` is the attempt number the problem was solved on, so the
  // number of failed attempts is one less. Failed attempts reduce the XP
  // earned; the current streak adds a bonus.
  const onSolved = useCallback((attemptCount = 1) => {
    setScore((s) => {
      const streak = s.streak + 1;
      const earned = xpForSolve(attemptCount - 1, streak);
      return {
        attempted: s.attempted + 1,
        correct: s.correct + 1,
        streak,
        bestStreak: Math.max(s.bestStreak, streak),
        xp: s.xp + earned,
        lastDelta: earned,
      };
    });
  }, []);

  const onExhausted = useCallback(() => {
    setScore((s) => ({ ...s, attempted: s.attempted + 1, streak: 0, lastDelta: 0 }));
  }, []);

  // Spend XP when the equation sheet is referenced; XP never drops below zero.
  const onReferenceSheet = useCallback((cost) => {
    setScore((s) => ({ ...s, xp: Math.max(0, s.xp - cost), lastDelta: -cost }));
  }, []);

  const {
    problem,
    attemptsUsed,
    attemptsRemaining,
    unlimited,
    status,
    revealed,
    lastResult,
    submit,
    reveal,
    newProblem,
  } = useProblem(
    settings.enabledTypes,
    settings.maxAttempts,
    { onSolved, onExhausted },
    settings.weightedMode,
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to practice problem
      </a>
      <div className="app">
        <Header />
        <ScoreBar {...score} />
        <main id="main" tabIndex={-1}>
          <ProblemCard
            problem={problem}
            status={status}
            attemptsUsed={attemptsUsed}
            attemptsRemaining={attemptsRemaining}
            unlimited={unlimited}
            revealed={revealed}
            lastResult={lastResult}
            maxAttempts={settings.maxAttempts}
            onSubmit={submit}
            onReveal={reveal}
            onNew={newProblem}
          />
          <EquationSheet
            cost={sheetCostForLevel(levelProgress(score.xp).level)}
            onReference={onReferenceSheet}
          />
          <SettingsPanel />
        </main>
        <Footer />
      </div>
      <Calculator />
      {showMilestone ? (
        <MilestoneNotice streak={score.streak} onDismiss={() => setShowMilestone(false)} />
      ) : null}
    </>
  );
}
