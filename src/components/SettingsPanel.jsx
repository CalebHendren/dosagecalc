import { useSettings } from '../context/SettingsContext.jsx';
import { GENERATORS, CATEGORIES } from '../lib/generators/index.js';

const ATTEMPT_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

export default function SettingsPanel() {
  const { settings, update } = useSettings();
  const enabled = new Set(settings.enabledTypes);

  const setAttempts = (raw) => {
    const val = raw === 'unlimited' ? 0 : Number(raw);
    update({ maxAttempts: val });
  };

  const toggleType = (id) => {
    const next = new Set(enabled);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update({ enabledTypes: [...next] });
  };

  const setGroup = (category, on) => {
    const ids = GENERATORS.filter((g) => g.category === category).map((g) => g.id);
    const next = new Set(enabled);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    update({ enabledTypes: [...next] });
  };

  const setAll = (on) => {
    update({ enabledTypes: on ? GENERATORS.map((g) => g.id) : [] });
  };

  const noneSelected = enabled.size === 0;

  return (
    <details className="card settings">
      <summary aria-label="Practice settings">
        <span className="chevron" aria-hidden="true">
          ▶
        </span>{' '}
        Settings
      </summary>

      <div className="settings-body">
        {/* Attempts */}
        <div className="field">
          <label htmlFor="attempts-select">Attempts allowed per problem</label>
          <select
            id="attempts-select"
            className="select"
            value={settings.maxAttempts === 0 ? 'unlimited' : String(settings.maxAttempts)}
            onChange={(e) => setAttempts(e.target.value)}
          >
            {ATTEMPT_OPTIONS.map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
            <option value="unlimited">Unlimited</option>
          </select>
          <span className="hint">
            The worked solution appears once you answer correctly or run out of attempts.
          </span>
        </div>

        {/* Problem types */}
        <div className="field">
          <span id="types-label" style={{ fontWeight: 600 }}>
            Problem types
          </span>
          <span className="hint">
            Choose which kinds of problems to practice.{' '}
            {noneSelected ? 'None selected — all types will be used.' : null}
          </span>
          <div className="type-group-actions">
            <button type="button" className="link-button" onClick={() => setAll(true)}>
              Select all
            </button>
            <button type="button" className="link-button" onClick={() => setAll(false)}>
              Clear all
            </button>
          </div>

          <div className="type-groups" role="group" aria-labelledby="types-label">
            {CATEGORIES.map((category) => {
              const gens = GENERATORS.filter((g) => g.category === category);
              return (
                <fieldset key={category} className="type-group" style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="type-group-title">{category}</legend>
                  <div className="type-list">
                    {gens.map((g) => (
                      <label key={g.id} className="checkbox">
                        <input
                          type="checkbox"
                          checked={enabled.has(g.id)}
                          onChange={() => toggleType(g.id)}
                        />
                        <span>{g.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="type-group-actions">
                    <button type="button" className="link-button" onClick={() => setGroup(category, true)}>
                      All
                    </button>
                    <button type="button" className="link-button" onClick={() => setGroup(category, false)}>
                      None
                    </button>
                  </div>
                </fieldset>
              );
            })}
          </div>
        </div>
      </div>
    </details>
  );
}
