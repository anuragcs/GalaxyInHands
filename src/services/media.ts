import type { SkyObject } from '@/data/types';

export type MediaCard = {
  title: string;
  extract: string;
  image: string | null;
  credit: string;
  pageUrl: string | null;
};

const cache = new Map<string, MediaCard>();

const HEADERS = {
  Accept: 'application/json',
  'Api-User-Agent': 'GIH/1.0 (Galaxy In Hands; educational astronomy app)',
};

function wikiCandidates(object: SkyObject): string[] {
  if (object.kind === 'constellation') {
    return [object.extra?.wiki ? String(object.extra.wiki) : `${object.name}_(constellation)`, object.name];
  }
  if (object.kind === 'sun') return ['Sun'];
  if (object.kind === 'moon') return ['Moon'];
  if (object.kind === 'planet') {
    const needsPlanet = ['Mercury', 'Venus', 'Uranus', 'Neptune', 'Pluto'].includes(object.name);
    return needsPlanet ? [`${object.name}_(planet)`, object.name] : [object.name, `${object.name}_(planet)`];
  }
  if (object.kind === 'satellite') {
    if (object.id === 'sat:25544') return ['International_Space_Station'];
    return [object.name.replace(/\s+/g, '_')];
  }
  if (object.kind === 'blackhole') {
    const map: Record<string, string> = {
      'Sagittarius A*': 'Sagittarius_A*',
      'M87*': 'Messier_87',
      'Cygnus X-1': 'Cygnus_X-1',
      'V404 Cygni': 'V404_Cygni',
      'A0620-00': 'A0620-00',
      'GRO J1655-40': 'GRO_J1655-40',
      'GRS 1915+105': 'GRS_1915+105',
      'M31*': 'Andromeda_Galaxy',
      'Centaurus A': 'Centaurus_A',
      'OJ 287': 'OJ_287',
      'Gaia BH1': 'Gaia_BH1',
      'TON 618': 'TON_618',
    };
    return [map[object.name] ?? object.name.replace(/\s+/g, '_')];
  }
  return [object.name, `${object.name}_(star)`, `${object.name}_(astronomy)`];
}

function nasaQuery(object: SkyObject): string {
  if (object.kind === 'star') return `${object.name} star`;
  if (object.kind === 'constellation') return `${object.name} constellation`;
  if (object.kind === 'blackhole') return `${object.name} black hole`;
  if (object.id === 'sat:25544') return 'International Space Station';
  return object.name;
}

async function fetchWiki(title: string): Promise<MediaCard | null> {
  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: HEADERS,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      type?: string;
      title?: string;
      extract?: string;
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
      content_urls?: { desktop?: { page?: string } };
    };
    if (data.type === 'disambiguation' || !data.extract) return null;
    return {
      title: data.title ?? title,
      extract: data.extract,
      image: data.originalimage?.source ?? data.thumbnail?.source ?? null,
      credit: 'Wikipedia / Wikimedia Commons',
      pageUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch {
    return null;
  }
}

async function fetchNasaImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`,
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      collection?: { items?: { links?: { href?: string; render?: string }[] }[] };
    };
    const items = data.collection?.items ?? [];
    for (const item of items) {
      const href = item.links?.find((link) => link.href && (link.render === 'image' || link.href.endsWith('.jpg') || link.href.endsWith('.png')))?.href;
      if (href) return href;
    }
    return items[0]?.links?.[0]?.href ?? null;
  } catch {
    return null;
  }
}

export async function fetchObjectMedia(object: SkyObject): Promise<MediaCard | null> {
  const cached = cache.get(object.id);
  if (cached) return cached;

  let card: MediaCard | null = null;
  for (const title of wikiCandidates(object)) {
    card = await fetchWiki(title);
    if (card) break;
  }

  if (!card?.image) {
    const nasa = await fetchNasaImage(nasaQuery(object));
    if (nasa) {
      card = card
        ? { ...card, image: nasa, credit: `${card.credit} · NASA Image Library` }
        : {
            title: object.name,
            extract: object.subtitle,
            image: nasa,
            credit: 'NASA Image and Video Library',
            pageUrl: `https://images.nasa.gov/search?q=${encodeURIComponent(nasaQuery(object))}`,
          };
    }
  }

  if (card) cache.set(object.id, card);
  return card;
}
