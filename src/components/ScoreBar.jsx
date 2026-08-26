import { levelProgress } from '../lib/xp.js';

// Session score summary. Values reset on page reload (each visit is a fresh
// practice session).
export default function ScoreBar({ attempted, correct, streak, bestStreak, xp = 0, lastDelta = 0 }) {
  const pct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const { level, into, size, pct: levelPct } = levelProgress(xp);

  return (
    <div className="scorebar" role="group" aria-label="Session score">
      <div className="xp-block">
        <span className="xp-line">
          <span className="xp-level">Level {level}</span>
          <span className="xp-value">
            <strong>{xp}</strong> XP
          </span>
          {lastDelta !== 0 ? (
            <span className={`xp-delta ${lastDelta > 0 ? 'gain' : 'loss'}`}>
              {lastDelta > 0 ? `+${lastDelta}` : lastDelta} XP
            </span>
          ) : null}
        </span>
        <span
          className="xp-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={size}
          aria-valuenow={into}
          aria-label={`Progress to level ${level + 1}`}
        >
          <span className="xp-fill" style={{ width: `${levelPct}%` }} />
        </span>
      </div>
      <span>
        Solved: <strong>{correct}</strong> / {attempted}
        {attempted > 0 ? ` (${pct}%)` : ''}
      </span>
      <span>
        Current streak: <strong>{streak}</strong>
      </span>
      <span>
        Best streak: <strong>{bestStreak}</strong>
      </span>
    </div>
  );
}
