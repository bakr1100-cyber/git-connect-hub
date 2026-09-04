import { translate } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/de";
import type { Locale } from "@/lib/i18n/locales";
import type { TemplateId } from "@/lib/resume-types";
import type { TemplateLabelFile } from "./types";

import { labels as minimalist } from "./minimalist";
import { labels as modern } from "./modern";
import { labels as european } from "./european";
import { labels as tokyo } from "./tokyo";
import { labels as azur } from "./azur";
import { labels as esmeralda } from "./esmeralda";
import { labels as marina } from "./marina";
import { labels as milano } from "./milano";
import { labels as verona } from "./verona";
import { labels as sofia } from "./sofia";
import { labels as amber } from "./amber";

export const templateLabelFiles: Record<TemplateId, TemplateLabelFile> = {
  minimalist,
  modern,
  european,
  tokyo,
  azur,
  esmeralda,
  marina,
  milano,
  verona,
  sofia,
  amber,
};

/**
 * Übersetzt eine Bezeichnung im Kontext eines Templates.
 * Reihenfolge: Sprachdatei des Templates -> globales Wörterbuch.
 */
export function templateTranslate(
  template: TemplateId,
  locale: Locale,
  key: TranslationKey,
): string {
  return templateLabelFiles[template]?.[locale]?.[key] ?? translate(locale, key);
}

export type { TemplateLabelFile };
