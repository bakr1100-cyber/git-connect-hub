import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, TrendingUp } from "lucide-react";
import { calculateResumeScore } from "@/lib/resume-score";
import type { ResumeData } from "@/lib/resume-types";
import { useI18n } from "@/lib/i18n";

export function ResumeScoreCard({ data }: { data: ResumeData }) {
  const { t } = useI18n();
  const { score, tips } = useMemo(() => calculateResumeScore(data), [data]);

  const label = score >= 85 ? t("score.great") : score >= 60 ? t("score.ok") : t("score.weak");
  const barColor = score >= 85 ? "bg-trust" : score >= 60 ? "bg-brand" : "bg-brand-dark";

  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardContent className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("score.title")}
            </div>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t("score.desc")}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-foreground">{score}</div>
            <div className="text-sm font-semibold text-primary">{label}</div>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="mt-4">
          {tips.length === 0 ? (
            <p className="flex items-center gap-2 text-xs text-foreground">
              <CheckCircle className="h-4 w-4 text-trust" />
              {t("score.perfect")}
            </p>
          ) : (
            <>
              <p className="text-sm font-bold text-foreground sm:text-base">{t("score.tips")}</p>
              <ul className="mt-3 space-y-2">
                {tips.slice(0, 4).map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    {t(tip)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
