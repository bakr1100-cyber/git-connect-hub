import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { STANDARD_PRICE, useEntitlements } from "@/lib/entitlements";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ResumeData } from "@/lib/resume-types";
import { useAuth } from "@/hooks/useAuth";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { AiCostSummary } from "./AiCostSummary";


interface PDFExportButtonProps {
  data: ResumeData;
  label?: string;
}

export const RESUME_PRICE = STANDARD_PRICE;

export function PDFExportButton({ data, label }: PDFExportButtonProps) {
  const { t } = useI18n();
  const [isExporting, setIsExporting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const { standard: isUnlocked, unlock } = useEntitlements();
  const { isAuthenticated } = useAuth();
  void unlock;



  const exportPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("resume-preview-container");
    if (!element) return;

    setIsExporting(true);
    try {
      const opt = {
        margin: 0,
        filename: `${data.personalDetails.fullName || "Lebenslauf"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      };
      await html2pdf().set(opt).from(element).save();
    } finally {
      setIsExporting(false);
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    if (isUnlocked) {
      setShowCost(true);
      return;
    }
    setShowPaywall(true);
  };

  return (
    <>
      <Button size="sm" onClick={handleClick} disabled={isExporting}>
        {isExporting ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-4 w-4" />
        )}
        {label ?? t("editor.download")}
      </Button>

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-3xl">
          <AuthPanel
            redirectPath="/editor"
            onAuthenticated={() => {
              setShowAuth(false);
              setShowPaywall(!isUnlocked);
            }}
          />
        </DialogContent>
      </Dialog>




      <Dialog open={showCost} onOpenChange={setShowCost}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("aiCost.confirmTitle")}</DialogTitle>
            <DialogDescription>{t("aiCost.confirmDesc")}</DialogDescription>
          </DialogHeader>

          <AiCostSummary />

          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                setShowCost(false);
                void exportPdf();
              }}
            >
              {t("aiCost.confirmCta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("paywall.title")}</DialogTitle>
            <DialogDescription>{t("paywall.desc")}</DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 text-sm text-muted-foreground">
            {[t("paywall.f1"), t("paywall.f2"), t("paywall.f3"), t("paywall.f4")].map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              onClick={() => {
                toast.info(t("paywall.soonTitle"), {
                  description: t("paywall.soonDesc"),
                });
              }}
            >
              {t("paywall.unlock")}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {t("paywall.methods")}
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
