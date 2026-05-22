import type { Stream } from "../types/grid";

export type GridSizes = {
  col1: number;
  col2: number;
  col3: number;
  row1: number;
  row2: number;
  row3: number;
};

export type AppSettings = {
  showTitles: boolean;
  streams: Stream[];
  sizes: GridSizes;
};

export const DEFAULT_SIZES: GridSizes = {
  col1: 1,
  col2: 1,
  col3: 0.85,
  row1: 1,
  row2: 1,
  row3: 0.75,
};
