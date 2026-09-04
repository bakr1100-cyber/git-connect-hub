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
    const element = document.getElementById("resume-preview-container");
    if (!element) return;

    setIsExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(element, {
        // 3x keeps the applicant photo and small print sharp at A4 print size (~300 dpi).
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDocument) => {
          const clonedPage = clonedDocument.getElementById("resume-preview-container");
          if (!clonedPage) return;
          clonedPage.style.transform = "none";
          clonedPage.style.boxShadow = "none";
        },
      });
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.98);

      // The preview is an exact A4 canvas. Fit it to the page instead of
      // cropping content when browser pixel rounding differs slightly.
      pdf.addImage(dataUrl, "JPEG", 0, 0, pageWidth, pageHeight);
      pdf.save(`${data.personalDetails.fullName || "Lebenslauf"}.pdf`);
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
