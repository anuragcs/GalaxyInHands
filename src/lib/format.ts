export function wrap360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function wrap180(deg: number): number {
  const n = wrap360(deg);
  return n > 180 ? n - 360 : n;
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatDeg(value: number, digits = 1): string {
  return `${value.toFixed(digits)}°`;
}

export function formatAzimuth(az: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(wrap360(az) / 22.5) % 16;
  return `${wrap360(az).toFixed(0)}° ${dirs[idx]}`;
}

export function formatElevation(el: number): string {
  if (el >= 0) return `+${el.toFixed(1)}°`;
  return `${el.toFixed(1)}°`;
}

export function formatRa(hours: number): string {
  const h = Math.floor(hours);
  const mFloat = (hours - h) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${pad2(h)}h ${pad2(m)}m ${pad2(s)}s`;
}

export function formatDec(deg: number): string {
  const sign = deg >= 0 ? '+' : '−';
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${sign}${d}° ${pad2(m)}′ ${pad2(s)}″`;
}

export function formatLatLon(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(3)}° ${ns}  ${Math.abs(lon).toFixed(3)}° ${ew}`;
}

export function formatLy(ly: number): string {
  if (ly >= 1_000_000_000) return `${(ly / 1_000_000_000).toFixed(1)} billion ly`;
  if (ly >= 1_000_000) return `${(ly / 1_000_000).toFixed(1)} million ly`;
  if (ly >= 1000) return `${(ly / 1000).toFixed(1)}k ly`;
  return `${ly.toFixed(ly < 20 ? 1 : 0)} ly`;
}

export function formatAu(au: number): string {
  if (au < 0.01) return `${(au * 149597870.7).toFixed(0)} km`;
  return `${au.toFixed(au < 1 ? 3 : 2)} AU`;
}

export function formatClock(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

export function formatUtc(date: Date): string {
  return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())} UTC`;
}

export function kindLabel(kind: string): string {
  switch (kind) {
    case 'star':
      return 'Star';
    case 'planet':
      return 'Planet';
    case 'sun':
      return 'Star';
    case 'moon':
      return 'Moon';
    case 'satellite':
      return 'Satellite';
    case 'blackhole':
      return 'Black hole';
    case 'constellation':
      return 'Constellation';
    default:
      return kind;
  }
}
