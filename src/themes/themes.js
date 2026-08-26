// Theme catalogue. Each theme id corresponds to a `[data-theme="id"]` block in
// themes.css. Colors there are chosen to meet WCAG 2.1 AA contrast for text.

export const LIGHT_THEMES = [
  { id: 'daylight', name: 'Daylight' },
  { id: 'solarized-light', name: 'Solarized Light' },
  { id: 'github-light', name: 'GitHub Light' },
];

export const DARK_THEMES = [
  { id: 'dracula', name: 'Dracula' },
  { id: 'nord', name: 'Nord' },
  { id: 'solarized-dark', name: 'Solarized Dark' },
];

export const DEFAULT_LIGHT_THEME = 'daylight';
export const DEFAULT_DARK_THEME = 'dracula';

// Map every theme id to the mode it belongs to.
export const THEME_MODE = {};
for (const t of LIGHT_THEMES) THEME_MODE[t.id] = 'light';
for (const t of DARK_THEMES) THEME_MODE[t.id] = 'dark';

export function themeForMode(mode, lightTheme, darkTheme) {
  return mode === 'dark'
    ? darkTheme || DEFAULT_DARK_THEME
    : lightTheme || DEFAULT_LIGHT_THEME;
}
