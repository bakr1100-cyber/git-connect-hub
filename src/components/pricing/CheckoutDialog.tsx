import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { PACKAGES, useEntitlements, type Tier } from "@/lib/entitlements";

interface CheckoutDialogProps {
  tier: Tier | null;
  onOpenChange: (open: boolean) => void;
  onPurchased?: () => void;
}

/**
 * Purchase flow for one package. The card capture itself is handled by the
 * payment provider once it is connected; until then the flow runs in test mode
 * and grants the same time-limited access a real payment would.
 */
export function CheckoutDialog({ tier, onOpenChange, onPurchased }: CheckoutDialogProps) {
  const { t } = useI18n();
  const { unlock } = useEntitlements();
  const [busy, setBusy] = useState(false);

  const info = tier ? PACKAGES[tier] : null;
  const name = tier === "premium" ? t("pricing.premium.name") : t("pricing.standard.name");

  const pay = async () => {
    if (!tier || !info) return;
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    unlock(tier);
    setBusy(false);
    onOpenChange(false);
    onPurchased?.();
    toast.success(t("checkout.success"), { description: `${name} · ${info.days} ${t("pkg.days")}` });
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

        <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">{t("checkout.testNote")}</p>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={() => void pay()} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            {busy ? t("checkout.processing") : t("checkout.pay")}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t("checkout.methods")}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
