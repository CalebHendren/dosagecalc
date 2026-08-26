// Session score summary. Values reset on page reload (each visit is a fresh
// practice session).
export default function ScoreBar({ attempted, correct, streak, bestStreak }) {
  const pct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  return (
    <div className="scorebar" role="group" aria-label="Session score">
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
