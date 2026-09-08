import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAiUsage } from "@/lib/resume-ai.functions";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Download, Mail, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PACKAGES, useEntitlements } from "@/lib/entitlements";
import type { TranslationKey } from "@/lib/i18n/de";
import { downloadInvoice, formatReceiptAmount } from "@/lib/invoice";

/** Shows how many AI suggestions the signed-in account has left today. */
function AiQuotaRow() {
  const { t } = useI18n();
  const loadUsage = useServerFn(getAiUsage);
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  useEffect(() => {
    let active = true;
    void loadUsage()
      .then((data) => {
        if (active) setUsage(data as { used: number; limit: number; remaining: number });
      })
      .catch(() => {
        /* signed out or quota unavailable */
      });
    return () => {
      active = false;
    };
  }, [loadUsage]);

  if (!usage) return null;

  return (
    <div className="mt-5 flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-medium">{t("ai.remaining")}</p>
          <p className="text-xs text-muted-foreground">
            {t("ai.remainingDetail").replace("{used}", String(usage.used)).replace("{limit}", String(usage.limit))}
          </p>
        </div>
      </div>
      <span className="text-lg font-bold">{usage.remaining}</span>
    </div>
  );
}

/** Zeigt den aktuellen Zahlungsstatus und die Rechnungen des Kontos. */
export function PaymentStatusCard() {
  const { t } = useI18n();
  const { purchase, receipts } = useEntitlements();

  const status = purchase?.status ?? "none";

  return (
    <div className="rounded-lg border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {status === "active" ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : status === "pending" ? (
            <Clock className="h-5 w-5 text-muted-foreground" />
          ) : status === "failed" ? (
            <XCircle className="h-5 w-5 text-destructive" />
          ) : (
            <Clock className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">{t("pay.status.label")}</p>
            <p className="text-sm text-muted-foreground">
              {status === "active"
                ? `${t("pay.status.active")} · ${t("pkg.activeUntil")} ${new Date(purchase!.expiresAt).toLocaleDateString()}`
                : status === "pending"
                  ? t("pay.status.pending")
                  : status === "failed"
                    ? t("pay.status.failed")
                    : t("pay.status.none")}
            </p>
          </div>
        </div>
        {status === "active" && <Badge>{t("pkg.active")}</Badge>}
      </div>

      <AiQuotaRow />

      <div className="mt-5 border-t pt-4">
        <p className="text-sm font-medium">{t("invoice.title")}</p>

        {receipts.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t("invoice.none")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {receipts.map((receipt) => (
              <li
                key={receipt.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {receipt.id} · {formatReceiptAmount(receipt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(receipt.purchasedAt).toLocaleDateString()} ·{" "}
                    {t(PACKAGES[receipt.tier].nameKey as TranslationKey)}
                    {receipt.emailSent ? ` · ${t("invoice.emailSent")}` : ""}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadInvoice(receipt)}>
                  <Download className="mr-1.5 h-4 w-4" />
                  {t("invoice.download")}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          {t("invoice.hint")}
        </p>
      </div>
    </div>
  );
}
