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
import { Check, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { PACKAGES, type Tier } from "@/lib/entitlements";
import { useAuth } from "@/hooks/useAuth";
import { StripeEmbeddedCheckout } from "@/components/pricing/StripeEmbeddedCheckout";
import type { TranslationKey } from "@/lib/i18n/de";

interface CheckoutDialogProps {
  tier: Tier | null;
  onOpenChange: (open: boolean) => void;
  onPurchased?: () => void;
}

/**
 * Shows the order summary first, then the real payment form. Nothing is unlocked
 * until the provider confirms the payment on the way back.
 */
export function CheckoutDialog({ tier, onOpenChange, onPurchased }: CheckoutDialogProps) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (tier === null) setPaying(false);
  }, [tier]);

  const info = tier ? PACKAGES[tier] : null;
  const name = info ? t(info.nameKey as TranslationKey) : "";
  const desc = info ? t(info.descKey as TranslationKey) : "";

  const start = () => {
    if (!isAuthenticated) {
      toast.info(t("auth.loginRequired"));
      return;
    }
    onPurchased?.();
    setPaying(true);
  };

  const returnUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}${window.location.pathname}`;

  return (
    <Dialog open={tier !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("checkout.title")}</DialogTitle>
          <DialogDescription>{t("checkout.desc")}</DialogDescription>
        </DialogHeader>

        {info && !paying && (
          <>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground">
                  {info.days} {t("pkg.days")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">{t("checkout.total")}</span>
                <span className="text-xl font-semibold">{info.price}</span>
              </div>
            </div>

            <p className="flex items-center gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              {t("pricing.oneTime")}
            </p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
              {t("checkout.testNote")}
            </p>
          </>
        )}

        {info && paying && tier && (
          <StripeEmbeddedCheckout
            tier={tier}
            returnUrl={returnUrl}
            onError={(message) => {
              setPaying(false);
              toast.error(message);
            }}
          />
        )}

        {!paying && (
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button className="w-full" onClick={start}>
              <Lock className="mr-2 h-4 w-4" />
              {`${t("checkout.pay")} · ${info?.price ?? ""}`}
            </Button>
            <p className="text-center text-xs text-muted-foreground">{t("checkout.methods")}</p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
