import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ResumeData } from "@/lib/resume-types";
import { downloadApplicationPackagePdf } from "@/lib/package-export";
import { useEntitlements } from "@/lib/entitlements";
import { PremiumUpsellDialog } from "@/components/resume/PremiumUpsellDialog";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

interface PackageDownloadButtonProps {
  data: ResumeData;
}

/** Downloads resume + cover letter as one ready-to-send PDF package. */
export function PackageDownloadButton({ data }: PackageDownloadButtonProps) {
  const { t } = useI18n();
  const { standard, purchase } = useEntitlements();
  const { isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const runningRef = useRef(false);

  const handleClick = async () => {
    if (runningRef.current) return;
    if (!isAuthenticated) {
      toast.info(t("auth.loginRequired"));
      return;
    }
    if (purchase?.status === "pending") {
      toast.info(t("pay.pendingHint"));
      return;
    }
    // Same paywall as the single PDF: the package must not be a free side door.
    if (!standard) {
      setShowUpsell(true);
      return;
    }
    runningRef.current = true;
    setBusy(true);
    try {
      const result = await downloadApplicationPackagePdf(data);
      if (!result.resume && !result.coverLetter) {
        toast.error(t("pkg.download.empty"));
      } else if (result.coverLetter) {
        toast.success(t("pkg.download.both"));
      } else {
        toast.success(t("pkg.download.resumeOnly"));
      }
    } catch {
      toast.error(t("pkg.download.failed"));
    } finally {
      runningRef.current = false;
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleClick} disabled={busy}>
        {busy ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-4 w-4" />
        )}
        {t("pkg.download.cta")}
      </Button>
      <PremiumUpsellDialog open={showUpsell} onOpenChange={setShowUpsell} feature="download" />
    </>
  );
}
