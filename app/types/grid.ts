export type GridSlotId =
  | "main"
  | "top-right"
  | "mid-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type Stream = {
  id: string;
  title: string;
  embedUrl: string;
  slot: GridSlotId;
};
