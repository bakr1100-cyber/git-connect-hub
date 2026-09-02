import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { buildShareUrl } from "@/lib/resume-share";
import { useI18n } from "@/lib/i18n";
import type { ResumeData } from "@/lib/resume-types";

interface Props {
  data: ResumeData;
  className?: string;
}

export function ShareLinkButton({ data, className }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = open ? buildShareUrl(data) : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("share.copied"));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("share.copyFailed"));
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: t("share.title"), url });
        return;
      } catch {
        /* user cancelled — fall back to copy */
      }
    }
    await copy();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 className="mr-2 h-4 w-4" />
          {t("share.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("share.title")}</DialogTitle>
          <DialogDescription>{t("share.description")}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="text-xs" />
          <Button type="button" onClick={copy} aria-label={t("share.copy")}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={nativeShare}>
            <Share2 className="mr-2 h-4 w-4" />
            {t("share.send")}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <a href={url} target="_blank" rel="noreferrer noopener">
              {t("share.openPreview")}
            </a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t("share.privacy")}</p>
      </DialogContent>
    </Dialog>
  );
}
