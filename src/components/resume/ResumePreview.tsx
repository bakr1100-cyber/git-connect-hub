import type { CSSProperties } from "react";
import type { ResumeData } from "@/lib/resume-types";
import { getAccent, resolveAccentId } from "@/lib/resume-accents";
import { getFontStack } from "@/lib/resume-typography";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { EuropeanTemplate } from "./templates/EuropeanTemplate";
import { TokyoTemplate } from "./templates/TokyoTemplate";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { isRtl } from "@/lib/i18n/locales";

interface ResumePreviewProps {
  data: ResumeData;
  /** Hides the "Live preview"/template caption (used for read-only share links). */
  hideCaption?: boolean;
}

export function ResumePreview({ data, hideCaption = false }: ResumePreviewProps) {
  const { t } = useI18n();
  // Tokyo lives from its watercolour washes – fall back to coral instead of the neutral default.
  const accentId = resolveAccentId(data.settings.template, data.settings.accent);
  const accent = getAccent(accentId);
  const fontFamily = getFontStack(data.settings.fontStyle);
  const fontScale = data.settings.fontScale ?? 1;
  const lineSpacing = data.settings.lineSpacing ?? 1.5;
  const Template =
    data.settings.template === "minimalist"
      ? MinimalistTemplate
      : data.settings.template === "european"
        ? EuropeanTemplate
        : data.settings.template === "tokyo"
          ? TokyoTemplate
          : ModernTemplate;

  return (
    <div className="mx-auto max-w-[210mm]">
      {!hideCaption && (
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">{t("editor.livePreview")}</p>
        <p className="text-xs text-muted-foreground">{t(`template.${data.settings.template}`)}</p>
      </div>
      )}
      <div
        id="resume-preview-container"
        dir={isRtl(data.settings.language) ? "rtl" : "ltr"}
        className={cn(
          "relative min-h-[297mm] w-full overflow-hidden bg-white p-[20mm] shadow-sm",
          "print:shadow-none print:p-0"
        )}
        style={
          {
            aspectRatio: "210 / 297",
            "--resume-accent": accent.color,
            "--resume-accent-soft": accent.soft,
            "--resume-accent-wash": accent.wash,
            fontFamily,
            fontSize: `${fontScale * 100}%`,
            lineHeight: lineSpacing,
          } as CSSProperties
        }
      >
        <Template data={data} />
      </div>
    </div>
  );
}
