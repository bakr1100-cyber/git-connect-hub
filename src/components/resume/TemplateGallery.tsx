import { useRef } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { accentPresets, getAccent } from "@/lib/resume-accents";
import type { TranslationKey } from "@/lib/i18n";
import type { ResumeData, ResumeSettings } from "@/lib/resume-types";

type TemplateId = ResumeSettings["template"];

const templates: { id: TemplateId; badge?: "recommended" | "new" }[] = [
  { id: "modern", badge: "recommended" },
  { id: "minimalist" },
  { id: "tokyo", badge: "new" },
  { id: "european" },
];

interface TemplateGalleryProps {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

function TemplateThumb({ template, accent }: { template: TemplateId; accent: string }) {
  const soft = getAccent(accent).soft;
  const color = getAccent(accent).color;

  if (template === "tokyo") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-white p-3">
        <div
          className="absolute -left-4 -top-4 h-16 w-24 rounded-full blur-lg"
          style={{ backgroundColor: soft }}
        />
        <div
          className="absolute -bottom-5 -right-4 h-14 w-20 rounded-full blur-lg"
          style={{ backgroundColor: soft }}
        />
        <div className="relative">
          <div className="h-3 w-3/5 rounded bg-slate-300" />
          <div className="mt-1 h-1.5 w-2/5 rounded bg-slate-200" />
          <div className="mt-3 flex gap-2">
            <div className="w-[36%] space-y-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-1 rounded bg-slate-200" />
              ))}
              <div className="mt-2 h-1.5 w-3/4 rounded" style={{ backgroundColor: color }} />
            </div>
            <div className="flex-1 space-y-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-1 rounded bg-slate-200" />
              ))}
              <div className="mt-2 h-1.5 w-1/2 rounded" style={{ backgroundColor: color }} />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-1 rounded bg-slate-200" style={{ width: `${55 + ((i * 17) % 40)}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template === "european") {
    return (
      <div className="flex h-full w-full bg-white">
        <div className="h-full w-[36%] p-2" style={{ backgroundColor: soft }}>
          <div className="mb-2 h-6 w-6 rounded" style={{ backgroundColor: color }} />
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-1 rounded bg-slate-300" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-1.5 p-2">
          <div className="h-2 w-3/4 rounded" style={{ backgroundColor: color }} />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-1 rounded bg-slate-200" style={{ width: `${60 + ((i * 13) % 35)}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (template === "minimalist") {
    return (
      <div className="h-full w-full bg-white p-3">
        <div className="border-b-2 pb-2" style={{ borderColor: color }}>
          <div className="h-2.5 w-2/3 rounded bg-slate-800" />
          <div className="mt-1 h-1.5 w-1/3 rounded bg-slate-300" />
        </div>
        <div className="mt-2 space-y-1.5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-1 rounded bg-slate-200" style={{ width: `${55 + ((i * 17) % 40)}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white">
      <div className="p-3" style={{ backgroundColor: color }}>
        <div className="h-2.5 w-2/3 rounded bg-white/90" />
        <div className="mt-1.5 h-1.5 w-1/3 rounded bg-white/50" />
      </div>
      <div className="space-y-1.5 p-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-1 rounded bg-slate-200" style={{ width: `${55 + ((i * 19) % 40)}%` }} />
        ))}
      </div>
    </div>
  );
}

export function TemplateGallery({ data, onChange }: TemplateGalleryProps) {
  const { t } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);
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
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
            {t("templates.eyebrow")}
          </p>
          <h2 className="text-base font-bold text-foreground">{t("gallery.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("gallery.subtitle")}</p>
        </div>
        <div className="hidden gap-1 sm:flex">
          <Button variant="outline" size="icon" aria-label={t("gallery.prev")} onClick={() => scrollBy(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label={t("gallery.next")} onClick={() => scrollBy(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]"
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
                className="block h-[280px] w-full cursor-pointer"
                aria-label={t(`template.${id}`)}
              >
                <TemplateThumb template={id} accent={activeAccent} />
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

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
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
