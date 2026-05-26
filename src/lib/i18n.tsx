"use client";

// Lightweight in-house i18n. Phase 1 of workspace i18n task — covers a single
// route (home) and the language switch UI. Locale is persisted in localStorage,
// no URL prefix (no `next-intl`). If/when i18n grows past a couple of routes,
// migrate to `next-intl` with `[locale]` routing for SEO.
//
// SSR renders the default locale (`ko`); client hydration may switch and
// re-render. The temporary `lang` attribute mismatch is acceptable for Phase 1.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import koMessages from "@/locales/ko.json";
import enMessages from "@/locales/en.json";
import zhMessages from "@/locales/zh.json";

export const LOCALES = ["ko", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
};

type Messages = Record<string, string>;

const MESSAGES: Record<Locale, Messages> = {
  ko: koMessages,
  en: enMessages,
  zh: zhMessages,
};

const STORAGE_KEY = "ba-torment.locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage after mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) setLocaleState(stored);
    } catch {
      // ignore (private mode, disabled storage, etc.)
    }
  }, []);

  // Keep <html lang> in sync.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = MESSAGES[locale];
    const fallback = MESSAGES[DEFAULT_LOCALE];
    return {
      locale,
      setLocale,
      t: (key: string) => dict[key] ?? fallback[key] ?? key,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslations() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslations must be used within I18nProvider");
  return ctx;
}
