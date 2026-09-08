import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { templateCopy } from "@/components/templates/templateCopy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { accentPresets } from "@/lib/resume-accents";
import { TemplatePreviewThumb } from "./TemplatePreviewThumb";
import type { TranslationKey } from "@/lib/i18n";
import type { ResumeData, ResumeSettings } from "@/lib/resume-types";

type TemplateId = ResumeSettings["template"];

const templates: { id: TemplateId; badge?: "recommended" | "new" }[] = [
  { id: "modern", badge: "recommended" },
  { id: "minimalist" },
  { id: "tokyo" },
  { id: "azur" },
  { id: "esmeralda" },
  { id: "marina" },
  { id: "milano" },
  { id: "verona" },
  { id: "sofia" },
  { id: "amber", badge: "new" },
  { id: "european" },
];

interface TemplateGalleryProps {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
  /** "finish" shows the colour picker first and hides the templates behind a question. */
  variant?: "full" | "finish";
}


export function TemplateGallery({ data, onChange, variant = "full" }: TemplateGalleryProps) {
  const { t, locale } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [templatesOpen, setTemplatesOpen] = useState(variant === "full");
  const activeTemplate = data.settings.template;
  const activeAccent = data.settings.accent ?? "slate";

  const scrollBy = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  };

  const selectTemplate = (template: TemplateId) =>
    onChange((prev) => ({ ...prev, settings: { ...prev.settings, template } }));

  const selectAccent = (accent: string) =>
    onChange((prev) => ({ ...prev, settings: { ...prev.settings, accent } }));

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4">
      {variant === "finish" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">{t("gallery.color")}</h2>
            <p className="text-xs text-muted-foreground">{t("gallery.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {accentPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectAccent(preset.id)}
                aria-label={t(`accent.${preset.id}` as TranslationKey)}
                title={t(`accent.${preset.id}` as TranslationKey)}
                aria-pressed={preset.id === activeAccent}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                  preset.id === activeAccent ? "border-foreground" : "border-border"
                )}
                style={{ backgroundColor: preset.color }}
              />
            ))}
          </div>
        </div>
      )}

      {variant === "finish" && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-sm font-medium text-foreground">{t("wizard.changeTemplate")}</p>
          <Button variant="outline" size="sm" onClick={() => setTemplatesOpen((open) => !open)}>
            {templatesOpen ? t("wizard.hideTemplates") : t("wizard.showTemplates")}
          </Button>
        </div>
      )}

      <div className={cn("flex items-end justify-between gap-3", !templatesOpen && "hidden")}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
            {t("templates.eyebrow")}
          </p>
          <h2 className="text-base font-bold text-foreground">{t("gallery.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("gallery.subtitle")}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" asChild>
            <Link to="/templates">
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {templateCopy(locale).title}
            </Link>
          </Button>
          <div className="hidden gap-1 sm:flex">
            <Button variant="outline" size="icon" aria-label={t("gallery.prev")} onClick={() => scrollBy(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label={t("gallery.next")} onClick={() => scrollBy(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>


      <div
        ref={scrollerRef}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]",
          !templatesOpen && "hidden"
        )}
      >
        {templates.map(({ id, badge }) => {
          const isActive = id === activeTemplate;
          return (
            <motion.div
              key={id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "group relative w-[220px] shrink-0 snap-start overflow-hidden rounded-lg border-2 bg-muted/40",
                isActive ? "border-brand shadow-md" : "border-border"
              )}
            >
              <div className="absolute left-2 top-2 z-10 flex gap-1">
                {badge && (
                  <Badge className="bg-cta text-cta-foreground hover:bg-cta">
                    {t(badge === "new" ? "templates.new" : "templates.recommended")}
                  </Badge>
                )}
                {isActive && (
                  <Badge className="bg-brand text-primary-foreground hover:bg-brand">
                    <Check className="mr-1 h-3 w-3" />
                    {t("gallery.active")}
                  </Badge>
                )}
              </div>

              <button
                type="button"
                onClick={() => selectTemplate(id)}
                className="block aspect-[210/297] w-full cursor-pointer"
                aria-label={t(`template.${id}`)}
              >
                <TemplatePreviewThumb template={id} accent={activeAccent} />
              </button>

              {/* Hover CTA */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-foreground/85 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button
                  size="sm"
                  onClick={() => selectTemplate(id)}
                  className="pointer-events-auto w-full bg-cta font-semibold text-cta-foreground hover:bg-cta/90"
                >
                  {t("templates.use")}
                </Button>
              </div>

              <div className="border-t border-border bg-card px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{t(`template.${id}`)}</p>
                <p className="text-xs text-muted-foreground">{t(`template.${id}Desc`)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className={cn("flex flex-wrap items-center gap-3 border-t border-border pt-3", variant === "finish" && "hidden")}>
        <p className="text-sm font-medium text-foreground">{t("gallery.color")}</p>
        <div className="flex items-center gap-2">
          {accentPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectAccent(preset.id)}
              aria-label={t(`accent.${preset.id}` as TranslationKey)}
              title={t(`accent.${preset.id}` as TranslationKey)}
              aria-pressed={preset.id === activeAccent}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                preset.id === activeAccent ? "border-foreground" : "border-border"
              )}
              style={{ backgroundColor: preset.color }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
