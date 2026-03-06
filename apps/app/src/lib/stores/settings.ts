import { writable } from 'svelte/store';

export type ColorScheme = 'light' | 'dark' | 'system';
export type TileAppearanceMode = 'color' | 'lines' | 'colorAndLines';

const SETTINGS_KEY = 'flip-settings';

interface Settings {
	colorScheme: ColorScheme;
	tileAppearanceMode: TileAppearanceMode;
}

const defaults: Settings = {
  colorScheme: 'system',
  tileAppearanceMode: 'colorAndLines'
};

function load(): Settings {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      colorScheme: parsed.colorScheme ?? defaults.colorScheme,
      tileAppearanceMode: parsed.tileAppearanceMode ?? defaults.tileAppearanceMode
    };
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
