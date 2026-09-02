import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TemplateGallery } from "./TemplateGallery";
import { accentPresets } from "@/lib/resume-accents";
import { clampSpacing, fontScales, fontStylePresets } from "@/lib/resume-typography";
import type { ResumeData } from "@/lib/resume-types";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { Minus, Plus, Palette, Type, LayoutTemplate, Check, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

export function CustomizePanel({ data, onChange }: Props) {
  const { t } = useI18n();
  const settings = data.settings;

  const update = (patch: Partial<ResumeData["settings"]>) =>
    onChange((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));

  const spacing = settings.lineSpacing ?? 1.5;

  return (
    <Accordion type="single" collapsible defaultValue="text" className="w-full">
      <AccordionItem value="text">
        <AccordionTrigger className="text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Type className="h-4 w-4" /> {t("custom.text")}
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("custom.style")}</Label>
              <Select value={settings.fontStyle ?? "modern"} onValueChange={(v) => update({ fontStyle: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontStylePresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {t(`font.${preset.id}` as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("custom.size")}</Label>
              <div className="flex items-end gap-1 rounded-md border border-border p-1">
                {fontScales.map((scale, index) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => update({ fontScale: scale })}
                    className={cn(
                      "flex-1 rounded px-2 py-1 transition-colors hover:bg-accent",
                      (settings.fontScale ?? 1) === scale && "bg-accent font-semibold"
                    )}
                    style={{ fontSize: `${11 + index * 4}px` }}
                    aria-label={`${Math.round(scale * 100)}%`}
                  >
                    Aa
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t("custom.spacing")}</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => update({ lineSpacing: clampSpacing(spacing - 0.1) })}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-14 text-center text-sm tabular-nums">{spacing.toFixed(1)}</span>
              <Button variant="outline" size="icon" onClick={() => update({ lineSpacing: clampSpacing(spacing + 0.1) })}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="color">
        <AccordionTrigger className="text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> {t("custom.color")}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {accentPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => update({ accent: preset.id })}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 transition-transform hover:scale-105",
                  settings.accent === preset.id && "ring-2 ring-foreground"
                )}
                style={{ backgroundColor: preset.color }}
                aria-label={preset.id}
              >
                {settings.accent === preset.id && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {settings.template === "tokyo" && (
        <AccordionItem value="palettes">
          <AccordionTrigger className="text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Droplets className="h-4 w-4" /> {t("custom.palettes")}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">{t("custom.palettesHint")}</p>
            <div className="grid grid-cols-3 gap-2">
              {accentPresets.map((preset) => {
                const active = (settings.accent ?? "coral") === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => update({ accent: preset.id })}
                    className={cn(
                      "overflow-hidden rounded-lg border border-border text-left transition-shadow hover:shadow-md",
                      active && "ring-2 ring-foreground"
                    )}
                    aria-pressed={active}
                  >
                    <span
                      className="block h-12 w-full bg-white"
                      style={{
                        backgroundImage: `radial-gradient(60% 70% at 20% 25%, ${preset.wash} 0%, transparent 70%), radial-gradient(55% 65% at 85% 80%, ${preset.wash} 0%, transparent 70%)`,
                      }}
                    />
                    <span className="flex items-center justify-between gap-1 px-2 py-1.5">
                      <span className="truncate text-[11px] font-medium">
                        {t(`accent.${preset.id}` as TranslationKey)}
                      </span>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: preset.color }} />
                    </span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value="templates" className="border-b-0">
        <AccordionTrigger className="text-sm font-semibold">
          <span className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" /> {t("custom.templates")}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <TemplateGallery data={data} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
