import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { PREMIUM_PRICE, STANDARD_PRICE } from "@/lib/entitlements";
import { useI18n } from "@/lib/i18n";

interface PremiumUpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "cover-letter" | "voice";
}


export function PremiumUpsellDialog({ open, onOpenChange, feature }: PremiumUpsellDialogProps) {
  const { t } = useI18n();
  void STANDARD_PRICE;
  void PREMIUM_PRICE;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{feature === "voice" ? t("premium.voiceTitle") : t("premium.coverTitle")}</DialogTitle>
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
          <Button
            className="w-full"
            onClick={() =>
              toast.info(t("paywall.soonTitle"), {
                description: t("paywall.soonDesc"),
              })
            }
          >
            {t("premium.unlock")}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {t("premium.methods")}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
