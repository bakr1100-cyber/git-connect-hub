import { useState, useEffect, useCallback, useMemo } from "react";
import { ResumeForm } from "./ResumeForm";
import { ResumePreview } from "./ResumePreview";
import { PDFExportButton } from "./PDFExportButton";

import { ResumeScoreCard } from "./ResumeScoreCard";
import { ResumeImportDialog } from "./ResumeImportDialog";
import { ExtraSectionsDialog } from "./ExtraSectionsDialog";
import { TemplateGallery } from "./TemplateGallery";
import { StepExamples, type WizardStepId } from "./StepExamples";
import { ResumeWorkspace } from "./ResumeWorkspace";

import { defaultResumeData, type ResumeData } from "@/lib/resume-types";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { FileText, ArrowLeft, ArrowRight, Check, Cloud, CloudOff, Loader2, Globe2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SUPPORTED_LOCALES, localeFlags, localeNames, type Locale } from "@/lib/i18n/locales";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "motion/react";
import { useResumeAutoSave } from "@/hooks/useResumeAutoSave";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { rememberAuthReturnPath, WIZARD_STEP_KEY } from "@/lib/auth-return";

const STORAGE_KEY = "resume-draft-v1";
const LANGUAGE_INTRO_KEY = "resume-language-intro-v3";
const INTERFACE_LANGUAGE_KEY = "interface-language-selected-v1";

/** The five wizard steps; the final step combines fine-tuning and the cover letter. */
const wizardSteps: { id: WizardStepId; forms: string[] }[] = [
  { id: "personal", forms: ["personal"] },
  { id: "education", forms: ["education"] },
  { id: "experience", forms: ["experience"] },
  { id: "skills", forms: ["skills"] },
  { id: "finish", forms: ["summary", "settings", "cover-letter"] },
];

const stepLabelKeys = {
  personal: "tab.personal",
  experience: "tab.experience",
  education: "tab.education",
  skills: "tab.skills",
  finish: "tab.finish",
} as const;

const stepHeadlineKeys = {
  personal: "wizard.personal.headline",
  experience: "wizard.experience.headline",
  education: "wizard.education.headline",
  skills: "wizard.skills.headline",
  finish: "wizard.settings.headline",
} as const;

export function ResumeEditor() {
  const { t, locale, setLocale, dir } = useI18n();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [languageIntroStage, setLanguageIntroStage] = useState<"interface" | "resume" | null>(null);
  const [selectedInterfaceLanguage, setSelectedInterfaceLanguage] = useState<Locale>(locale);
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>(locale);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<"wizard" | "workspace">("wizard");

  const totalSteps = wizardSteps.length;
  const currentStep = wizardSteps[Math.min(stepIndex, totalSteps - 1)]!;
  const progress = useMemo(() => ((stepIndex + 1) / totalSteps) * 100, [stepIndex, totalSteps]);
  const isLastStep = stepIndex === totalSteps - 1;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ResumeData;
        setData({ ...defaultResumeData, ...parsed });
      }
      const savedStep = Number(localStorage.getItem(WIZARD_STEP_KEY));
      if (Number.isInteger(savedStep) && savedStep >= 0 && savedStep < wizardSteps.length) {
        setStepIndex(savedStep);
      }
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(WIZARD_STEP_KEY, String(stepIndex));
  }, [isLoaded, stepIndex]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    if (localStorage.getItem(LANGUAGE_INTRO_KEY) === "done") return;
    const savedInterfaceLanguage = localStorage.getItem(INTERFACE_LANGUAGE_KEY) as Locale | null;
    if (savedInterfaceLanguage && SUPPORTED_LOCALES.includes(savedInterfaceLanguage)) {
      setSelectedInterfaceLanguage(savedInterfaceLanguage);
      setSelectedLanguage(data.settings.language || savedInterfaceLanguage);
      setLanguageIntroStage("resume");
      return;
    }
    setSelectedInterfaceLanguage(locale);
    setLanguageIntroStage("interface");
  }, [isLoaded]);

  const updateData = useCallback((updater: (prev: ResumeData) => ResumeData) => {
    setData((prev) => updater(prev));
  }, []);

  const handleRestore = useCallback(
    (restored: ResumeData) => {
      setData(restored);
      toast.success(t("autosave.restored"));
    },
    [t]
  );

  const { state: saveState } = useResumeAutoSave({ data, ready: isLoaded, onRestore: handleRestore });

  const goTo = useCallback((index: number) => {
    setStepIndex(Math.max(0, Math.min(wizardSteps.length - 1, index)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const confirmInterfaceLanguage = useCallback(() => {
    setLocale(selectedInterfaceLanguage);
    if (typeof window !== "undefined") localStorage.setItem(INTERFACE_LANGUAGE_KEY, selectedInterfaceLanguage);
    const hasExistingDraft = typeof window !== "undefined" && Boolean(localStorage.getItem(STORAGE_KEY));
    setSelectedLanguage(hasExistingDraft ? data.settings.language : selectedInterfaceLanguage);
    setLanguageIntroStage("resume");
  }, [data.settings.language, selectedInterfaceLanguage, setLocale]);

  const confirmResumeLanguage = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      settings: { ...prev.settings, language: selectedLanguage },
    }));
    if (typeof window !== "undefined") localStorage.setItem(LANGUAGE_INTRO_KEY, "done");
    setLanguageIntroStage(null);
  }, [selectedLanguage, updateData]);

  if (mode === "workspace") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
            <FileText className="h-5 w-5 text-brand" />
            <span className="hidden sm:inline">{t("brand.name")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={() => setMode("wizard")}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("ws.backToEditor")}
            </Button>
          </div>
        </header>
        <ResumeWorkspace
          data={data}
          onChange={updateData}
          onEditStep={(index) => {
            setMode("wizard");
            goTo(index);
          }}
        />
      </div>
    );
  }



  return (
    <div className="flex min-h-screen flex-col bg-background">
      {languageIntroStage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-navy/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-language-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/20 bg-background shadow-[0_32px_100px_rgba(0,0,0,0.45)]"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand via-trust to-cta" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand/15 blur-3xl" />

            <div className="relative p-6 sm:p-9">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-primary-foreground shadow-lg shadow-brand/25">
                  <Globe2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                    myCVonline.com · {languageIntroStage === "interface" ? t("languageIntro.step1") : t("languageIntro.step2")}
                  </p>
                  <h2 id="resume-language-title" className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {languageIntroStage === "interface" ? t("languageIntro.interfaceTitle") : t("languageIntro.resumeTitle")}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {languageIntroStage === "interface" ? t("languageIntro.interfaceDescription") : t("languageIntro.resumeDescription")}
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-brand/20 bg-brand/5 p-4">
                <div className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-primary-foreground">!</span>
                  <p>
                    <strong className="text-foreground">{t("languageIntro.important")}</strong>{" "}
                    {languageIntroStage === "interface" ? t("languageIntro.interfaceNote") : t("languageIntro.resumeNote")}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SUPPORTED_LOCALES.map((code) => {
                  const selected = languageIntroStage === "interface"
                    ? selectedInterfaceLanguage === code
                    : selectedLanguage === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        if (languageIntroStage === "interface") {
                          setSelectedInterfaceLanguage(code);
                          setLocale(code);
                        } else {
                          setSelectedLanguage(code);
                        }
                      }}
                      className={`relative flex min-h-16 items-center gap-2 rounded-xl border px-3 py-3 text-left transition-all ${
                        selected
                          ? "border-brand bg-brand text-primary-foreground shadow-md shadow-brand/20"
                          : "border-border bg-background text-foreground hover:border-brand/50 hover:bg-brand/5"
                      }`}
                    >
                      <span className="text-xl" aria-hidden="true">{localeFlags[code]}</span>
                      <span className="text-sm font-semibold">{localeNames[code]}</span>
                      {selected && <Check className="absolute right-2 top-2 h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>

              <Button
                size="lg"
                onClick={languageIntroStage === "interface" ? confirmInterfaceLanguage : confirmResumeLanguage}
                className="mt-7 w-full bg-cta font-bold uppercase tracking-wide text-cta-foreground shadow-lg shadow-cta/20 hover:bg-cta/90"
              >
                {languageIntroStage === "interface" ? t("languageIntro.interfaceContinue") : t("languageIntro.resumeContinue")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {languageIntroStage === "interface" ? t("languageIntro.interfaceLater") : t("languageIntro.resumeLater")}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Wizard Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
              <FileText className="h-5 w-5 text-brand" />
              <span className="hidden sm:inline">{t("brand.name")}</span>
            </Link>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t("wizard.step")} {stepIndex + 1} {t("wizard.of")} {totalSteps}
              </p>
              <p className="text-sm font-semibold text-foreground">{t(stepLabelKeys[currentStep.id])}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("autosave.saving")}
                </>
              ) : saveState === "saved" ? (
                <>
                  <Cloud className="h-3.5 w-3.5 text-brand" /> {t("autosave.saved")}
                </>
              ) : (
                <>
                  <CloudOff className="h-3.5 w-3.5" /> {t("autosave.local")}
                </>
              )}
            </span>
            <LanguageSwitcher />
            {!authLoading && isAuthenticated ? (
              <span className="inline-flex shrink-0 rounded-lg border border-brand/35 bg-brand/10 px-3 py-2 text-sm font-semibold text-brand">
                {t("auth.signedIn")}
              </span>
            ) : (
              <Link
                to="/auth"
                onClick={() => rememberAuthReturnPath()}
                className="inline-flex shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                {t("nav.signIn")}
              </Link>
            )}
            <ResumeImportDialog data={data} onImport={(next) => setData(next)} />
            <PDFExportButton data={data} />

          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-muted">
          <motion.div
            className="h-full bg-brand"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        {/* Large milestone rail for tablet widths; desktop uses the persistent sidebar below. */}
        <div className="mx-auto hidden max-w-7xl overflow-x-auto px-4 py-4 md:block xl:hidden">
          <div className="flex min-w-[760px] items-start">
            {wizardSteps.map((wizardStep, index) => {
              const isCurrent = index === stepIndex;
              const isComplete = index < stepIndex;

              return (
                <div key={wizardStep.id} className="relative flex-1">
                  {index < totalSteps - 1 && (
                    <span
                      aria-hidden="true"
                      className={`absolute top-5 h-1 rounded-full transition-all duration-500 ${
                        dir === "rtl"
                          ? "right-[calc(50%+24px)] left-[calc(-50%+24px)]"
                          : "left-[calc(50%+24px)] right-[calc(-50%+24px)]"
                      } ${
                        isComplete ? "bg-trust shadow-[0_0_12px_rgba(34,197,94,0.5)]" : "bg-border"
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    aria-current={isCurrent ? "step" : undefined}
                    onClick={() => goTo(index)}
                    className="group relative z-10 flex w-full flex-col items-center gap-2 px-2 text-center"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                        isCurrent
                          ? "border-brand bg-brand text-primary-foreground shadow-[0_0_0_6px_rgba(26,166,157,0.13),0_0_20px_rgba(26,166,157,0.4)]"
                          : isComplete
                            ? "border-trust bg-trust text-white shadow-[0_0_16px_rgba(34,197,94,0.42)]"
                            : "border-border bg-card text-muted-foreground group-hover:border-brand/60"
                      }`}
                    >
                      {isComplete ? <Check className="h-5 w-5" /> : index + 1}
                    </span>
                    <span className={`text-sm font-bold sm:text-base ${isCurrent || isComplete ? "text-foreground" : "text-muted-foreground"}`}>
                      {t(stepLabelKeys[wizardStep.id])}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Wizard Body */}
      <main className="flex-1">
        <div className="mx-auto grid max-w-[1500px] gap-0 xl:grid-cols-[270px_minmax(0,1fr)]">
          {/* Persistent desktop step navigation */}
          <aside className="relative hidden overflow-hidden border-r border-brand/30 bg-gradient-to-b from-brand-dark via-brand-dark to-brand text-primary-foreground xl:block">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cta/20 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10 sticky top-[69px] min-h-[calc(100vh-69px)] px-5 py-8">
              <div className="mb-7 px-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">
                  {t("wizard.step")} {stepIndex + 1} {t("wizard.of")} {totalSteps}
                </p>
                <p className="mt-2 text-lg font-bold">{t(stepLabelKeys[currentStep.id])}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-cta"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <nav aria-label={`${t("wizard.step")} ${stepIndex + 1} ${t("wizard.of")} ${totalSteps}`}>
                {wizardSteps.map((wizardStep, index) => {
                  const isCurrent = index === stepIndex;
                  const isComplete = index < stepIndex;

                  return (
                    <div key={wizardStep.id} className="relative pb-2 last:pb-0">
                      {index < totalSteps - 1 && (
                        <span
                          aria-hidden="true"
                          className={`absolute left-[27px] top-11 h-[30px] w-px ${
                            isComplete ? "bg-trust shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-white/20"
                          }`}
                        />
                      )}
                      <button
                        type="button"
                        aria-current={isCurrent ? "step" : undefined}
                        onClick={() => goTo(index)}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                          isCurrent
                            ? "bg-gradient-to-r from-white/15 to-white/8 text-white shadow-lg shadow-black/10 ring-1 ring-white/15"
                            : isComplete
                              ? "text-white hover:bg-white/8"
                              : "text-white/55 hover:bg-white/8 hover:text-white/80"
                        }`}
                      >
                        <span
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold transition-all ${
                            isCurrent
                              ? "border-cta bg-cta text-cta-foreground shadow-[0_0_18px_rgba(250,190,40,0.48)] ring-4 ring-cta/20"
                              : isComplete
                                ? "border-trust bg-trust text-white shadow-[0_0_18px_rgba(34,197,94,0.5)]"
                                : "border-white/25 bg-white/10 text-white/65"
                          }`}
                        >
                          {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-base font-bold leading-tight">
                            {t(stepLabelKeys[wizardStep.id])}
                          </span>
                          <span className={`mt-1 block text-[11px] ${isCurrent ? "text-white/70" : "text-white/40"}`}>
                            {t("wizard.step")} {index + 1} {t("wizard.of")} {totalSteps}
                          </span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="mx-auto w-full max-w-5xl">
            <div className="space-y-4 px-4 pt-6 lg:px-6">
              <motion.h1
                key={currentStep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                {t(stepHeadlineKeys[currentStep.id])}
              </motion.h1>
              <StepExamples step={currentStep.id} />
            </div>

            {currentStep.id === "finish" && (
              <div className="px-4 pt-6 lg:px-6">
                <TemplateGallery data={data} onChange={updateData} />
              </div>
            )}

            {currentStep.forms.map((formStep) => (
              <ResumeForm key={formStep} data={data} onChange={updateData} step={formStep} />
            ))}

            <div className="px-4 pb-2 lg:px-6">
              <ExtraSectionsDialog data={data} onChange={updateData} />
            </div>

            {/* Score follows the form instead of competing with it in a second column. */}
            <div className="px-4 pb-6 pt-4 lg:px-6">
              <ResumeScoreCard data={data} />
            </div>

            {/* Step navigation */}
            <div className="sticky bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md lg:px-6">
              <Button variant="outline" onClick={() => goTo(stepIndex - 1)} disabled={stepIndex === 0}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                {t("wizard.back")}
              </Button>
              {isLastStep ? (
                <Button
                  className="bg-brand font-semibold text-primary-foreground hover:bg-brand-dark"
                  onClick={() => {
                    setMode("workspace");
                    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
                  }}
                >
                  {t("wizard.finish")}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="bg-brand font-semibold text-primary-foreground hover:bg-brand-dark"
                  onClick={() => goTo(stepIndex + 1)}
                >
                  {t("wizard.next")}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* The full CV stays below the guided input flow and remains available for checking. */}
            <div className="border-t border-border bg-muted/35 px-4 py-8 lg:px-6 lg:py-10">
              <ResumePreview data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
