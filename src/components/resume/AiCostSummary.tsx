import { Receipt } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  aiActionPrices,
  formatEur,
  useAiCostEstimate,
  type AiCostAction,
} from "@/lib/ai-cost";
import type { TranslationKey } from "@/lib/i18n/de";

const actionLabelKeys: Record<AiCostAction, TranslationKey> = {
  optimize: "aiCost.action.optimize",
  translate: "aiCost.action.translate",
  coverLetter: "aiCost.action.coverLetter",
  transcribe: "aiCost.action.transcribe",
  parseResume: "aiCost.action.parseResume",
};

/** Shows the estimated AI cost for the current resume before saving/downloading. */
export function AiCostSummary({ className, compact }: { className?: string; compact?: boolean }) {
  const { t, locale } = useI18n();
  const { counts, calls, total } = useAiCostEstimate();

  const rows = (Object.keys(actionLabelKeys) as AiCostAction[]).filter((a) => counts[a] > 0);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground ${className ?? ""}`}
      >
        <Receipt className="h-3.5 w-3.5" />
        <span>
          {t("aiCost.badge")}: {formatEur(total, locale)}
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-border bg-card p-4 text-left ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Receipt className="h-4 w-4 text-primary" />
        {t("aiCost.title")}
      </div>

      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{t("aiCost.none")}</p>
      ) : (
        <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          {rows.map((action) => (
            <li key={action} className="flex items-center justify-between gap-3">
              <span>
                {t(actionLabelKeys[action])} × {counts[action]}
              </span>
              <span className="tabular-nums">
                {formatEur(counts[action] * aiActionPrices[action], locale)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-sm font-semibold text-foreground">
        <span>{t("aiCost.total")}</span>
        <span className="tabular-nums">{formatEur(total, locale)}</span>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {t("aiCost.hint")} ({calls} {t("aiCost.calls")})
      </p>
    </div>
  );
}
