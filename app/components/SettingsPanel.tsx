"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "../providers/AppProvider";
import type { GridSlotId, Stream } from "../types/grid";
import { isValidYoutubeInput, toEmbedUrl } from "../lib/youtube";

type Props = {
  open: boolean;
  onClose: () => void;
  showTitles: boolean;
  onShowTitlesChange: (value: boolean) => void;
  streams: Stream[];
  onStreamsChange: (streams: Stream[]) => void;
};

export function SettingsPanel({
  open,
  onClose,
  showTitles,
  onShowTitlesChange,
  streams,
  onStreamsChange,
}: Props) {
  const { t } = useApp();
  const [drafts, setDrafts] = useState(streams);
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) setDrafts(streams);
  }, [open, streams]);

  const updateDraft = (id: string, patch: Partial<Stream>) => {
    setDrafts((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const slotLabel = (slot: GridSlotId) => t(`slot.${slot}`);

  const fetchTitle = useCallback(
    async (id: string, urlInput: string) => {
      if (!isValidYoutubeInput(urlInput)) {
        setErrors((e) => ({
          ...e,
          [id]: t("settings.errors.invalidUrl"),
        }));
        return;
      }
      setFetchingId(id);
      setErrors((e) => {
        const next = { ...e };
        delete next[id];
        return next;
      });
      try {
        const res = await fetch(
          `/api/youtube-metadata?url=${encodeURIComponent(urlInput)}`
        );
        const data = (await res.json()) as { title?: string; error?: string };
        if (!res.ok || !data.title) {
          setErrors((e) => ({
            ...e,
            [id]: data.error ?? t("settings.errors.fetchFailed"),
          }));
          return;
        }
        updateDraft(id, { title: data.title });
      } catch {
        setErrors((e) => ({ ...e, [id]: t("settings.errors.network") }));
      } finally {
        setFetchingId(null);
      }
    },
    [t]
  );

  const apply = () => {
    const next: Stream[] = [];
    const newErrors: Record<string, string> = {};

    for (const d of drafts) {
      const embed = toEmbedUrl(d.embedUrl);
      if (!embed) {
        newErrors[d.id] = t("settings.errors.invalidYoutube");
        next.push(d);
        continue;
      }
      next.push({ ...d, embedUrl: embed });
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onStreamsChange(next);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="settings-backdrop" onClick={onClose} role="presentation">
      <aside
        className="settings-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="settings-title"
        aria-modal="true"
      >
        <header className="settings-header">
          <h2 id="settings-title">{t("settings.title")}</h2>
          <button
            type="button"
            className="settings-close"
            onClick={onClose}
            aria-label={t("settings.close")}
          >
            ×
          </button>
        </header>

        <section className="settings-section">
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={showTitles}
              onChange={(e) => onShowTitlesChange(e.target.checked)}
            />
            <span className="settings-toggle-ui" aria-hidden />
            <span className="settings-toggle-label">
              {t("settings.showTitles")}
              <small>{t("settings.showTitlesHint")}</small>
            </span>
          </label>
        </section>

        <section className="settings-section">
          <h3>{t("settings.streamSources")}</h3>
          <p className="settings-note">{t("settings.streamNote")}</p>

          <ul className="settings-streams">
            {drafts.map((stream) => (
              <li key={stream.id} className="settings-stream-item">
                <div className="settings-stream-meta">
                  <span className="settings-slot-badge">
                    {slotLabel(stream.slot)}
                  </span>
                </div>
                <label className="settings-field">
                  <span>{t("settings.displayName")}</span>
                  <input
                    type="text"
                    value={stream.title}
                    onChange={(e) =>
                      updateDraft(stream.id, { title: e.target.value })
                    }
                  />
                </label>
                <label className="settings-field">
                  <span>{t("settings.youtubeUrl")}</span>
                  <input
                    type="url"
                    placeholder={t("settings.urlPlaceholder")}
                    value={stream.embedUrl}
                    onChange={(e) =>
                      updateDraft(stream.id, { embedUrl: e.target.value })
                    }
                  />
                </label>
                {errors[stream.id] && (
                  <p className="settings-error">{errors[stream.id]}</p>
                )}
                <button
                  type="button"
                  className="settings-fetch-btn"
                  disabled={fetchingId === stream.id}
                  onClick={() => fetchTitle(stream.id, stream.embedUrl)}
                >
                  {fetchingId === stream.id
                    ? t("settings.fetching")
                    : t("settings.fetchTitle")}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <footer className="settings-footer">
          <button
            type="button"
            className="settings-btn settings-btn--ghost"
            onClick={onClose}
          >
            {t("settings.cancel")}
          </button>
          <button
            type="button"
            className="settings-btn settings-btn--primary"
            onClick={apply}
          >
            {t("settings.saveApply")}
          </button>
        </footer>
      </aside>
    </div>
  );
}
