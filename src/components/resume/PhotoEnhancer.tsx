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
import { autoCorrect, sharpen } from "@/lib/photo-processing";



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
  const [cropped, setCropped] = useState<string | null>(null);


  const [fallback, setFallback] = useState(false);

  const run = async (source: string) => {
    setBusy(true);
    let prepared = source;
    let analysis = { dark: false, blurry: false };
    try {
      // Fix exposure locally first so very dark photos give the model usable input,
      // and tell the server what is wrong with the original.
      const corrected = await autoCorrect(source);
      prepared = corrected.image;
      analysis = { dark: corrected.analysis.dark, blurry: corrected.analysis.blurry };
      const res = await fetch("/api/enhance-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: prepared,
          hints: { dark: analysis.dark, blurry: analysis.blurry },
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { image?: string };
      if (!data.image) throw new Error("empty");
      // Final crispness pass — stronger when the original was soft.
      setFallback(false);
      setResult(await sharpen(data.image, analysis.blurry ? 0.75 : 0.45));
    } catch (error) {
      const status = Number((error as Error)?.message);
      const key =
        status === 429 ? "photo.failedBusy" : status === 402 || status === 403 ? "photo.failedQuota" : "photo.failed";
      // Clean fallback: never leave the user empty-handed — offer the locally
      // brightened and sharpened version instead.
      try {
        const local = await sharpen(prepared, analysis.blurry ? 0.8 : 0.5);
        setFallback(true);
        setResult(local);
        toast.warning(t("photo.fallbackUsed"));
      } catch {
        toast.error(t(key));
      }
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
            setFallback(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("photo.resultTitle")}</DialogTitle>
            <DialogDescription>
              {fallback ? t("photo.fallbackNote") : t("photo.crop.desc")}
            </DialogDescription>
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
                setFallback(false);
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
