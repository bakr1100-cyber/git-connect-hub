import { useEffect, useRef, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { rememberAuthReturnPath } from "@/lib/auth-return";
import { clearPendingAction, readPendingAction, rememberPendingAction } from "@/lib/pending-action";
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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isBusy, setIsBusy] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  // Ref guard: state updates lag behind rapid clicks, so this blocks spam.
  const busyRef = useRef(false);
  const handleClickRef = useRef<() => void>(() => {});

  const handleClick = async () => {
    if (busyRef.current) return;
    // Sending requires an account, same as the PDF download.
    if (!isAuthenticated) {
      // Remember the intent + current step so login can resume right here.
      rememberPendingAction("email");
      rememberAuthReturnPath();
      toast.info(t("auth.loginRequired"));
      setShowAuth(true);
      return;
    }
    busyRef.current = true;
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
      busyRef.current = false;
      setIsBusy(false);
    }
  };
  handleClickRef.current = () => void handleClick();

  // After login (redirect or OAuth) resume the email flow automatically.
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (readPendingAction() !== "email") return;
    clearPendingAction();
    handleClickRef.current();
  }, [authLoading, isAuthenticated]);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => void handleClick()} disabled={isBusy}>
        {isBusy ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-1.5 h-4 w-4" />
        )}
        {t("editor.sendEmail")}
      </Button>

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-3xl">
          <AuthPanel redirectPath="/editor" onAuthenticated={() => setShowAuth(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
