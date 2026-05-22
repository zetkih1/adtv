"use client";

import { LOCALE_LABELS, LOCALES, type Locale } from "../i18n/locales";
import { useApp } from "../providers/AppProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useApp();

  return (
    <div
      className="lang-switcher"
      role="group"
      aria-label={t("lang.switch")}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-switcher-btn${locale === code ? " lang-switcher-btn--active" : ""}`}
          onClick={() => setLocale(code as Locale)}
          aria-pressed={locale === code}
          title={LOCALE_LABELS[code]}
        >
          {t(`lang.${code}`)}
        </button>
      ))}
    </div>
  );
}
