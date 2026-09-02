import { motion } from "motion/react";
import { Lightbulb } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

export type WizardStepId = "personal" | "experience" | "education" | "skills" | "finish";

const examples: Record<WizardStepId, TranslationKey[]> = {
  personal: ["example.personal.1", "example.personal.2", "example.personal.3"],
  experience: ["example.experience.1", "example.experience.2", "example.experience.3"],
  education: ["example.education.1", "example.education.2", "example.education.3"],
  skills: ["example.skills.1", "example.skills.2", "example.skills.3"],
  finish: ["example.finish.1", "example.finish.2", "example.finish.3"],
};

export function StepExamples({ step }: { step: WizardStepId }) {
  const { t } = useI18n();

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {examples[step].map((key, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.06 }}
          className="rounded-lg border border-border bg-accent/40 p-3"
        >
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">
            <Lightbulb className="h-3 w-3" />
            {t("example.label")}
          </div>
          <p className="text-xs leading-relaxed text-foreground/80">{t(key)}</p>
        </motion.div>
      ))}
    </div>
  );
}
