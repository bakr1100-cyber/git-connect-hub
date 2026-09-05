import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Clock, Loader2, Lock, Mail, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { PACKAGES, useEntitlements, type Tier } from "@/lib/entitlements";
import { sendPurchaseReceipt } from "@/lib/email.functions";
import { useAuth } from "@/hooks/useAuth";

interface CheckoutDialogProps {
  tier: Tier | null;
  onOpenChange: (open: boolean) => void;
  onPurchased?: () => void;
}

type Phase = "idle" | "processing" | "confirming" | "active" | "failed";

/**
 * Purchase flow for one package. Funktionen werden erst freigeschaltet, wenn der
 * Zahlungsstatus bestätigt ist; danach geht automatisch eine Rechnung per E-Mail raus.
 */
export function CheckoutDialog({ tier, onOpenChange, onPurchased }: CheckoutDialogProps) {
  const { t } = useI18n();
  const { startPurchase, confirmPurchase, failPurchase } = useEntitlements();
  const { isAuthenticated } = useAuth();
  const [phase, setPhase] = useState<Phase>("idle");
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (tier === null) {
      setPhase("idle");
      setEmailSent(false);
    }
  }, [tier]);

  const info = tier ? PACKAGES[tier] : null;
  const name = tier === "premium" ? t("pricing.premium.name") : t("pricing.standard.name");
  const busy = phase === "processing" || phase === "confirming";

  const pay = async () => {
    if (!tier || !info) return;
    // A purchase without an account cannot be tied to anyone — require sign-in first.
    if (!isAuthenticated) {
      toast.info(t("auth.loginRequired"));
      return;
    }
    setPhase("processing");
    let purchase;
    try {
      purchase = await startPurchase(tier);
    } catch (error) {
      console.warn("[checkout] could not start purchase", error);
      setPhase("failed");
      toast.error(t("pay.status.failed"));
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 900));


    setPhase("confirming");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      let sent = false;
      try {
        const result = (await sendPurchaseReceipt({
          data: {
            orderId: purchase.id,
            tier,
            packageName: name,
            price: info.price,
            days: info.days,
            validUntil: new Date(purchase.expiresAt).toLocaleDateString(),
            date: new Date(purchase.purchasedAt).toLocaleDateString(),
          },
        })) as { sent?: boolean };
        sent = Boolean(result?.sent);
      } catch (error) {
        console.warn("[email] receipt failed", error);
      }

      await confirmPurchase(purchase, sent);
      setEmailSent(sent);
      setPhase("active");
      onPurchased?.();
      toast.success(t("checkout.success"), { description: `${name} · ${info.days} ${t("pkg.days")}` });
    } catch (error) {
      console.warn("[checkout] failed", error);
      await failPurchase(purchase);
      setPhase("failed");
      toast.error(t("pay.status.failed"));
    }

  };

  return (
    <Dialog open={tier !== null} onOpenChange={(open) => !busy && onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("checkout.title")}</DialogTitle>
          <DialogDescription>{t("checkout.desc")}</DialogDescription>
        </DialogHeader>

        {info && (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{name}</span>
              <span className="text-muted-foreground">
                {info.days} {t("pkg.days")}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">{t("checkout.total")}</span>
              <span className="text-xl font-semibold">{info.price}</span>
            </div>
          </div>
        )}

        {phase !== "idle" && (
          <div className="space-y-2 rounded-lg border p-4 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("pay.status.label")}
            </p>
            <div className="flex items-center gap-2">
              {phase === "active" ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : phase === "failed" ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : phase === "confirming" ? (
                <Clock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <span className="font-medium">
                {phase === "active"
                  ? t("pay.status.active")
                  : phase === "failed"
                    ? t("pay.status.failed")
                    : phase === "confirming"
                      ? t("pay.confirming")
                      : t("checkout.processing")}
              </span>
            </div>
            {phase === "active" && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {emailSent ? t("invoice.emailSent") : t("invoice.emailPending")}
              </p>
            )}
          </div>
        )}

        {phase === "idle" && (
          <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">{t("checkout.testNote")}</p>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {phase === "active" ? (
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              {t("pay.continue")}
            </Button>
          ) : (
            <Button className="w-full" onClick={() => void pay()} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              {busy ? t("checkout.processing") : phase === "failed" ? t("pay.retry") : t("checkout.pay")}
            </Button>
          )}
          <p className="text-center text-xs text-muted-foreground">{t("checkout.methods")}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
