import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ResumeData } from "@/lib/resume-types";
import { getAccent, resolveAccentId } from "@/lib/resume-accents";
import { getFontStack } from "@/lib/resume-typography";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { EuropeanTemplate } from "./templates/EuropeanTemplate";
import { TokyoTemplate } from "./templates/TokyoTemplate";
import { AzurTemplate } from "./templates/AzurTemplate";
import { EsmeraldaTemplate } from "./templates/EsmeraldaTemplate";
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
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
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
          : data.settings.template === "azur"
            ? AzurTemplate
            : data.settings.template === "esmeralda"
              ? EsmeraldaTemplate
              : ModernTemplate;

  useEffect(() => {
    const frame = frameRef.current;
    const page = pageRef.current;
    if (!frame || !page) return;

    const updateScale = () => {
      const pageWidth = page.offsetWidth;
      if (pageWidth === 0) return;
      setPreviewScale(Math.min(1, frame.clientWidth / pageWidth));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[210mm]">
      {!hideCaption && (
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">{t("editor.livePreview")}</p>
          <p className="text-xs text-muted-foreground">{t(`template.${data.settings.template}`)}</p>
        </div>
      )}
      <div
        ref={frameRef}
        className="resume-preview-frame relative w-full overflow-hidden print:overflow-visible"
        style={{ height: `calc(297mm * ${previewScale})` }}
      >
        <div
          ref={pageRef}
          id="resume-preview-container"
          dir={isRtl(data.settings.language) ? "rtl" : "ltr"}
          className={cn(
            "resume-preview-page relative h-[297mm] w-[210mm] origin-top-left overflow-hidden bg-white p-[20mm] shadow-sm",
            "print:shadow-none print:p-0"
          )}
          style={
            {
              transform: `scale(${previewScale})`,
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
    </div>
  );
}
