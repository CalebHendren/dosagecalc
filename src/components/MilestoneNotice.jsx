import { useEffect, useRef } from 'react';

// Celebratory notice shown when the user reaches a 100-answer streak. Rendered
// as a dismissible dialog with an accessible role so screen readers announce
// it. Focus moves to the dismiss button while it is open.
export default function MilestoneNotice({ streak, onDismiss }) {
  const dismissRef = useRef(null);

  useEffect(() => {
    dismissRef.current?.focus();
  }, []);

  // Allow Escape to close.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  return (
    <div className="milestone-backdrop" onClick={onDismiss}>
      <div
        className="milestone-card"
        role="alertdialog"
        aria-labelledby="milestone-title"
        aria-describedby="milestone-body"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="milestone-emoji" aria-hidden="true">
          🎉
        </p>
        <h2 id="milestone-title" className="milestone-title">
          {streak} in a row!
        </h2>
        <p id="milestone-body" className="milestone-body">
          You’re competent. That’s a serious streak — but don’t stop now. Keep
          practicing right up until after your exam so it stays sharp.
        </p>
        <button
          ref={dismissRef}
          type="button"
          className="btn btn-primary"
          onClick={onDismiss}
        >
          Keep practicing
        </button>
      </div>
    </div>
  );
}
