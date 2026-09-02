import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { de, type Dictionary, type TranslationKey } from "./de";
import { en } from "./en";
import { fr } from "./fr";
import { ar } from "./ar";
import { es } from "./es";
import { it } from "./it";
import { nl } from "./nl";
import { isLocale, isRtl, type Locale } from "./locales";

const dictionaries: Record<Locale, Dictionary> = {
  de: de as unknown as Dictionary,
  en: en as unknown as Dictionary,
  fr: fr as unknown as Dictionary,
  ar: ar as unknown as Dictionary,
  es: es as unknown as Dictionary,
  it: it as unknown as Dictionary,
  nl: nl as unknown as Dictionary,
};

const STORAGE_KEY = "ui-locale-v1";

export function translate(locale: Locale, key: TranslationKey) {
  return dictionaries[locale][key] ?? dictionaries.de[key] ?? key;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("de");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isLocale(stored)) {
      setLocaleState(stored);
      return;
    }
    const browser = window.navigator.language?.slice(0, 2).toLowerCase();
    if (browser && isLocale(browser)) setLocaleState(browser);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: TranslationKey) => translate(locale, key),
      dir: isRtl(locale) ? "rtl" : "ltr",
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const fallbackI18n: I18nContextValue = {
  locale: "de",
  setLocale: () => {},
  t: (key: TranslationKey) => translate("de", key),
  dir: "ltr",
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  // During hot reloads the provider module can be re-evaluated separately from
  // consumers; fall back to German instead of crashing the whole page.
  return ctx ?? fallbackI18n;
}


export type { Locale, TranslationKey };
