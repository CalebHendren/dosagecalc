import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  DEFAULT_DARK_THEME,
  DEFAULT_LIGHT_THEME,
  THEME_MODE,
  themeForMode,
} from '../themes/themes.js';
import { ALL_GENERATOR_IDS } from '../lib/generators/index.js';

const STORAGE_KEY = 'dosagecalc.settings';

const DEFAULT_SETTINGS = {
  mode: 'system', // 'system' | 'light' | 'dark'
  lightTheme: DEFAULT_LIGHT_THEME,
  darkTheme: DEFAULT_DARK_THEME,
  maxAttempts: 3, // 0 means unlimited
  enabledTypes: [...ALL_GENERATOR_IDS],
  weightedMode: false, // adaptive: bias selection toward missed types
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    // Merge with defaults so new fields/generators are picked up gracefully.
    const enabled = Array.isArray(parsed.enabledTypes)
      ? parsed.enabledTypes.filter((id) => ALL_GENERATOR_IDS.includes(id))
      : DEFAULT_SETTINGS.enabledTypes;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      enabledTypes: enabled.length > 0 ? enabled : [...ALL_GENERATOR_IDS],
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function prefersDark() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);
  // Track the OS preference so "system" mode reacts live.
  const [systemDark, setSystemDark] = useState(prefersDark);

  // Persist whenever settings change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [settings]);

  // Listen for OS light/dark changes.
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // The effective light/dark mode after resolving "system".
  const resolvedMode = settings.mode === 'system' ? (systemDark ? 'dark' : 'light') : settings.mode;

  const activeTheme = themeForMode(resolvedMode, settings.lightTheme, settings.darkTheme);

  // Apply the theme to <html> for CSS variables + native form colors.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.documentElement.style.colorScheme = resolvedMode;
  }, [activeTheme, resolvedMode]);

  const update = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setMode = useCallback((mode) => update({ mode }), [update]);

  const setThemeForCurrentMode = useCallback(
    (themeId) => {
      const themeMode = THEME_MODE[themeId];
      if (themeMode === 'dark') update({ darkTheme: themeId, mode: 'dark' });
      else update({ lightTheme: themeId, mode: 'light' });
    },
    [update],
  );

  const value = useMemo(
    () => ({
      settings,
      update,
      setMode,
      setThemeForCurrentMode,
      resolvedMode,
      activeTheme,
    }),
    [settings, update, setMode, setThemeForCurrentMode, resolvedMode, activeTheme],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
