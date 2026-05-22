import { DEFAULT_LOCALE, isLocale, type Locale } from "../i18n/locales";
import type { GridSlotId, Stream } from "../types/grid";
import { DEFAULT_SIZES, type AppSettings, type GridSizes } from "./storage";
import { extractVideoId, toEmbedUrl } from "./youtube";

const SLOT_IDS: GridSlotId[] = [
  "main",
  "top-right",
  "mid-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export type AppState = AppSettings & {
  locale: Locale;
};

function isGridSlot(value: string): value is GridSlotId {
  return SLOT_IDS.includes(value as GridSlotId);
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

/** panels: streamId@slot~videoId~title (title optional, URI-encoded) */
function parsePanels(
  value: string | null,
  fallbackStreams: Stream[]
): Stream[] {
  if (!value) return fallbackStreams;

  const byId = new Map(fallbackStreams.map((s) => [s.id, { ...s }]));

  for (const chunk of value.split("|")) {
    if (!chunk) continue;
    const at = chunk.indexOf("@");
    if (at < 1) continue;

    const streamId = chunk.slice(0, at);
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

    const base = byId.get(streamId);
    if (!base) continue;

    const embed =
      toEmbedUrl(videoId) ??
      toEmbedUrl(`https://www.youtube.com/watch?v=${videoId}`);

    byId.set(streamId, {
      ...base,
      slot,
      embedUrl: embed ?? base.embedUrl,
      title: title ?? base.title,
    });
  }

  return Array.from(byId.values());
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
