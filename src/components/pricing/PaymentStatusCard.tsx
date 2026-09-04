import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Download, Mail, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useEntitlements } from "@/lib/entitlements";
import { downloadInvoice, formatReceiptAmount } from "@/lib/invoice";

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
                    {receipt.tier === "premium" ? t("pricing.premium.name") : t("pricing.standard.name")}
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
