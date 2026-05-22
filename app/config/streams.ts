import type { GridSlotId } from "../types/grid";

export type StreamConfig = {
  id: string;
  title: string;
  /** YouTube /embed/ URL — use live video IDs from each channel */
  embedUrl: string;
  slot: GridSlotId;
};

/** Edit embedUrl with each channel's current live stream video ID */
export const STREAMS: StreamConfig[] = [
  {
    id: "cnn-turk",
    title: "CNN TÜRK",
    embedUrl: "https://www.youtube.com/embed/CV5Fooi4Y-c?autoplay=1&mute=1",
    slot: "main",
  },
  {
    id: "trt-haber",
    title: "TRT Haber",
    embedUrl: "https://www.youtube.com/embed/8WPME1G7ueE?autoplay=1&mute=1",
    slot: "top-right",
  },
  {
    id: "ahaber",
    title: "A Haber",
    embedUrl: "https://www.youtube.com/embed/RqUZ2Fv9l8w?autoplay=1&mute=1",
    slot: "mid-right",
  },
  {
    id: "ntv",
    title: "NTV",
    embedUrl: "https://www.youtube.com/embed/8WPME1G7ueE?autoplay=1&mute=1",
    slot: "bottom-left",
  },
  {
    id: "haberturk",
    title: "Habertürk",
    embedUrl: "https://www.youtube.com/embed/8WPME1G7ueE?autoplay=1&mute=1",
    slot: "bottom-center",
  },
  {
    id: "tvnet",
    title: "TVNET",
    embedUrl: "https://www.youtube.com/embed/8WPME1G7ueE?autoplay=1&mute=1",
    slot: "bottom-right",
  },
];
