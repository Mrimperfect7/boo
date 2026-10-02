import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type ReaderSettings } from '../types/magazine';

const STORAGE_KEY = 'meridian.reader.settings.v1';

function read(): ReaderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      sound: parsed.sound ?? DEFAULT_SETTINGS.sound,
      volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULT_SETTINGS.volume,
      motion: parsed.motion ?? DEFAULT_SETTINGS.motion,
      view: parsed.view ?? DEFAULT_SETTINGS.view,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Reading preferences, persisted across sessions. */
export function useSettings(): {
  settings: ReaderSettings;
  update: (patch: Partial<ReaderSettings>) => void;
} {
  const [settings, setSettings] = useState<ReaderSettings>(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable — preferences stay in memory */
    }
  }, [settings]);

  const update = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((previous) => ({ ...previous, ...patch }));
  }, []);

  return { settings, update };
}
