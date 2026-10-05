import * as satellite from 'satellite.js';
import type { GeoLocation, SkyObject, TleEntry } from '@/data/types';
import { formatAzimuth, formatElevation } from '@/lib/format';
import { loadCachedTles, saveCachedTles } from './storage';

const TLE_FEEDS = [
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle',
];

const CACHE_MS = 6 * 60 * 60 * 1000;

function parseTleBlock(text: string): TleEntry[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const entries: TleEntry[] = [];
  for (let i = 0; i < lines.length - 2; i += 1) {
    const name = lines[i];
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];
    if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
      entries.push({
        name: name.replace(/^\d+\s+/, '').trim(),
        noradId: line1.slice(2, 7).trim(),
        line1,
        line2,
      });
      i += 2;
    }
  }
  return entries;
}

export async function fetchTleCatalog(force = false): Promise<TleEntry[]> {
  const cached = await loadCachedTles();
  if (!force && cached && Date.now() - cached.fetchedAt < CACHE_MS && cached.entries.length > 0) {
    return cached.entries;
  }

  const unique = new Map<string, TleEntry>();
  for (const url of TLE_FEEDS) {
    const response = await fetch(url);
    if (!response.ok) continue;
    const text = await response.text();
    for (const entry of parseTleBlock(text)) {
      unique.set(entry.noradId, entry);
    }
  }

  const entries = [...unique.values()];
  if (entries.length === 0 && cached?.entries.length) return cached.entries;
  if (entries.length > 0) await saveCachedTles(entries);
  return entries;
}

function velocityKms(velocity: { x: number; y: number; z: number } | boolean): number | null {
  if (!velocity || typeof velocity === 'boolean') return null;
  return Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
}

export function computeSatellite(
  entry: TleEntry,
  when: Date,
  location: GeoLocation,
): SkyObject | null {
  try {
    const satrec = satellite.twoline2satrec(entry.line1, entry.line2);
    const pv = satellite.propagate(satrec, when);
    if (!pv.position || typeof pv.position === 'boolean') return null;

    const gmst = satellite.gstime(when);
    const geo = satellite.eciToGeodetic(pv.position, gmst);
    const lat = satellite.degreesLat(geo.latitude);
    const lon = satellite.degreesLong(geo.longitude);
    const altKm = geo.height;

    const observerGd = {
      longitude: satellite.degreesToRadians(location.longitude),
      latitude: satellite.degreesToRadians(location.latitude),
      height: location.altitude / 1000,
    };
    const ecf = satellite.eciToEcf(pv.position, gmst);
    const look = satellite.ecfToLookAngles(observerGd, ecf);
    const az = (look.azimuth * 180) / Math.PI;
    const el = (look.elevation * 180) / Math.PI;
    const rangeKm = look.rangeSat;
    const speed = velocityKms(pv.velocity);
    const isIss = entry.noradId === '25544' || /iss/i.test(entry.name);

    return {
      id: `sat:${entry.noradId}`,
      name: entry.name,
      kind: 'satellite',
      az,
      el,
      raHours: 0,
      decDeg: 0,
      mag: isIss ? -1.8 : 2.5,
      constellation: 'Earth orbit',
      subtitle: isIss ? 'International Space Station' : `NORAD ${entry.noradId}`,
      facts: [
        { label: 'NORAD ID', value: entry.noradId },
        { label: 'Azimuth', value: formatAzimuth(az) },
        { label: 'Elevation', value: formatElevation(el) },
        { label: 'Altitude', value: `${altKm.toFixed(0)} km` },
        { label: 'Range', value: `${rangeKm.toFixed(0)} km` },
        { label: 'Subpoint', value: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` },
        ...(speed ? [{ label: 'Speed', value: `${speed.toFixed(2)} km/s` }] : []),
      ],
      extra: { lat, lon, altKm, rangeKm, noradId: Number(entry.noradId) },
    };
  } catch {
    return null;
  }
}

export function computeSatellites(
  entries: TleEntry[],
  when: Date,
  location: GeoLocation,
  maxCount: number,
): SkyObject[] {
  const visible: SkyObject[] = [];
  for (const entry of entries) {
    const obj = computeSatellite(entry, when, location);
    if (obj && obj.el > -2) visible.push(obj);
  }
  visible.sort((a, b) => {
    const aIss = a.id === 'sat:25544' ? 1 : 0;
    const bIss = b.id === 'sat:25544' ? 1 : 0;
    if (aIss !== bIss) return bIss - aIss;
    const aRange = Number(a.extra?.rangeKm ?? 9e9);
    const bRange = Number(b.extra?.rangeKm ?? 9e9);
    return aRange - bRange;
  });
  return visible.slice(0, maxCount);
}

export type PassWindow = {
  start: Date;
  peak: Date;
  peakEl: number;
};

export function nextIssPass(
  entries: TleEntry[],
  location: GeoLocation,
  from = new Date(),
  hours = 12,
): PassWindow | null {
  const iss = entries.find((e) => e.noradId === '25544' || /iss/i.test(e.name));
  if (!iss) return null;

  const stepMs = 30_000;
  const end = from.getTime() + hours * 3600_000;
  let rise: Date | null = null;
  let peak = from;
  let peakEl = -90;
  let inPass = false;

  for (let t = from.getTime(); t <= end; t += stepMs) {
    const when = new Date(t);
    const obj = computeSatellite(iss, when, location);
    const el = obj?.el ?? -90;
    if (el >= 10) {
      if (!inPass) {
        inPass = true;
        rise = when;
        peak = when;
        peakEl = el;
      } else if (el > peakEl) {
        peak = when;
        peakEl = el;
      }
    } else if (inPass) {
      return { start: rise ?? when, peak, peakEl };
    }
  }
  return inPass && rise ? { start: rise, peak, peakEl } : null;
}
