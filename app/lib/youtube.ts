const VIDEO_ID_RE =
  /(?:youtube\.com\/(?:embed\/|live\/|watch\?v=|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/;
const CHANNEL_ID_RE = /(?:channel=)([A-Za-z0-9_-]{24})/;

export function extractYoutubeIds(url: string): { videoId?: string; channelId?: string } | null {
  const trimmed = url.trim();
  const videoMatch = trimmed.match(VIDEO_ID_RE);
  if (videoMatch) return { videoId: videoMatch[1] };

  const channelMatch = trimmed.match(CHANNEL_ID_RE);
  if (channelMatch) return { channelId: channelMatch[1] };

  // Support direct ID input
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return { videoId: trimmed };
  if (/^UC[A-Za-z0-9_-]{22}$/.test(trimmed)) return { channelId: trimmed };

  return null;
}

export function extractVideoId(url: string): string | null {
  return extractYoutubeIds(url)?.videoId ?? null;
}

export function toWatchUrl(input: string): string | null {
  const ids = extractYoutubeIds(input);
  if (ids?.videoId) return `https://www.youtube.com/watch?v=${ids.videoId}`;
  if (ids?.channelId) return `https://www.youtube.com/channel/${ids.channelId}/live`;
  return null;
}

export function toEmbedUrl(input: string, autoplay = true, mute = true): string | null {
  const ids = extractYoutubeIds(input);
  if (!ids) return null;
  
  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  if (mute) params.set("mute", "1");
  params.set("playsinline", "1");
  params.set("rel", "0");
  params.set("modestbranding", "1");
  const qs = params.toString();

  if (ids.channelId) {
    return `https://www.youtube-nocookie.com/embed/live_stream?channel=${ids.channelId}&${qs}`;
  }
  return `https://www.youtube-nocookie.com/embed/${ids.videoId}?${qs}`;
}

/** Build embed URL from a raw 11-character video id or 24-character channel id */
export function embedFromVideoId(id: string): string {
  return (
    toEmbedUrl(id) ??
    `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`
  );
}

export function isValidYoutubeInput(input: string): boolean {
  return extractYoutubeIds(input) !== null;
}
