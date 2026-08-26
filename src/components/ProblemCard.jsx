import { useEffect, useRef, useState } from 'react';
import AnswerInput from './AnswerInput.jsx';
import SolutionSteps from './SolutionSteps.jsx';
import { formatAnswer } from '../lib/format.js';

// Human-readable description of the expected answer format, for screen readers
// (the on-screen prefix/suffix affixes are aria-hidden).
function answerHint(problem) {
  if (problem.answerPrefix) {
    return 'Enter the number that follows "1 :" to complete the ratio.';
  }
  if (problem.unit) {
    return `Enter your answer as a number in ${problem.unit}.`;
  }
  return 'Enter your answer as a number.';
}

export default function ProblemCard({
  problem,
  status,
  attemptsUsed,
  attemptsRemaining,
  unlimited,
  revealed,
  lastResult,
  maxAttempts,
  onSubmit,
  onReveal,
  onNew,
}) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const newBtnRef = useRef(null);

  // Reset the field and focus it whenever a new problem loads.
  useEffect(() => {
    setValue('');
    // Focus the input for immediate typing (skipped on the very first paint to
    // avoid stealing focus from the top of the page for screen-reader users).
    if (inputRef.current && document.activeElement !== document.body) {
      inputRef.current.focus();
    }
  }, [problem]);

  // Move focus to "New problem" once the solution is revealed.
  useEffect(() => {
    if (revealed && newBtnRef.current) {
      newBtnRef.current.focus();
    }
  }, [revealed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = onSubmit(value);
    // Keep and select the value after a wrong-but-valid guess for quick editing.
    if (res && res.valid && !res.correct && inputRef.current) {
      inputRef.current.select();
    }
  };

  const feedback = buildFeedback({ status, lastResult, attemptsRemaining, unlimited });

  return (
    <section className="card" aria-labelledby="problem-heading">
      <span className="problem-category">{problem.category}</span>
      <h2 id="problem-heading" className="problem-prompt">
        {problem.prompt}
      </h2>
      {problem.roundingNote ? <p className="problem-rounding">{problem.roundingNote}</p> : null}

      <form onSubmit={handleSubmit} noValidate>
        <AnswerInput
          ref={inputRef}
          value={value}
          onChange={setValue}
          prefix={problem.answerPrefix}
          suffix={problem.unit}
          disabled={revealed}
          describedBy="answer-hint"
        />
        <p id="answer-hint" className="visually-hidden">
          {answerHint(problem)}
        </p>
      </form>

      {/* Attempts indicator */}
      {!unlimited ? (
        <div className="attempts">
          <span className="attempt-pips" aria-hidden="true">
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <span
                key={i}
                className={`pip ${i < attemptsUsed ? 'used' : 'available'}`}
              />
            ))}
          </span>
          <span>
            {status === 'answering'
              ? `${attemptsRemaining} of ${maxAttempts} attempt${maxAttempts === 1 ? '' : 's'} remaining`
              : `Used ${attemptsUsed} of ${maxAttempts} attempt${maxAttempts === 1 ? '' : 's'}`}
          </span>
        </div>
      ) : (
        <div className="attempts">
          <span>Unlimited attempts</span>
        </div>
      )}

      {/* Live feedback region */}
      <div role="status" aria-live="polite">
        {feedback ? (
          <p className={`feedback ${feedback.kind}`}>
            <span className="icon" aria-hidden="true">
              {feedback.icon}
            </span>
            <span>{feedback.text}</span>
          </p>
        ) : null}
      </div>

      {/* Solution */}
      {revealed ? <SolutionSteps problem={problem} /> : null}

      {/* Actions */}
      <div className="btn-row">
        {revealed ? (
          <button ref={newBtnRef} type="button" className="btn btn-primary" onClick={onNew}>
            New problem
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={onReveal}>
              Reveal solution
            </button>
            <button type="button" className="btn btn-ghost" onClick={onNew}>
              Skip →
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function buildFeedback({ status, lastResult, attemptsRemaining, unlimited }) {
  if (lastResult?.invalid) {
    return { kind: 'info', icon: 'ℹ️', text: 'Enter a number, then select “Check answer”.' };
  }
  if (status === 'solved') {
    return { kind: 'correct', icon: '✓', text: 'Correct! Well done.' };
  }
  if (status === 'exhausted') {
    return {
      kind: 'incorrect',
      icon: '✕',
      text: 'The worked solution is shown below.',
    };
  }
  // Still answering.
  if (lastResult && lastResult.correct === false) {
    const left = unlimited
      ? 'Try again.'
      : `${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining. Try again.`;
    return { kind: 'incorrect', icon: '✕', text: `Not quite. ${left}` };
  }
  return null;
}
