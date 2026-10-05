import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as Location from 'expo-location';
import { DEFAULT_SETTINGS, type AppSettings, type GeoLocation, type SkyObject, type TleEntry } from '@/data/types';
import { computeBlackHoles, computeSolarSystem, computeStars, moonAzimuth, sunAzimuth } from '@/services/astronomy';
import { computeConstellations } from '@/services/constellations';
import { computeSatellites, fetchTleCatalog, nextIssPass, type PassWindow } from '@/services/satellites';
import { loadSettings, saveSettings } from '@/services/storage';

type SkyContextValue = {
  now: Date;
  location: GeoLocation | null;
  locationLabel: string;
  locationError: string | null;
  settings: AppSettings;
  objects: SkyObject[];
  allStars: SkyObject[];
  tles: TleEntry[];
  tleStatus: string;
  issPass: PassWindow | null;
  loading: boolean;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  refreshTles: () => Promise<void>;
  calibrateWith: (target: 'sun' | 'moon', heading: number) => Promise<void>;
  findObject: (id: string) => SkyObject | undefined;
};

const SkyContext = createContext<SkyContextValue | null>(null);

export function SkyProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationLabel, setLocationLabel] = useState('Locating…');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [tles, setTles] = useState<TleEntry[]>([]);
  const [tleStatus, setTleStatus] = useState('Loading satellite orbits…');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void (async () => {
      const stored = await loadSettings();
      setSettings(stored);
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationError('Location permission is needed for accurate sky positions.');
        setLocationLabel('Permission needed');
        setLoading(false);
        return;
      }
      try {
        const last = await Location.getLastKnownPositionAsync();
        const fresh = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), 6000);
          }),
        ]);
        const pos = fresh ?? last;
        if (!pos) {
          throw new Error('location timeout');
        }
        const next = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude ?? 0,
        };
        setLocation(next);
        setLocationError(null);
        try {
          const places = await Location.reverseGeocodeAsync({
            latitude: next.latitude,
            longitude: next.longitude,
          });
          const place = places[0];
          setLocationLabel(
            [place?.city, place?.region, place?.isoCountryCode].filter(Boolean).join(', ') || 'Current location',
          );
        } catch {
          setLocationLabel('Current location');
        }
      } catch {
        setLocationError('Could not read GPS. Positions will be wrong until location is available.');
        setLocationLabel('GPS unavailable');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshTles = useCallback(async () => {
    setTleStatus('Refreshing TLE orbits from CelesTrak…');
    try {
      const entries = await fetchTleCatalog(true);
      setTles(entries);
      setTleStatus(`${entries.length} satellites loaded`);
    } catch {
      setTleStatus('Could not reach CelesTrak. Using cache if available.');
      const cached = await fetchTleCatalog(false);
      setTles(cached);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const entries = await fetchTleCatalog(false);
        setTles(entries);
        setTleStatus(`${entries.length} satellites loaded`);
      } catch {
        setTleStatus('Satellite feed unavailable');
      }
    })();
  }, []);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  }, []);

  const calibrateWith = useCallback(
    async (target: 'sun' | 'moon', heading: number) => {
      if (!location) return;
      const trueAz = target === 'sun' ? sunAzimuth(new Date(), location) : moonAzimuth(new Date(), location);
      let delta = trueAz - heading + settings.compassOffset;
      while (delta > 180) delta -= 360;
      while (delta < -180) delta += 360;
      await updateSettings({ compassOffset: Math.round(delta * 10) / 10 });
    },
    [location, settings.compassOffset, updateSettings],
  );

  const allStars = useMemo(() => {
    if (!location) return [];
    return computeStars(now, location, 6);
  }, [location, now]);

  const objects = useMemo(() => {
    if (!location) return [];
    const planets = settings.showPlanets ? computeSolarSystem(now, location) : [];
    const stars = settings.showStars
      ? allStars.filter((star) => (star.mag ?? 99) <= settings.minMagnitude)
      : [];
    const holes = settings.showBlackHoles ? computeBlackHoles(now, location) : [];
    const sats = settings.showSatellites ? computeSatellites(tles, now, location, settings.maxSatellites) : [];
    const consts = settings.showConstellations ? computeConstellations(allStars) : [];
    return [...planets, ...stars, ...holes, ...sats, ...consts];
  }, [location, now, settings, tles, allStars]);

  const issPass = useMemo(() => {
    if (!location || tles.length === 0) return null;
    return nextIssPass(tles, location, new Date(), 12);
  }, [location, tles]);

  const findObject = useCallback(
    (id: string) =>
      objects.find((item) => item.id === id) ??
      allStars.find((item) => item.id === id) ??
      computeConstellations(allStars).find((item) => item.id === id),
    [objects, allStars],
  );

  const value = useMemo(
    () => ({
      now,
      location,
      locationLabel,
      locationError,
      settings,
      objects,
      allStars,
      tles,
      tleStatus,
      issPass,
      loading,
      updateSettings,
      refreshTles,
      calibrateWith,
      findObject,
    }),
    [
      now,
      location,
      locationLabel,
      locationError,
      settings,
      objects,
      allStars,
      tles,
      tleStatus,
      issPass,
      loading,
      updateSettings,
      refreshTles,
      calibrateWith,
      findObject,
    ],
  );

  return <SkyContext.Provider value={value}>{children}</SkyContext.Provider>;
}

export function useSky() {
  const ctx = useContext(SkyContext);
  if (!ctx) throw new Error('useSky must be used inside SkyProvider');
  return ctx;
}
