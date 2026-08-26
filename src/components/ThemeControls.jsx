import { useSettings } from '../context/SettingsContext.jsx';
import { LIGHT_THEMES, DARK_THEMES } from '../themes/themes.js';

// Appearance controls shown in the header: a System / Light / Dark mode toggle
// and a theme selector grouped by mode.
export default function ThemeControls() {
  const { settings, setMode, setThemeForCurrentMode, activeTheme } = useSettings();

  return (
    <div className="header-controls">
      <div
        className="mode-toggle"
        role="group"
        aria-label="Appearance mode"
      >
        {['system', 'light', 'dark'].map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={settings.mode === m}
            onClick={() => setMode(m)}
          >
            {m === 'system' ? 'System' : m === 'light' ? 'Light' : 'Dark'}
          </button>
        ))}
      </div>

      <label className="visually-hidden" htmlFor="theme-select">
        Color theme
      </label>
      <select
        id="theme-select"
        className="select"
        value={activeTheme}
        onChange={(e) => setThemeForCurrentMode(e.target.value)}
      >
        <optgroup label="Light themes">
          {LIGHT_THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="Dark themes">
          {DARK_THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
