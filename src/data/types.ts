export type ObjectKind = 'star' | 'planet' | 'sun' | 'moon' | 'satellite' | 'blackhole' | 'constellation';

export type LayerKey = 'stars' | 'planets' | 'satellites' | 'blackHoles' | 'constellations';

export type GeoLocation = {
  latitude: number;
  longitude: number;
  altitude: number;
};

export type AppSettings = {
  compassOffset: number;
  showStars: boolean;
  showPlanets: boolean;
  showSatellites: boolean;
  showBlackHoles: boolean;
  showConstellations: boolean;
  minMagnitude: number;
  maxSatellites: number;
  nasaApiKey: string;
  cameraEnabled: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  compassOffset: 0,
  showStars: true,
  showPlanets: true,
  showSatellites: true,
  showBlackHoles: true,
  showConstellations: true,
  minMagnitude: 3.2,
  maxSatellites: 40,
  nasaApiKey: '',
  cameraEnabled: true,
};

export type StarRecord = {
  id: string;
  name: string;
  constellation: string;
  raHours: number;
  decDeg: number;
  mag: number;
  spectral: string;
  distanceLy: number;
  bayer?: string;
};

export type BlackHoleRecord = {
  id: string;
  name: string;
  constellation: string;
  raHours: number;
  decDeg: number;
  type: string;
  mass: string;
  distanceLy: number;
  host: string;
  note: string;
};

export type TleEntry = {
  name: string;
  noradId: string;
  line1: string;
  line2: string;
};

export type SkyObject = {
  id: string;
  name: string;
  kind: ObjectKind;
  az: number;
  el: number;
  raHours: number;
  decDeg: number;
  mag: number | null;
  constellation: string;
  subtitle: string;
  facts: { label: string; value: string }[];
  extra?: Record<string, number | string>;
};

export type LookDirection = {
  heading: number;
  pitch: number;
  roll: number;
};

export type ScreenPoint = {
  x: number;
  y: number;
  visible: boolean;
};
