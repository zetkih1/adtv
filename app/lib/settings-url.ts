import { DEFAULT_LOCALE, isLocale, type Locale } from "../i18n/locales";
import type { GridSlotId, Stream } from "../types/grid";
import { DEFAULT_SIZES, type AppSettings, type GridSizes } from "./storage";
import { embedFromVideoId, extractVideoId, toEmbedUrl } from "./youtube";

const SLOT_IDS: GridSlotId[] = [
  "main",
  "top-right",
  "mid-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

/** Old stream ids from earlier builds → current config ids */
const LEGACY_STREAM_IDS: Record<string, string> = {
  "trt-haber": "halk-tv",
  ahaber: "sozcu",
  tvnet: "haber-global",
};

export type AppState = AppSettings & {
  locale: Locale;
};

function isGridSlot(value: string): value is GridSlotId {
  return SLOT_IDS.includes(value as GridSlotId);
}

function resolveStreamId(id: string, knownIds: Set<string>): string | null {
  if (knownIds.has(id)) return id;
  const migrated = LEGACY_STREAM_IDS[id];
  if (migrated && knownIds.has(migrated)) return migrated;
  return null;
}

function parseRowSizes(value: string | null, fallback: GridSizes): GridSizes {
  if (!value) return fallback;
  const parts = value.split(",").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n) || n <= 0)) {
    return fallback;
  }
  return {
    ...fallback,
    row1: parts[0],
    row2: parts[1],
    row3: parts[2],
  };
}

function parseColSizes(value: string | null, fallback: GridSizes): GridSizes {
  if (!value) return fallback;
  const parts = value.split(",").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n) || n <= 0)) {
    return fallback;
  }
  return {
    ...fallback,
    col1: parts[0],
    col2: parts[1],
    col3: parts[2],
  };
}

/** Ensure exactly one stream per grid slot */
function normalizeStreamSlots(
  streams: Stream[],
  fallbackStreams: Stream[]
): Stream[] {
  const fallbackById = new Map(fallbackStreams.map((s) => [s.id, s]));
  const bySlot = new Map<GridSlotId, Stream>();

  for (const slot of SLOT_IDS) {
    const preferred =
      streams.find((s) => s.slot === slot && fallbackById.get(s.id)?.slot === slot) ??
      streams.find((s) => s.slot === slot) ??
      fallbackStreams.find((s) => s.slot === slot);
    if (preferred) {
      bySlot.set(slot, { ...preferred, slot });
    }
  }

  const placed = new Set(Array.from(bySlot.values()).map((s) => s.id));

  for (const stream of streams) {
    if (placed.has(stream.id)) continue;
    const def = fallbackById.get(stream.id);
    if (!def) continue;
    if (!bySlot.has(def.slot)) {
      bySlot.set(def.slot, { ...stream, slot: def.slot });
      placed.add(stream.id);
    }
  }

  for (const fb of fallbackStreams) {
    if (!bySlot.has(fb.slot)) {
      bySlot.set(fb.slot, { ...fb });
    }
  }

  return SLOT_IDS.map((slot) => bySlot.get(slot)!);
}

/** panels: streamId@slot~videoId~title (title optional, URI-encoded) */
function parsePanels(
  value: string | null,
  fallbackStreams: Stream[]
): Stream[] {
  if (!value) return fallbackStreams;

  const knownIds = new Set(fallbackStreams.map((s) => s.id));
  const chunks = value.split("|").filter(Boolean);

  if (chunks.length < 6) return fallbackStreams;

  const byId = new Map(fallbackStreams.map((s) => [s.id, { ...s }]));
  let validChunks = 0;

  for (const chunk of chunks) {
    const at = chunk.indexOf("@");
    if (at < 1) continue;

    const rawId = chunk.slice(0, at);
    const streamId = resolveStreamId(rawId, knownIds);
    if (!streamId) continue;

    const rest = chunk.slice(at + 1);
    const tilde1 = rest.indexOf("~");
    if (tilde1 < 1) continue;

    const slot = rest.slice(0, tilde1);
    if (!isGridSlot(slot)) continue;

    const afterSlot = rest.slice(tilde1 + 1);
    const tilde2 = afterSlot.indexOf("~");
    const videoId =
      tilde2 >= 0 ? afterSlot.slice(0, tilde2) : afterSlot;
    const title =
      tilde2 >= 0 ? decodeURIComponent(afterSlot.slice(tilde2 + 1)) : undefined;

    if (!videoId || videoId.length < 6) continue;

    const embed =
      toEmbedUrl(videoId) ??
      toEmbedUrl(`https://www.youtube.com/watch?v=${videoId}`) ??
      embedFromVideoId(videoId);

    byId.set(streamId, {
      ...byId.get(streamId)!,
      slot,
      embedUrl: embed,
      title: title ?? byId.get(streamId)!.title,
    });
    validChunks++;
  }

  if (validChunks < 6) return fallbackStreams;

  return normalizeStreamSlots(Array.from(byId.values()), fallbackStreams);
}

function serializePanels(streams: Stream[]): string {
  return streams
    .map((s) => {
      const videoId = extractVideoId(s.embedUrl) ?? s.embedUrl;
      const title = encodeURIComponent(s.title);
      return `${s.id}@${s.slot}~${videoId}~${title}`;
    })
    .join("|");
}

export function parseSettingsFromParams(
  params: URLSearchParams,
  fallbackStreams: Stream[]
): AppState {
  let sizes = { ...DEFAULT_SIZES };
  sizes = parseColSizes(params.get("c"), sizes);
  sizes = parseRowSizes(params.get("r"), sizes);

  const localeParam = params.get("lang");
  const locale =
    localeParam && isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  const titlesParam = params.get("titles");
  const showTitles = titlesParam !== "0";

  const streams = parsePanels(params.get("p"), fallbackStreams);

  return { locale, showTitles, streams, sizes };
}

export function settingsToSearchParams(state: AppState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.locale !== DEFAULT_LOCALE) {
    params.set("lang", state.locale);
  }
  if (!state.showTitles) {
    params.set("titles", "0");
  }

  const { col1, col2, col3, row1, row2, row3 } = state.sizes;
  const colsDefault =
    col1 === DEFAULT_SIZES.col1 &&
    col2 === DEFAULT_SIZES.col2 &&
    col3 === DEFAULT_SIZES.col3;
  const rowsDefault =
    row1 === DEFAULT_SIZES.row1 &&
    row2 === DEFAULT_SIZES.row2 &&
    row3 === DEFAULT_SIZES.row3;

  if (!colsDefault) {
    params.set("c", `${col1},${col2},${col3}`);
  }
  if (!rowsDefault) {
    params.set("r", `${row1},${row2},${row3}`);
  }

  params.set("p", serializePanels(state.streams));

  return params;
}

export function buildSettingsQuery(state: AppState): string {
  return settingsToSearchParams(state).toString();
}
