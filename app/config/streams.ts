import type { GridSlotId } from "../types/grid";
import { embedFromVideoId } from "../lib/youtube";

export type StreamConfig = {
  id: string;
  title: string;
  embedUrl: string;
  slot: GridSlotId;
};

/** Default live streams — video IDs from each channel's current broadcast */
export const STREAMS: StreamConfig[] = [
  {
    id: "ntv",
    title: "NTV Canlı Yayın",
    embedUrl: embedFromVideoId("pqq5c6k70kk"),
    slot: "main",
  },
  {
    id: "cnn-turk",
    title: "CNN TÜRK",
    embedUrl: embedFromVideoId("6N8_r2uwLEc"),
    slot: "top-right",
  },
  {
    id: "sozcu",
    title: "SÖZCÜ TV",
    embedUrl: embedFromVideoId("ztmY_cCtUl0"),
    slot: "mid-right",
  },
  {
    id: "haberturk",
    title: "Habertürk TV",
    embedUrl: embedFromVideoId("RNVNlJSUFoE"),
    slot: "bottom-left",
  },
  {
    id: "halk-tv",
    title: "HALK TV",
    embedUrl: embedFromVideoId("8uNelFh0oz4"),
    slot: "bottom-center",
  },
  {
    id: "haber-global",
    title: "Haber Global TV",
    embedUrl: embedFromVideoId("EqoCJ8BPxtE"),
    slot: "bottom-right",
  },
];
