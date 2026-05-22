"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildSettingsQuery,
  parseSettingsFromParams,
  type AppState,
} from "../lib/settings-url";
import { DEFAULT_SIZES } from "../lib/storage";
import type { Stream } from "../types/grid";
import type { Locale } from "../i18n/locales";

export function useSettingsUrl(fallbackStreams: Stream[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<AppState>(() => ({
    locale: "tr",
    showTitles: true,
    streams: fallbackStreams,
    sizes: DEFAULT_SIZES,
  }));

  const skipNextWrite = useRef(false);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyFromUrl = useCallback(() => {
    const parsed = parseSettingsFromParams(searchParams, fallbackStreams);
    skipNextWrite.current = true;
    setState(parsed);
    setHydrated(true);
  }, [searchParams, fallbackStreams]);

  useEffect(() => {
    applyFromUrl();
  }, [applyFromUrl]);

  const pushToUrl = useCallback(
    (next: AppState, immediate = false) => {
      const run = () => {
        const qs = buildSettingsQuery(next);
        const href = qs ? `${pathname}?${qs}` : pathname;
        router.replace(href, { scroll: false });
      };
      if (immediate) {
        if (writeTimer.current) clearTimeout(writeTimer.current);
        run();
        return;
      }
      if (writeTimer.current) clearTimeout(writeTimer.current);
      writeTimer.current = setTimeout(run, 350);
    },
    [pathname, router]
  );

  useEffect(() => {
    if (!hydrated || skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    pushToUrl(state);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [hydrated, state, pushToUrl]);

  const setLocale = useCallback(
    (locale: Locale) => {
      setState((prev) => {
        const next = { ...prev, locale };
        pushToUrl(next, true);
        return next;
      });
    },
    [pushToUrl]
  );

  const setShowTitles = useCallback((showTitles: boolean) => {
    setState((prev) => ({ ...prev, showTitles }));
  }, []);

  const setStreams = useCallback(
    (streams: Stream[]) => {
      setState((prev) => {
        const next = { ...prev, streams };
        pushToUrl(next, true);
        return next;
      });
    },
    [pushToUrl]
  );

  const setSizes = useCallback((sizes: AppState["sizes"]) => {
    setState((prev) => ({ ...prev, sizes }));
  }, []);

  return {
    hydrated,
    locale: state.locale,
    setLocale,
    showTitles: state.showTitles,
    setShowTitles,
    streams: state.streams,
    setStreams,
    sizes: state.sizes,
    setSizes,
  };
}
