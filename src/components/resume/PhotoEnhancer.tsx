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
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useEntitlements } from "@/lib/entitlements";
import { PremiumUpsellDialog } from "./PremiumUpsellDialog";
import { PhotoCropper } from "./PhotoCropper";


interface PhotoEnhancerProps {
  /** Current photo as data URL. */
  photo?: string | undefined;
  onApply: (dataUrl: string) => void;
}

export function PhotoEnhancer({ photo, onApply }: PhotoEnhancerProps) {
  const { t } = useI18n();
  const { standard } = useEntitlements();
  const [showUpsell, setShowUpsell] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async (source: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/enhance-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: source }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { image?: string };
      if (!data.image) throw new Error("empty");
      setResult(data.image);
    } catch {
      toast.error(t("photo.failed"));
    } finally {
      setBusy(false);
    }
  };

  const start = () => {
    if (!photo) {
      toast.info(t("photo.needUpload"));
      return;
    }
    if (!standard) {
      setShowUpsell(true);
      return;
    }
    void run(photo);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={start}
        disabled={busy}
        title={t("photo.enhance")}
        className="gap-1.5"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4 text-primary" />
        )}
        <span className="text-xs">{t("photo.enhance")}</span>
      </Button>

      <Dialog
        open={result !== null}
        onOpenChange={(open) => {
          if (!open) {
            setResult(null);
            setCropped(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("photo.resultTitle")}</DialogTitle>
            <DialogDescription>{t("photo.crop.desc")}</DialogDescription>
          </DialogHeader>
          {result && <PhotoCropper src={result} onCropped={setCropped} />}
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => photo && void run(photo)}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("photo.retry")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                const final = cropped ?? result;
                if (final) onApply(final);
                setResult(null);
                setCropped(null);
                toast.success(t("photo.applied"));
              }}
            >
              {t("photo.ok")}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      <PremiumUpsellDialog open={showUpsell} onOpenChange={setShowUpsell} feature="photo" />
    </>
  );
}
