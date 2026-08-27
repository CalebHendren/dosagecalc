import { useCallback, useEffect, useRef, useState } from 'react';
import { generateProblem } from '../lib/generators/index.js';
import { checkAnswer } from '../lib/checkAnswer.js';
import { updateWeights } from '../lib/weighting.js';

const WEIGHTS_KEY = 'dosagecalc.weights';

function loadWeights() {
  try {
    const saved = JSON.parse(localStorage.getItem(WEIGHTS_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

function saveWeights(weights) {
  try {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
  } catch {
    /* storage unavailable — ignore */
  }
}

// Manages the current problem, attempts, and reveal state. A fresh problem is
// created on mount (so reloading the page always yields a new problem) and
// whenever `newProblem` is called or the set of enabled types changes.
// `handlers` may provide onSolved / onExhausted, fired once per conclusion.
// When `weighted` is true, the next problem's type is biased by per-type
// weights that shift as the user gets each type right or wrong (see weighting.js).
export function useProblem(enabledTypes, maxAttempts, handlers = {}, weighted = false) {
  const prevTypeRef = useRef(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // Per-type selection weights, persisted so adaptive difficulty carries across
  // sessions. Held in a ref because they only need to be read when the next
  // problem is generated, not to drive rendering.
  const weightsRef = useRef(loadWeights());
  const weightedRef = useRef(weighted);
  weightedRef.current = weighted;

  // Fold a concluded problem's outcome into the weights (and persist).
  const recordOutcome = useCallback(
    (type, correct) => {
      weightsRef.current = updateWeights(weightsRef.current, type, correct, enabledTypes);
      saveWeights(weightsRef.current);
    },
    [enabledTypes],
  );

  const make = useCallback(() => {
    const p = generateProblem(
      enabledTypes,
      prevTypeRef.current,
      weightedRef.current ? weightsRef.current : undefined,
    );
    prevTypeRef.current = p.type;
    return p;
  }, [enabledTypes]);

  const [problem, setProblem] = useState(make);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [status, setStatus] = useState('answering'); // 'answering' | 'solved' | 'exhausted'
  const [lastResult, setLastResult] = useState(null); // { correct, parsed }

  const newProblem = useCallback(() => {
    setProblem(make());
    setAttemptsUsed(0);
    setStatus('answering');
    setLastResult(null);
  }, [make]);

  // Regenerate when the enabled set changes so the shown problem stays in-scope.
  const enabledKey = enabledTypes.join('|');
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    newProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledKey]);

  const unlimited = !maxAttempts || maxAttempts <= 0;

  const submit = useCallback(
    (raw) => {
      if (status !== 'answering') return null;
      const result = checkAnswer(problem, raw);
      if (!result.valid) {
        setLastResult({ correct: false, invalid: true });
        return result;
      }
      if (result.correct) {
        setLastResult({ correct: true, parsed: result.parsed });
        setStatus('solved');
        recordOutcome(problem.type, true);
        handlersRef.current.onSolved?.(attemptsUsed + 1);
        return result;
      }
      const used = attemptsUsed + 1;
      setAttemptsUsed(used);
      setLastResult({ correct: false, parsed: result.parsed });
      if (!unlimited && used >= maxAttempts) {
        setStatus('exhausted');
        recordOutcome(problem.type, false);
        handlersRef.current.onExhausted?.();
      }
      return result;
    },
    [problem, status, attemptsUsed, maxAttempts, unlimited, recordOutcome],
  );

  // "Give up": reveal the solution immediately (counts as a miss).
  const reveal = useCallback(() => {
    if (status !== 'answering') return;
    if (!unlimited) setAttemptsUsed(maxAttempts);
    setStatus('exhausted');
    recordOutcome(problem.type, false);
    handlersRef.current.onExhausted?.();
  }, [status, unlimited, maxAttempts, problem, recordOutcome]);

  const attemptsRemaining = unlimited ? Infinity : Math.max(0, maxAttempts - attemptsUsed);
  const revealed = status === 'solved' || status === 'exhausted';

  return {
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
  };
}
