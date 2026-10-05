import { CONSTELLATIONS } from '@/data/constellations';
import type { SkyObject } from '@/data/types';
import { wrap360 } from '@/lib/format';

function circularMeanAz(values: number[]): number {
  const y = values.reduce((sum, az) => sum + Math.sin((az * Math.PI) / 180), 0);
  const x = values.reduce((sum, az) => sum + Math.cos((az * Math.PI) / 180), 0);
  return wrap360((Math.atan2(y, x) * 180) / Math.PI);
}

export function computeConstellations(stars: SkyObject[]): SkyObject[] {
  const byId = new Map(stars.map((star) => [star.id.replace(/^star:/, ''), star]));

  const results: SkyObject[] = [];
  for (const def of CONSTELLATIONS) {
    const members = [...new Set(def.lines.flat())]
      .map((id) => byId.get(id))
      .filter((star): star is SkyObject => Boolean(star));
    if (members.length === 0) continue;

    const az = circularMeanAz(members.map((star) => star.az));
    const el = members.reduce((sum, star) => sum + star.el, 0) / members.length;
    const up = members.filter((star) => star.el > 0).length;

    results.push({
      id: `const:${def.id}`,
      name: def.name,
      kind: 'constellation',
      az,
      el,
      raHours: members.reduce((sum, star) => sum + star.raHours, 0) / members.length,
      decDeg: members.reduce((sum, star) => sum + star.decDeg, 0) / members.length,
      mag: null,
      constellation: def.name,
      subtitle: `${members.length} catalog stars · ${up} above the horizon`,
      facts: [
        { label: 'Figure', value: `${def.lines.length} stick-figure segments` },
        { label: 'Bright members', value: members.map((star) => star.name).join(', ') },
        { label: 'Above horizon', value: `${up} of ${members.length}` },
        { label: 'Live position', value: 'Moves with Earth rotation and your GPS, same as the stars' },
      ],
      extra: { wiki: def.wiki },
    });
  }
  return results;
}

export function constellationSegments(stars: SkyObject[]): { name: string; id: string; a: SkyObject; b: SkyObject }[] {
  const byId = new Map(stars.map((star) => [star.id.replace(/^star:/, ''), star]));
  const segments: { name: string; id: string; a: SkyObject; b: SkyObject }[] = [];
  for (const def of CONSTELLATIONS) {
    for (const [from, to] of def.lines) {
      const a = byId.get(from);
      const b = byId.get(to);
      if (a && b) segments.push({ name: def.name, id: def.id, a, b });
    }
  }
  return segments;
}
