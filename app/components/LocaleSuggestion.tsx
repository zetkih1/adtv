"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "../providers/AppProvider";

const DISMISS_KEY = "adtv-locale-suggest-dismissed";

export function LocaleSuggestion() {
  const { hydrated, locale, setLocale, t } = useApp();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(true);

  const explicitLang = searchParams.has("lang");

  useEffect(() => {
    if (!hydrated || explicitLang || locale !== "tr") {
      setChecking(false);
      return;
    }

    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        setChecking(false);
        return;
      }
    } catch {
      /* private mode */
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/geo");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          inTurkey?: boolean;
          country?: string | null;
        };
        if (!cancelled && data.inTurkey === false) {
          setVisible(true);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, explicitLang, locale]);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const switchToEnglish = () => {
    setLocale("en");
    dismiss();
  };

  if (checking || !visible) return null;

  return (
    <div className="locale-suggest" role="dialog" aria-labelledby="locale-suggest-title">
      <div className="locale-suggest-inner">
        <p id="locale-suggest-title" className="locale-suggest-title">
          {t("geo.suggestTitle")}
        </p>
        <p className="locale-suggest-body">{t("geo.suggestBody")}</p>
        <div className="locale-suggest-actions">
          <button
            type="button"
            className="locale-suggest-btn locale-suggest-btn--primary"
            onClick={switchToEnglish}
          >
            {t("geo.switchEn")}
          </button>
          <button
            type="button"
            className="locale-suggest-btn locale-suggest-btn--ghost"
            onClick={dismiss}
          >
            {t("geo.stayTr")}
          </button>
        </div>
        <button
          type="button"
          className="locale-suggest-close"
          onClick={dismiss}
          aria-label={t("geo.dismiss")}
        >
          ×
        </button>
      </div>
    </div>
  );
}
