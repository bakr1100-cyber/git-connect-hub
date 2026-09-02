import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Square } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { transcribeAudio } from "@/lib/resume-ai.functions";
import { toast } from "sonner";
import { aiErrorKey } from "@/lib/ai-errors";
import { hasAiSession } from "@/lib/ai-auth";
import { trackAiAction } from "@/lib/ai-cost";
import { cn } from "@/lib/utils";
import { useEntitlements } from "@/lib/entitlements";
import { PremiumUpsellDialog } from "./PremiumUpsellDialog";
import { useI18n } from "@/lib/i18n";


interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInputButton({ onTranscript, className }: VoiceInputButtonProps) {
  const { t } = useI18n();
  const transcribe = useServerFn(transcribeAudio);
  const { premium } = useEntitlements();
  const [showUpsell, setShowUpsell] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);


  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const start = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error(t("voice.unsupported"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size === 0) return;
        setLoading(true);
        try {
          const buffer = await blob.arrayBuffer();
          let binary = "";
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
          const base64 = btoa(binary);
          if (!(await hasAiSession())) throw new Error("AI_AUTH_REQUIRED");
          const result = await transcribe({
            data: { audioBase64: base64, mimeType: blob.type || "audio/webm" },
          });
          trackAiAction("transcribe");
          if (result.text?.trim()) {
            onTranscript(result.text.trim());
            toast.success(t("voice.inserted"));
          } else {
            toast.error(t("voice.noSpeech"));
          }
        } catch (error) {
          toast.error(t(aiErrorKey(error, "voice.failed")));
        } finally {
          setLoading(false);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error(t("voice.denied"));
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className={cn("h-8 w-8", className)}
        disabled={loading}
        title={
          !premium
            ? t("voice.premium")
            : recording
              ? t("voice.stop")
              : t("voice.record")
        }
        onClick={() => {
          if (!premium) {
            setShowUpsell(true);
            return;
          }
          if (recording) stop();
          else void start();
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : recording ? (
          <Square className="h-4 w-4 text-destructive" />
        ) : (
          <Mic className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      <PremiumUpsellDialog open={showUpsell} onOpenChange={setShowUpsell} feature="voice" />
    </>
  );
}

