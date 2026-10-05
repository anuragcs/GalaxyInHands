import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, type AppSettings, type TleEntry } from '@/data/types';

const SETTINGS_KEY = 'gih.settings.v1';
const TLE_KEY = 'gih.tle.v1';

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadCachedTles(): Promise<{ fetchedAt: number; entries: TleEntry[] } | null> {
  try {
    const raw = await AsyncStorage.getItem(TLE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { fetchedAt: number; entries: TleEntry[] };
  } catch {
    return null;
  }
}

export async function saveCachedTles(entries: TleEntry[]): Promise<void> {
  await AsyncStorage.setItem(TLE_KEY, JSON.stringify({ fetchedAt: Date.now(), entries }));
}
