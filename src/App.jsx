import { useCallback, useState } from 'react';
import Header from './components/Header.jsx';
import ScoreBar from './components/ScoreBar.jsx';
import ProblemCard from './components/ProblemCard.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Footer from './components/Footer.jsx';
import Calculator from './components/Calculator.jsx';
import { useSettings } from './context/SettingsContext.jsx';
import { useProblem } from './hooks/useProblem.js';

const INITIAL_SCORE = { attempted: 0, correct: 0, streak: 0, bestStreak: 0 };

export default function App() {
  const { settings } = useSettings();
  const [score, setScore] = useState(INITIAL_SCORE);

  const onSolved = useCallback(() => {
    setScore((s) => {
      const streak = s.streak + 1;
      return {
        attempted: s.attempted + 1,
        correct: s.correct + 1,
        streak,
        bestStreak: Math.max(s.bestStreak, streak),
      };
    });
  }, []);

  const onExhausted = useCallback(() => {
    setScore((s) => ({ ...s, attempted: s.attempted + 1, streak: 0 }));
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
          <SettingsPanel />
        </main>
        <Footer />
      </div>
      <Calculator />
    </>
  );
}
