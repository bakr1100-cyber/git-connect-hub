export const SUPPORTED_LOCALES = ["de", "en", "fr", "ar", "es", "it", "nl"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  ar: "العربية",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
};

export const localeFlags: Record<Locale, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  fr: "🇫🇷",
  ar: "🇲🇦",
  es: "🇪🇸",
  it: "🇮🇹",
  nl: "🇳🇱",
};

export const rtlLocales: Locale[] = ["ar"];

export const dateLocales: Record<Locale, string> = {
  de: "de-DE",
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-MA",
  es: "es-ES",
  it: "it-IT",
  nl: "nl-NL",
};

export const localeLanguageNames: Record<Locale, string> = {
  de: "German",
  en: "English",
  fr: "French",
  ar: "Arabic (Modern Standard)",
  es: "Spanish",
  it: "Italian",
  nl: "Dutch",
};

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function isRtl(locale: Locale) {
  return rtlLocales.includes(locale);
}
