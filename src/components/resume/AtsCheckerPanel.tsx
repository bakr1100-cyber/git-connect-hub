import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumeScoreCard } from "./ResumeScoreCard";
import { calculateResumeScore } from "@/lib/resume-score";
import type { ResumeData } from "@/lib/resume-types";
import { useI18n } from "@/lib/i18n";
import { FileSearch, Info } from "lucide-react";

interface Props {
  data: ResumeData;
  /** Jumps back into the wizard at the given step index. */
  onEditStep: (step: number) => void;
}

/** Minimum completeness required before an ATS analysis is shown. */
const ANALYSIS_THRESHOLD = 50;

export function AtsCheckerPanel({ data, onEditStep }: Props) {
  const { t } = useI18n();
  const { score } = useMemo(() => calculateResumeScore(data), [data]);
  const ready = score >= ANALYSIS_THRESHOLD;

  const firstMissingStep = useMemo(() => {
    if (!data.personalDetails.fullName.trim() || !data.personalDetails.email.trim()) return 0;
    if (data.education.length === 0) return 1;
    if (data.workExperience.length === 0) return 2;
    if (data.skills.length === 0) return 3;
    return 4;
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {t("ats.resultsTitle")}
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {ready ? (
        <ResumeScoreCard data={data} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted">
              <FileSearch className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                {t("ats.notAnalysed")}
              </Badge>
              <p className="text-xs leading-relaxed text-muted-foreground">{t("ats.hint")}</p>
              <Button variant="outline" size="sm" onClick={() => onEditStep(firstMissingStep)}>
                {t("ats.addMissing")}
              </Button>
            </div>
          </div>

          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${score}%` }} />
          </div>
          <p className="mt-2 text-right text-[11px] text-muted-foreground">{score}% / {ANALYSIS_THRESHOLD}%</p>
        </div>
      )}
    </div>
  );
}
