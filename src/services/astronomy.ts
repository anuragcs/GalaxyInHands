import * as Astronomy from 'astronomy-engine';
import { BLACK_HOLES } from '@/data/blackHoles';
import { BRIGHT_STARS } from '@/data/stars';
import type { GeoLocation, SkyObject } from '@/data/types';
import { formatAu, formatAzimuth, formatDec, formatElevation, formatLy, formatRa } from '@/lib/format';

const PLANET_BODIES: { body: Astronomy.Body; kind: SkyObject['kind']; id: string; blurb: string }[] = [
  { body: Astronomy.Body.Sun, kind: 'sun', id: 'sun', blurb: 'Our star. All planet positions in GIH are computed from your GPS and the current time.' },
  { body: Astronomy.Body.Moon, kind: 'moon', id: 'moon', blurb: 'Earth’s natural satellite. Phase and distance update live from JPL-quality ephemerides.' },
  { body: Astronomy.Body.Mercury, kind: 'planet', id: 'mercury', blurb: 'Innermost planet. Never strays far from the Sun in the sky.' },
  { body: Astronomy.Body.Venus, kind: 'planet', id: 'venus', blurb: 'The brightest planet. Often the evening or morning star.' },
  { body: Astronomy.Body.Mars, kind: 'planet', id: 'mars', blurb: 'The red planet. Brightest around opposition.' },
  { body: Astronomy.Body.Jupiter, kind: 'planet', id: 'jupiter', blurb: 'Largest planet. Its Galilean moons are a binocular treat.' },
  { body: Astronomy.Body.Saturn, kind: 'planet', id: 'saturn', blurb: 'Ringed giant. The rings change tilt over an Earth decade.' },
  { body: Astronomy.Body.Uranus, kind: 'planet', id: 'uranus', blurb: 'Ice giant. Barely visible to the unaided eye at a dark site.' },
  { body: Astronomy.Body.Neptune, kind: 'planet', id: 'neptune', blurb: 'The farthest ice giant. Binoculars or a small telescope needed.' },
  { body: Astronomy.Body.Pluto, kind: 'planet', id: 'pluto', blurb: 'Dwarf planet in the Kuiper Belt. Far too faint for the eye, but the coordinate is live.' },
];

function observerOf(location: GeoLocation): Astronomy.Observer {
  return new Astronomy.Observer(location.latitude, location.longitude, location.altitude);
}

function constellationName(raHours: number, decDeg: number): string {
  try {
    return Astronomy.Constellation(raHours, decDeg).name;
  } catch {
    return '—';
  }
}

export function riseSetTimes(bodyName: string, when: Date, location: GeoLocation): { rise: string; set: string } {
  const body = bodyName as Astronomy.Body;
  const observer = observerOf(location);
  const start = new Date(when);
  start.setHours(0, 0, 0, 0);
  const rise = Astronomy.SearchRiseSet(body, observer, +1, start, 1.5);
  const set = Astronomy.SearchRiseSet(body, observer, -1, start, 1.5);
  return {
    rise: rise ? rise.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
    set: set ? set.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
  };
}

export function computeSolarSystem(when: Date, location: GeoLocation): SkyObject[] {
  const observer = observerOf(location);
  return PLANET_BODIES.map(({ body, kind, id, blurb }) => {
    const eq = Astronomy.Equator(body, when, observer, true, true);
    const hor = Astronomy.Horizon(when, observer, eq.ra, eq.dec, 'normal');
    const illum = Astronomy.Illumination(body, when);
    const con = constellationName(eq.ra, eq.dec);
    const facts = [
      { label: 'Azimuth', value: formatAzimuth(hor.azimuth) },
      { label: 'Elevation', value: formatElevation(hor.altitude) },
      { label: 'RA', value: formatRa(eq.ra) },
      { label: 'Dec', value: formatDec(eq.dec) },
      { label: 'Constellation', value: con },
      { label: 'Magnitude', value: illum.mag.toFixed(2) },
      { label: 'Distance', value: formatAu(illum.geo_dist) },
      { label: 'Heliocentric', value: formatAu(illum.helio_dist) },
      { label: 'Illumination', value: `${(illum.phase_fraction * 100).toFixed(0)}%` },
    ];
    return {
      id: `planet:${id}`,
      name: body,
      kind,
      az: hor.azimuth,
      el: hor.altitude,
      raHours: eq.ra,
      decDeg: eq.dec,
      mag: illum.mag,
      constellation: con,
      subtitle: blurb,
      facts,
    };
  });
}

export function computeStars(when: Date, location: GeoLocation, minMag: number): SkyObject[] {
  const observer = observerOf(location);
  const out: SkyObject[] = [];
  for (const star of BRIGHT_STARS) {
    if (star.mag > minMag) continue;
    const hor = Astronomy.Horizon(when, observer, star.raHours, star.decDeg, 'normal');
    out.push({
      id: `star:${star.id}`,
      name: star.name,
      kind: 'star',
      az: hor.azimuth,
      el: hor.altitude,
      raHours: star.raHours,
      decDeg: star.decDeg,
      mag: star.mag,
      constellation: star.constellation,
      subtitle: star.bayer ? `${star.bayer} · ${star.spectral}` : star.spectral,
      facts: [
        { label: 'Bayer / Flamsteed', value: star.bayer ?? '—' },
        { label: 'Constellation', value: star.constellation },
        { label: 'Magnitude', value: star.mag.toFixed(2) },
        { label: 'Spectral type', value: star.spectral },
        { label: 'Distance', value: formatLy(star.distanceLy) },
        { label: 'RA (J2000)', value: formatRa(star.raHours) },
        { label: 'Dec (J2000)', value: formatDec(star.decDeg) },
        { label: 'Azimuth', value: formatAzimuth(hor.azimuth) },
        { label: 'Elevation', value: formatElevation(hor.altitude) },
      ],
    });
  }
  return out;
}

export function computeBlackHoles(when: Date, location: GeoLocation): SkyObject[] {
  const observer = observerOf(location);
  return BLACK_HOLES.map((bh) => {
    const hor = Astronomy.Horizon(when, observer, bh.raHours, bh.decDeg, 'normal');
    return {
      id: `bh:${bh.id}`,
      name: bh.name,
      kind: 'blackhole',
      az: hor.azimuth,
      el: hor.altitude,
      raHours: bh.raHours,
      decDeg: bh.decDeg,
      mag: null,
      constellation: bh.constellation,
      subtitle: `${bh.type} · ${bh.host}`,
      facts: [
        { label: 'Type', value: bh.type },
        { label: 'Mass', value: bh.mass },
        { label: 'Host', value: bh.host },
        { label: 'Distance', value: formatLy(bh.distanceLy) },
        { label: 'Constellation', value: bh.constellation },
        { label: 'RA (J2000)', value: formatRa(bh.raHours) },
        { label: 'Dec (J2000)', value: formatDec(bh.decDeg) },
        { label: 'Azimuth', value: formatAzimuth(hor.azimuth) },
        { label: 'Elevation', value: formatElevation(hor.altitude) },
        { label: 'About', value: bh.note },
      ],
    };
  });
}

export function sunAzimuth(when: Date, location: GeoLocation): number {
  const observer = observerOf(location);
  const eq = Astronomy.Equator(Astronomy.Body.Sun, when, observer, true, true);
  return Astronomy.Horizon(when, observer, eq.ra, eq.dec, 'normal').azimuth;
}

export function moonAzimuth(when: Date, location: GeoLocation): number {
  const observer = observerOf(location);
  const eq = Astronomy.Equator(Astronomy.Body.Moon, when, observer, true, true);
  return Astronomy.Horizon(when, observer, eq.ra, eq.dec, 'normal').azimuth;
}
