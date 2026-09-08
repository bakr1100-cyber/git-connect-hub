import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Check } from "lucide-react";
import { PACKAGES, type Tier } from "@/lib/entitlements";
import type { TranslationKey } from "@/lib/i18n/de";

import { CheckoutDialog } from "@/components/pricing/CheckoutDialog";
import { useI18n } from "@/lib/i18n";

interface PremiumUpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "cover-letter" | "voice" | "photo" | "download";
}


export function PremiumUpsellDialog({ open, onOpenChange, feature }: PremiumUpsellDialogProps) {
  const { t } = useI18n();
  const [checkoutTier, setCheckoutTier] = useState<Tier | null>(null);
  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{feature === "voice"
              ? t("premium.voiceTitle")
              : feature === "photo"
                ? t("premium.photoTitle")
                : feature === "download"
                  ? t("premium.downloadTitle")
                  : t("premium.coverTitle")}</DialogTitle>
          <DialogDescription>{t("premium.desc")}</DialogDescription>
        </DialogHeader>


        <ul className="space-y-2 text-sm text-muted-foreground">
          {[t("premium.f1"), t("premium.f2"), t("premium.f3"), t("premium.f4")].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {(["standard", "premium", "unlimited6", "unlimited12"] as Tier[]).map((tier, index) => (
            <Button
              key={tier}
              className="w-full"
              variant={index === 0 ? "default" : "outline"}
              onClick={() => {
                onOpenChange(false);
                setCheckoutTier(tier);
              }}
            >
              {`${t(PACKAGES[tier].nameKey as TranslationKey)} · ${PACKAGES[tier].price}`}
            </Button>
          ))}
          <p className="text-center text-xs font-medium text-primary">{t("pricing.oneTime")}</p>
          <p className="text-center text-xs text-muted-foreground">
            {t("premium.methods")}
          </p>
        </DialogFooter>

      </DialogContent>
    </Dialog>

    <CheckoutDialog tier={checkoutTier} onOpenChange={(open) => !open && setCheckoutTier(null)} />
    </>
  );
}
