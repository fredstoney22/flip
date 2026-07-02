import { writable } from 'svelte/store';
import {
  locales as paraglideLocales,
  cookieName as paraglideCookieName,
  setLocale as setParaglideLocale
} from '$lib/paraglide/runtime';

export type ColorScheme = 'light' | 'dark' | 'system';
export type TileAppearanceMode = 'color' | 'lines' | 'colorAndLines';
/** A locale Paraglide can render. */
export type Locale = (typeof paraglideLocales)[number];
/** `'auto'` means "detect from Accept-Language" — no explicit user choice yet. */
export type LocalePreference = Locale | 'auto';

const SETTINGS_KEY = 'flip-settings';
const SETTINGS_VERSION = 1;

interface Settings {
	settingsVersion: number;
	colorScheme: ColorScheme;
	tileAppearanceMode: TileAppearanceMode;
	locale: LocalePreference;
}

const defaults: Settings = {
  settingsVersion: SETTINGS_VERSION,
  colorScheme: 'system',
  tileAppearanceMode: 'color',
  locale: 'auto'
};

function load(): Settings {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const storedVersion = parsed.settingsVersion ?? 0;
    let tileAppearanceMode = parsed.tileAppearanceMode ?? defaults.tileAppearanceMode;

    // colorAndLines used to be the implicit default; migrate to colors-only.
    if (storedVersion < SETTINGS_VERSION && tileAppearanceMode === 'colorAndLines') {
      tileAppearanceMode = 'color';
    }

    const next: Settings = {
      settingsVersion: SETTINGS_VERSION,
      colorScheme: parsed.colorScheme ?? defaults.colorScheme,
      tileAppearanceMode,
      locale: parsed.locale ?? defaults.locale
    };

    if (storedVersion < SETTINGS_VERSION) {
      save(next);
    }

    return next;
  } catch {
    return defaults;
  }
}

function save(settings: Settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/** Clears the Paraglide locale cookie so the server falls back to Accept-Language detection. */
function clearLocaleOverride() {
  if (typeof document === 'undefined') return;
  document.cookie = `${paraglideCookieName}=; Max-Age=0; path=/`;
}

function createSettingsStore() {
  const initial = load();
  const { subscribe, update } = writable<Settings>(initial);

  // Re-assert the cookie on load so an explicit choice survives a cleared cookie jar
  // (localStorage persists across cookie clears) and SSR sees the same locale as
  // the last render. Paraglide's own setLocale() handles writing the cookie.
  if (initial.locale !== 'auto') {
    setParaglideLocale(initial.locale, { reload: false });
  }

  return {
    subscribe,
    setColorScheme(value: ColorScheme) {
      update((s) => {
        const next = { ...s, colorScheme: value };
        save(next);
        return next;
      });
    },
    setTileAppearanceMode(value: TileAppearanceMode) {
      update((s) => {
        const next = { ...s, tileAppearanceMode: value };
        save(next);
        return next;
      });
    },
    setLocale(value: LocalePreference) {
      update((s) => {
        const next = { ...s, locale: value };
        save(next);
        return next;
      });
      if (value === 'auto') {
        clearLocaleOverride();
      } else {
        setParaglideLocale(value, { reload: false });
      }
    }
  };
}

export const settings = createSettingsStore();
