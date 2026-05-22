"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { GridSlotId, Stream } from "../types/grid";
import type { GridSizes } from "../lib/storage";
import { useApp } from "../providers/AppProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SettingsPanel } from "./SettingsPanel";

/** row-start / col-start / row-end / col-end on a 3×3 grid */
const SLOT_AREAS: Record<GridSlotId, string> = {
  main: "1 / 1 / 3 / 3",
  "top-right": "1 / 3 / 2 / 4",
  "mid-right": "2 / 3 / 3 / 4",
  "bottom-left": "3 / 1 / 4 / 2",
  "bottom-center": "3 / 2 / 4 / 3",
  "bottom-right": "3 / 3 / 4 / 4",
};

const MAIN_SLOT: GridSlotId = "main";

function swapSlots(
  streams: Stream[],
  fromId: string,
  toSlot: GridSlotId
): Stream[] {
  const from = streams.find((s) => s.id === fromId);
  if (!from) return streams;

  const target = streams.find((s) => s.slot === toSlot);
  if (!target || target.id === fromId) return streams;

  return streams.map((s) => {
    if (s.id === fromId) return { ...s, slot: toSlot };
    if (s.id === target.id) return { ...s, slot: from.slot };
    return s;
  });
}

type ResizeAxis = "vertical" | "horizontal" | "sideStack";

export function NewsGrid() {
  const {
    t,
    streams,
    setStreams,
    sizes,
    setSizes,
    showTitles,
    setShowTitles,
  } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<GridSlotId | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{
    axis: ResizeAxis;
    start: number;
    initial: GridSizes;
  } | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(false);
    };
    const onBlur = () => setShiftHeld(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const colSum = sizes.col1 + sizes.col2 + sizes.col3;
  const rowSum = sizes.row1 + sizes.row2 + sizes.row3;
  const colSplit = (sizes.col1 + sizes.col2) / colSum;
  const rowSplit = (sizes.row1 + sizes.row2) / rowSum;
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `${sizes.col1}fr ${sizes.col2}fr ${sizes.col3}fr`,
    gridTemplateRows: `${sizes.row1}fr ${sizes.row2}fr ${sizes.row3}fr`,
    "--split-x": `${colSplit * 100}%`,
    "--split-y": `${rowSplit * 100}%`,
    "--split-side-y": `${(sizes.row1 / rowSum) * 100}%`,
  } as CSSProperties;

  const bindDrag = (id: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      setDragId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
      const el = e.currentTarget as HTMLElement;
      el.style.opacity = "0.55";
    },
    onDragEnd: (e: DragEvent) => {
      setDragId(null);
      setDropTarget(null);
      const el = e.currentTarget as HTMLElement;
      el.style.opacity = "";
    },
  });

  const handleDragOver = (e: DragEvent, slot: GridSlotId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(slot);
  };

  const handleDragLeave = () => setDropTarget(null);

  const handleDrop = (e: DragEvent, slot: GridSlotId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (!id) return;
    setStreams(swapSlots(streams, id, slot));
    setDragId(null);
    setDropTarget(null);
  };

  const startResize = useCallback(
    (axis: ResizeAxis, e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);
      setIsResizing(true);
      resizeRef.current = {
        axis,
        start: axis === "vertical" ? e.clientX : e.clientY,
        initial: { ...sizes },
      };
      document.body.style.cursor =
        axis === "vertical"
          ? "col-resize"
          : "row-resize";
      document.body.style.userSelect = "none";
    },
    [sizes]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = resizeRef.current;
      const grid = gridRef.current;
      if (!r || !grid) return;

      const rect = grid.getBoundingClientRect();
      const gap = 3;
      const gapsX = gap * 2;
      const gapsY = gap * 2;

      if (r.axis === "vertical") {
        const x = e.clientX - rect.left;
        const pct = Math.min(0.82, Math.max(0.48, (x - gap) / (rect.width - gapsX)));
        const mainFr = pct * 3;
        const sideFr = (1 - pct) * 3;
        setSizes({
          ...r.initial,
          col1: mainFr * 0.5,
          col2: mainFr * 0.5,
          col3: sideFr,
        });
      } else if (r.axis === "horizontal") {
        const y = e.clientY - rect.top;
        const pct = Math.min(0.82, Math.max(0.52, (y - gap) / (rect.height - gapsY)));
        const topFr = pct * 3;
        const bottomFr = (1 - pct) * 3;
        const topTotal = r.initial.row1 + r.initial.row2;
        const ratio = r.initial.row1 / topTotal;
        setSizes({
          ...r.initial,
          row1: topFr * ratio,
          row2: topFr * (1 - ratio),
          row3: bottomFr,
        });
      } else {
        const y = e.clientY - rect.top;
        const yNorm = (y - gap) / (rect.height - gapsY);
        const topTotal = r.initial.row1 + r.initial.row2;
        const fullSum = topTotal + r.initial.row3;
        const minRow1 = topTotal * 0.18;
        const maxRow1 = topTotal * 0.82;
        const targetRow1 = Math.min(
          maxRow1,
          Math.max(minRow1, yNorm * fullSum)
        );
        setSizes({
          ...r.initial,
          row1: targetRow1,
          row2: topTotal - targetRow1,
        });
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!resizeRef.current) return;
      resizeRef.current = null;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {
        /* released */
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className="news-shell">
      <header className="news-header">
        <div className="news-brand">
          <span className="news-brand-dot" aria-hidden />
          <h1>{t("brand")}</h1>
        </div>
        <p className="news-hint">
          {showTitles
            ? t("hint.withTitles")
            : shiftHeld
              ? t("hint.shiftHeld")
              : t("hint.noTitles")}
        </p>
        <div className="news-header-actions">
          <LanguageSwitcher />
        </div>
      </header>

      <div className="news-grid-wrap">
        <div
          ref={gridRef}
          className={`news-grid${isResizing ? " news-grid--resizing" : ""}`}
          style={gridStyle}
        >
          {streams.map((stream) => {
            const isMain = stream.slot === MAIN_SLOT;
            const isDragging = dragId === stream.id;
            const isDropHighlight =
              dropTarget === stream.slot && dragId !== stream.id;

            return (
              <article
                key={stream.id}
                className={[
                  "news-cell",
                  isMain ? "news-cell--main" : "news-cell--small",
                  !showTitles ? "news-cell--no-chrome" : "",
                  isDragging ? "news-cell--dragging" : "",
                  isDropHighlight ? "news-cell--drop-target" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ gridArea: SLOT_AREAS[stream.slot] }}
                onDragOver={(e) => handleDragOver(e, stream.slot)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stream.slot)}
              >
                {showTitles && (
                  <div className="news-cell-chrome" {...bindDrag(stream.id)}>
                    <span className="news-cell-grip" aria-hidden>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="currentColor"
                      >
                        <circle cx="3" cy="3" r="1.2" />
                        <circle cx="7" cy="3" r="1.2" />
                        <circle cx="11" cy="3" r="1.2" />
                        <circle cx="3" cy="7" r="1.2" />
                        <circle cx="7" cy="7" r="1.2" />
                        <circle cx="11" cy="7" r="1.2" />
                        <circle cx="3" cy="11" r="1.2" />
                        <circle cx="7" cy="11" r="1.2" />
                        <circle cx="11" cy="11" r="1.2" />
                      </svg>
                    </span>
                    <span className="news-cell-title">{stream.title}</span>
                    {isMain && (
                      <span className="news-cell-badge">{t("badge.primary")}</span>
                    )}
                  </div>
                )}

                <div className="news-cell-frame">
                  {!showTitles && !shiftHeld && (
                    <div
                      className="news-cell-drag-layer"
                      {...bindDrag(stream.id)}
                      aria-label={t("drag.panel", { title: stream.title })}
                    />
                  )}
                  <iframe
                    key={stream.embedUrl}
                    src={stream.embedUrl}
                    title={stream.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={
                      !showTitles
                        ? {
                            pointerEvents:
                              shiftHeld || dragId ? "auto" : "none",
                          }
                        : undefined
                    }
                  />
                </div>
              </article>
            );
          })}

          <div
            className="news-splitter news-splitter--vertical"
            role="separator"
            aria-orientation="vertical"
            aria-label={t("resize.vertical")}
            onPointerDown={(e) => startResize("vertical", e)}
          />
          <div
            className="news-splitter news-splitter--horizontal"
            role="separator"
            aria-orientation="horizontal"
            aria-label={t("resize.horizontal")}
            onPointerDown={(e) => startResize("horizontal", e)}
          />
          <div
            className="news-splitter news-splitter--side"
            role="separator"
            aria-orientation="horizontal"
            aria-label={t("resize.side")}
            onPointerDown={(e) => startResize("sideStack", e)}
          />
        </div>

        <button
          type="button"
          className="news-settings-fab"
          onClick={() => setSettingsOpen(true)}
          aria-label={t("settings.open")}
          title={t("settings.title")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        showTitles={showTitles}
        onShowTitlesChange={setShowTitles}
        streams={streams}
        onStreamsChange={setStreams}
      />
    </div>
  );
}
