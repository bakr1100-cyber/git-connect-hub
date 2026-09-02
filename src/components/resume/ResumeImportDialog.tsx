import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { aiErrorKey } from "@/lib/ai-errors";
import { hasAiSession } from "@/lib/ai-auth";
import { trackAiAction } from "@/lib/ai-cost";
import { useServerFn } from "@tanstack/react-start";
import { parseResumeText } from "@/lib/resume-ai.functions";
import { useI18n } from "@/lib/i18n";
import type { ResumeData } from "@/lib/resume-types";
import { defaultResumeData } from "@/lib/resume-types";

interface ParsedShape {
  personalDetails?: Partial<ResumeData["personalDetails"]>;
  workExperience?: Array<Record<string, string>>;
  education?: Array<Record<string, string>>;
  skills?: Array<Record<string, string>>;
  languages?: Array<Record<string, string>>;
}

const id = () => Math.random().toString(36).slice(2, 10);

function toResumeData(parsed: ParsedShape, prev: ResumeData): ResumeData {
  return {
    ...prev,
    personalDetails: {
      ...defaultResumeData.personalDetails,
      ...prev.personalDetails,
      ...(parsed.personalDetails ?? {}),
    },
    workExperience: (parsed.workExperience ?? []).map((w) => ({
      id: id(),
      position: w["position"] ?? "",
      company: w["company"] ?? "",
      location: w["location"] ?? "",
      startDate: w["startDate"] ?? "",
      endDate: w["endDate"] ?? "",
      description: w["description"] ?? "",
    })),
    education: (parsed.education ?? []).map((e) => ({
      id: id(),
      degree: e["degree"] ?? "",
      institution: e["institution"] ?? "",
      location: e["location"] ?? "",
      startDate: e["startDate"] ?? "",
      endDate: e["endDate"] ?? "",
      description: e["description"] ?? "",
    })),
    skills: (parsed.skills ?? []).map((s) => ({ id: id(), name: s["name"] ?? "", level: s["level"] ?? "" })),
    languages: (parsed.languages ?? []).map((l) => ({
      id: id(),
      name: l["name"] ?? "",
      level: l["level"] || "fluent",
    })),
  };
}

export function ResumeImportDialog({
  data,
  onImport,
  triggerVariant = "outline",
}: {
  data: ResumeData;
  onImport: (next: ResumeData) => void;
  triggerVariant?: "outline" | "secondary" | "default";
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const parse = useServerFn(parseResumeText);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const content = await file.text();
    setText(content.slice(0, 20000));
  };

  const handleImport = async () => {
    if (text.trim().length < 20) {
      toast.error(t("import.empty"));
      return;
    }
    setBusy(true);
    try {
      if (!(await hasAiSession())) throw new Error("AI_AUTH_REQUIRED");
      const result = await parse({ data: { text: text.trim(), language: data.settings.language } });
      trackAiAction("parseResume");
      const parsed = JSON.parse(result.json) as ParsedShape;
      onImport(toResumeData(parsed, data));
      toast.success(t("import.success"));
      setOpen(false);
      setText("");
    } catch (error) {
      toast.error(t(aiErrorKey(error, "import.error")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          <Upload className="mr-1.5 h-4 w-4" />
          {t("import.cta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("import.title")}</DialogTitle>
          <DialogDescription>{t("import.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,text/plain"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              {t("import.file")}
            </Button>
          </div>
          <div>
            <Label htmlFor="import-text">{t("import.pasteLabel")}</Label>
            <Textarea
              id="import-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("import.pastePlaceholder")}
              rows={10}
              className="mt-1.5"
            />
          </div>
          <Button className="w-full" onClick={() => void handleImport()} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {t("import.parsing")}
              </>
            ) : (
              t("import.button")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
