import type { Locale } from "@/lib/i18n/locales";
import type { TranslationKey } from "@/lib/i18n/de";

/** Pro Template eine eigene Sprachdatei: Locale -> überschriebene Bezeichnungen. */
export type TemplateLabelFile = Partial<Record<Locale, Partial<Record<TranslationKey, string>>>>;
