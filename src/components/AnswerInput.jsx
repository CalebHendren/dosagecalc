import { forwardRef } from 'react';

// A labelled numeric answer field with optional prefix (e.g. "1 :" for ratios)
// and suffix (the unit). Uses inputMode="decimal" for a numeric mobile keypad.
const AnswerInput = forwardRef(function AnswerInput(
  { value, onChange, prefix, suffix, disabled, describedBy },
  ref,
) {
  return (
    <div className="answer-form">
      <label className="answer-label" htmlFor="answer-input">
        Your answer
      </label>
      <div className="answer-row">
        <div className="answer-field">
          {prefix ? (
            <span className="answer-affix prefix" aria-hidden="true">
              {prefix}
            </span>
          ) : null}
          <input
            id="answer-input"
            ref={ref}
            className="answer-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-describedby={describedBy}
          />
          {suffix ? (
            <span className="answer-affix suffix" aria-hidden="true">
              {suffix}
            </span>
          ) : null}
        </div>
        <button type="submit" className="btn btn-primary" disabled={disabled || value.trim() === ''}>
          Check answer
        </button>
      </div>
    </div>
  );
});

export default AnswerInput;
