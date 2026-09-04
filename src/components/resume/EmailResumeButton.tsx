import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import type { ResumeData } from "@/lib/resume-types";
import {
  generateResumePdfBlob,
  resumeFileName,
  triggerBlobDownload,
} from "@/lib/resume-pdf-export";

interface EmailResumeButtonProps {
  data: ResumeData;
}

/** Creates the PDF, saves it locally and opens the mail client prefilled. */
export function EmailResumeButton({ data }: EmailResumeButtonProps) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [isBusy, setIsBusy] = useState(false);

  const handleClick = async () => {
    // Sending requires an account, same as the PDF download.
    if (!isAuthenticated) {
      toast.info(t("auth.loginRequired"));
      return;
    }
    setIsBusy(true);
    try {
      const blob = await generateResumePdfBlob();
      if (!blob) return;
      triggerBlobDownload(blob, resumeFileName(data));

      const name = data.personalDetails.fullName || "";
      const subject = t("editor.emailSubject").replace("{name}", name).trim();
      const body = t("editor.emailBody").replace("{name}", name);

      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast.success(t("editor.emailToastTitle"), {
        description: t("editor.emailToastDesc"),
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={() => void handleClick()} disabled={isBusy}>
      {isBusy ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-1.5 h-4 w-4" />
      )}
      {t("editor.sendEmail")}
    </Button>
  );
}
