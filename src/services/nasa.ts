export type Apod = {
  title: string;
  explanation: string;
  url: string;
  mediaType: string;
};

export async function fetchApod(apiKey?: string): Promise<Apod | null> {
  const key = apiKey?.trim() || 'DEMO_KEY';
  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(key)}`);
    if (!response.ok) return null;
    const data = (await response.json()) as {
      title?: string;
      explanation?: string;
      url?: string;
      media_type?: string;
    };
    if (!data.title || !data.url) return null;
    return {
      title: data.title,
      explanation: data.explanation ?? '',
      url: data.url,
      mediaType: data.media_type ?? 'image',
    };
  } catch {
    return null;
  }
}
