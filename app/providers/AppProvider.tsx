"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSettingsUrl } from "../hooks/useSettingsUrl";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locales";
import { translate } from "../i18n/messages";
import { DEFAULT_SIZES, type GridSizes } from "../lib/storage";
import type { Stream } from "../types/grid";
import { STREAMS as STREAM_CONFIG } from "../config/streams";
import { LocaleSuggestion } from "../components/LocaleSuggestion";

type AppContextValue = {
  hydrated: boolean;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  showTitles: boolean;
  setShowTitles: (value: boolean) => void;
  streams: Stream[];
  setStreams: (streams: Stream[]) => void;
  sizes: GridSizes;
  setSizes: (sizes: GridSizes) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const fallbackStreams = STREAM_CONFIG.map((s) => ({ ...s }));

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    hydrated,
    locale,
    setLocale,
    showTitles,
    setShowTitles,
    streams,
    setStreams,
    sizes,
    setSizes,
  } = useSettingsUrl(fallbackStreams);

  const [localeUi, setLocaleUi] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    if (hydrated) setLocaleUi(locale);
  }, [hydrated, locale]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = localeUi;
    document.title = translate(localeUi, "meta.title");
  }, [hydrated, localeUi]);

  const setLocaleAndUrl = useCallback(
    (next: Locale) => {
      setLocaleUi(next);
      setLocale(next);
    },
    [setLocale]
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string>) =>
      translate(localeUi, key, vars),
    [localeUi]
  );

  const value = useMemo(
    () => ({
      hydrated,
      locale: localeUi,
      setLocale: setLocaleAndUrl,
      t,
      showTitles,
      setShowTitles,
      streams,
      setStreams,
      sizes,
      setSizes,
    }),
    [
      hydrated,
      localeUi,
      setLocaleAndUrl,
      t,
      showTitles,
      setShowTitles,
      streams,
      setStreams,
      sizes,
      setSizes,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <LocaleSuggestion />
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
