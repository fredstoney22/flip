import { writable } from 'svelte/store';

export type ColorScheme = 'light' | 'dark' | 'system';
export type TileAppearanceMode = 'color' | 'lines' | 'colorAndLines';

const SETTINGS_KEY = 'flip-settings';
const SETTINGS_VERSION = 1;

interface Settings {
	settingsVersion: number;
	colorScheme: ColorScheme;
	tileAppearanceMode: TileAppearanceMode;
}

const defaults: Settings = {
  settingsVersion: SETTINGS_VERSION,
  colorScheme: 'system',
  tileAppearanceMode: 'color'
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
      tileAppearanceMode
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

function createSettingsStore() {
  const { subscribe, update } = writable<Settings>(load());

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
    }
  };
}

export const settings = createSettingsStore();
