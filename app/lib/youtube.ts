const VIDEO_ID_RE =
  /(?:youtube\.com\/(?:embed\/|live\/|watch\?v=|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function extractVideoId(url: string): string | null {
  const trimmed = url.trim();
  const match = trimmed.match(VIDEO_ID_RE);
  return match?.[1] ?? null;
}

export function toWatchUrl(input: string): string | null {
  const id = extractVideoId(input);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

export function toEmbedUrl(input: string, autoplay = true, mute = true): string | null {
  const id = extractVideoId(input);
  if (!id) return null;
  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  if (mute) params.set("mute", "1");
  const qs = params.toString();
  return `https://www.youtube.com/embed/${id}${qs ? `?${qs}` : ""}`;
}

export function isValidYoutubeInput(input: string): boolean {
  return extractVideoId(input.trim()) !== null;
}
