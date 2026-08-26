import { useCallback, useState } from 'react';
import Header from './components/Header.jsx';
import ScoreBar from './components/ScoreBar.jsx';
import ProblemCard from './components/ProblemCard.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Footer from './components/Footer.jsx';
import Calculator from './components/Calculator.jsx';
import EquationSheet from './components/EquationSheet.jsx';
import { useSettings } from './context/SettingsContext.jsx';
import { useProblem } from './hooks/useProblem.js';
import { XP_RULES, xpForSolve } from './lib/xp.js';

const INITIAL_SCORE = {
  attempted: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  xp: 0,
  lastDelta: 0, // XP change from the most recent action (+earned / −spent)
};

export default function App() {
  const { settings } = useSettings();
  const [score, setScore] = useState(INITIAL_SCORE);

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
  } = useProblem(settings.enabledTypes, settings.maxAttempts, { onSolved, onExhausted });

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
          <EquationSheet cost={XP_RULES.sheetCost} onReference={onReferenceSheet} />
          <SettingsPanel />
        </main>
        <Footer />
      </div>
      <Calculator />
    </>
  );
}
