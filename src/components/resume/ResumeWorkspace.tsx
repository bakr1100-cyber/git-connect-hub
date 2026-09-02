import { useMemo, useState } from "react";
import { ResumePreview } from "./ResumePreview";
import { AtsCheckerPanel } from "./AtsCheckerPanel";
import { CustomizePanel } from "./CustomizePanel";
import { ExtraSectionsDialog } from "./ExtraSectionsDialog";
import { PDFExportButton } from "./PDFExportButton";
import { ShareLinkButton } from "./ShareLinkButton";
import { AiUsageBadge } from "./AiUsageBadge";
import { AiCostSummary } from "./AiCostSummary";

import { Button } from "@/components/ui/button";
import { calculateResumeScore } from "@/lib/resume-score";
import type { ResumeData } from "@/lib/resume-types";
import { useI18n } from "@/lib/i18n";
import { Minus, Plus, Maximize2, User, Briefcase, GraduationCap, ListChecks, Globe, Target } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
  /** Jump back into the wizard at a given step index. */
  onEditStep: (stepIndex: number) => void;
}

type TabId = "resume" | "customize" | "ats";

const pct = (parts: boolean[]) =>
  parts.length === 0 ? 0 : Math.round((parts.filter(Boolean).length / parts.length) * 100);

export function ResumeWorkspace({ data, onChange, onEditStep }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("resume");
  const [zoom, setZoom] = useState(100);
  const { score } = useMemo(() => calculateResumeScore(data), [data]);

  const p = data.personalDetails;
  const sections = [
    {
      id: "personal",
      icon: User,
      label: t("tab.personal"),
      step: 0,
      value: pct([!!p.fullName, !!p.email, !!p.phone, !!p.location]),
    },
    {
      id: "education",
      icon: GraduationCap,
      label: t("tab.education"),
      step: 1,
      value: pct([data.education.length > 0, data.education.some((e) => !!e.institution)]),
    },
    {
      id: "experience",
      icon: Briefcase,
      label: t("tab.experience"),
      step: 2,
      value: pct([data.workExperience.length > 0, data.workExperience.some((e) => !!e.description)]),
    },
    { id: "skills", icon: ListChecks, label: t("tab.skills"), step: 3, value: pct([data.skills.length > 0, data.skills.length >= 5]) },
    { id: "languages", icon: Globe, label: t("form.languages"), step: 3, value: pct([data.languages.length > 0]) },
    { id: "summary", icon: Target, label: t("form.summary"), step: 4, value: pct([!!p.summary, (p.summary || "").length > 120]) },
  ];

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[380px_1fr]">
      {/* Sidebar */}
      <aside className="border-r border-border bg-background">
        <div className="border-b border-border bg-muted/40 p-5 text-center">
          <h1 className="text-lg font-bold text-foreground">{t("ws.title")}</h1>
          <div className="mt-3">
            <PDFExportButton data={data} label={t("ws.download")} />
            <ShareLinkButton data={data} className="mt-2 w-full" />
            <AiUsageBadge className="mt-3" />
            <AiCostSummary className="mt-3" />

          </div>
        </div>

        <div className="flex border-b border-border">
          {(
            [
              ["resume", t("ws.tabResume")],
              ["customize", t("ws.tabCustomize")],
              ["ats", t("ws.tabAts")],
            ] as [TabId, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 border-b-2 px-2 py-3 text-sm font-medium transition-colors ${
                tab === id
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "resume" && (
          <div className="space-y-5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("ws.start")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("ws.startDesc")}</p>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cta text-sm font-bold text-cta-foreground"
              >
                {score}%
              </motion.div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${score}%` }} />
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">{t("ws.sections")}</p>
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onEditStep(section.step)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-3 text-left transition-colors hover:border-brand hover:bg-accent"
                  >
                    <span className="flex items-center gap-3 text-sm text-foreground">
                      <section.icon className="h-4 w-4 text-muted-foreground" />
                      {section.label}
                    </span>
                    <span className="rounded-full bg-cta/20 px-2 py-0.5 text-xs font-semibold text-foreground">
                      {section.value}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <ExtraSectionsDialog data={data} onChange={onChange} />
          </div>
        )}

        {tab === "customize" && (
          <div className="p-5">
            <CustomizePanel data={data} onChange={onChange} />
          </div>
        )}

        {tab === "ats" && (
          <div className="p-5">
            <AtsCheckerPanel data={data} onEditStep={onEditStep} />
          </div>
        )}
      </aside>

      {/* Canvas */}
      <section className="relative bg-muted/40 p-4 lg:p-10">
        <div className="mx-auto w-full max-w-[210mm] origin-top" style={{ transform: `scale(${zoom / 100})` }}>
          <ResumePreview data={data} />
        </div>

        <div className="sticky bottom-4 mt-6 flex justify-end">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(50, z - 10))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-xs tabular-nums">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(150, z + 10))}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoom(100)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
