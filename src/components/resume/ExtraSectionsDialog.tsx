import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, LayoutList } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { extraSectionPresets, type ResumeData } from "@/lib/resume-types";

interface ExtraSectionsDialogProps {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

export function ExtraSectionsDialog({ data, onChange }: ExtraSectionsDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const sections = data.extraSections ?? [];

  const addSection = (title: string) => {
    onChange((prev) => ({
      ...prev,
      extraSections: [
        ...(prev.extraSections ?? []),
        { id: crypto.randomUUID(), title, content: "" },
      ],
    }));
  };

  const updateSection = (id: string, patch: Partial<{ title: string; content: string }>) => {
    onChange((prev) => ({
      ...prev,
      extraSections: (prev.extraSections ?? []).map((section) =>
        section.id === id ? { ...section, ...patch } : section
      ),
    }));
  };

  const removeSection = (id: string) => {
    onChange((prev) => ({
      ...prev,
      extraSections: (prev.extraSections ?? []).filter((section) => section.id !== id),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutList className="mr-1.5 h-4 w-4" />
          {t("extra.title")}
          {sections.length > 0 ? ` (${sections.length})` : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("extra.title")}</DialogTitle>
          <DialogDescription>{t("extra.desc")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {extraSectionPresets.map((preset) => (
            <Button
              key={preset}
              variant="secondary"
              size="sm"
              onClick={() => addSection(t(`extra.preset.${preset}` as never))}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t(`extra.preset.${preset}` as never)}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {sections.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("extra.empty")}</p>
          )}
          {sections.map((section) => (
            <div key={section.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor={`extra-title-${section.id}`}>{t("extra.sectionTitle")}</Label>
                  <Input
                    id={`extra-title-${section.id}`}
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(section.id)}
                  aria-label={t("extra.remove")}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`extra-content-${section.id}`}>{t("extra.content")}</Label>
                <Textarea
                  id={`extra-content-${section.id}`}
                  rows={4}
                  value={section.content}
                  onChange={(e) => updateSection(section.id, { content: e.target.value })}
                  placeholder={t("extra.contentPlaceholder")}
                />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
