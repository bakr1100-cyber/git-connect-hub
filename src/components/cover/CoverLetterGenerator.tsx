import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DocumentLanguageSwitcher } from "@/components/resume/DocumentLanguageSwitcher";
import { CoverLetterPreview, type CoverLetterDocument } from "./CoverLetterPreview";
import { coverCopy } from "./coverCopy";

import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { hasAiSession } from "@/lib/ai-auth";
import { rememberAuthReturnPath } from "@/lib/auth-return";
import { composeCoverLetter, suggestCoverPoints } from "@/lib/resume-ai.functions";
import { downloadCoverLetterPdf, downloadCoverLetterWord, emailCoverLetter } from "@/lib/cover-letter-export";
import { defaultResumeData, type ResumeData } from "@/lib/resume-types";
import { cn } from "@/lib/utils";

const RESUME_KEY = "resume-draft-v1";
const COVER_KEY = "cover-letter-draft-v1";

interface Suggestion {
  text: string;
  translation: string;
}

interface CoverDraft {
  position: string;
  company: string;
  recipient: string;
  companyAddress: string;
  jobDescription: string;
  notes: string;
  tone: "professional" | "warm" | "confident";
  language: Locale;
  applicant: { fullName: string; email: string; phone: string; location: string };
  body: string;
}

const emptyDraft = (language: Locale): CoverDraft => ({
  position: "",
  company: "",
  recipient: "",
  companyAddress: "",
  jobDescription: "",
  notes: "",
  tone: "professional",
  language,
  applicant: { fullName: "", email: "", phone: "", location: "" },
  body: "",
});

export function CoverLetterGenerator() {
  const { locale, dir } = useI18n();
  const c = coverCopy[locale];

  const [draft, setDraft] = useState<CoverDraft>(() => emptyDraft(locale));
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [writing, setWriting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [authed, setAuthed] = useState(true);

  const fetchSuggestions = useServerFn(suggestCoverPoints);
  const writeLetter = useServerFn(composeCoverLetter);

  // Prefill from CV draft + restore own draft
  useEffect(() => {
    if (typeof window === "undefined") return;
    let next = emptyDraft(locale);
    try {
      const resumeRaw = localStorage.getItem(RESUME_KEY);
      if (resumeRaw) {
        const resume = { ...defaultResumeData, ...(JSON.parse(resumeRaw) as ResumeData) };
        next = {
          ...next,
          language: (resume.settings?.language as Locale) ?? locale,
          position: resume.settings?.targetPosition ?? "",
          applicant: {
            fullName: resume.personalDetails?.fullName ?? "",
            email: resume.personalDetails?.email ?? "",
            phone: resume.personalDetails?.phone ?? "",
            location: resume.personalDetails?.location ?? "",
          },
        };
      }
      const own = localStorage.getItem(COVER_KEY);
      if (own) next = { ...next, ...(JSON.parse(own) as CoverDraft) };
    } catch {
      // ignore
    }
    setDraft(next);
    setLoaded(true);
    void hasAiSession().then(setAuthed);
  }, [locale]);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") return;
    localStorage.setItem(COVER_KEY, JSON.stringify(draft));
  }, [draft, loaded]);

  const background = useMemo(() => {
    if (typeof window === "undefined") return "";
    try {
      const raw = localStorage.getItem(RESUME_KEY);
      if (!raw) return "";
      const resume = { ...defaultResumeData, ...(JSON.parse(raw) as ResumeData) };
      const jobs = resume.workExperience
        .map((w) => `- ${w.position} @ ${w.company} (${w.startDate}–${w.endDate || "heute"}): ${w.description}`)
        .join("\n");
      const edu = resume.education.map((e) => `- ${e.degree}, ${e.institution}`).join("\n");
      const skills = resume.skills.map((s) => s.name).join(", ");
      return [resume.personalDetails.summary, jobs, edu, skills].filter(Boolean).join("\n");
    } catch {
      return "";
    }
  }, [loaded]);

  const patch = useCallback((values: Partial<CoverDraft>) => {
    setDraft((prev) => ({ ...prev, ...values }));
  }, []);

  const loadSuggestions = useCallback(async () => {
    if (!draft.position.trim() || !draft.company.trim()) return;
    setLoadingSuggestions(true);
    try {
      const result = await fetchSuggestions({
        data: {
          position: draft.position.trim(),
          company: draft.company.trim(),
          jobDescription: draft.jobDescription.trim() || undefined,
          language: draft.language,
          uiLanguage: locale,
        },
      });
      setSuggestions(result.suggestions);
    } catch (error) {
      void error;
      toast.error(c.suggestionsFailed);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [c.suggestionsFailed, draft.company, draft.jobDescription, draft.language, draft.position, fetchSuggestions, locale]);

  const goIdeas = () => {
    if (!draft.position.trim() || !draft.company.trim()) {
      toast.error(c.needJob);
      return;
    }
    setStep(1);
    if (!suggestions.length) void loadSuggestions();
  };

  const toggle = (text: string) =>
    setSelected((prev) => (prev.includes(text) ? prev.filter((s) => s !== text) : [...prev, text]));

  const generate = async () => {
    setWriting(true);
    try {
      const result = await writeLetter({
        data: {
          position: draft.position.trim(),
          company: draft.company.trim(),
          recipient: draft.recipient.trim() || undefined,
          companyAddress: draft.companyAddress.trim() || undefined,
          jobDescription: draft.jobDescription.trim() || undefined,
          selectedPoints: selected,
          ownNotes: draft.notes.trim() || undefined,
          tone: draft.tone,
          applicant: draft.applicant,
          background: background || undefined,
          language: draft.language,
        },
      });
      patch({ body: result.text });
      setStep(2);
      toast.success(c.created);
    } catch (error) {
      void error;
      toast.error(c.failed);
    } finally {
      setWriting(false);
    }
  };

  const doc: CoverLetterDocument = {
    applicant: draft.applicant,
    company: draft.company,
    recipient: draft.recipient,
    companyAddress: draft.companyAddress,
    position: draft.position,
    body: draft.body || c.empty,
    language: draft.language,
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      await downloadCoverLetterPdf(doc);
    } catch {
      toast.error(c.failed);
    } finally {
      setExporting(false);
    }
  };

  const sendMail = async () => {
    setExporting(true);
    try {
      await emailCoverLetter(doc);
      toast.success(c.mailPrepared);
    } catch {
      toast.error(c.failed);
    } finally {
      setExporting(false);
    }
  };

  const steps = [c.stepJob, c.stepIdeas, c.stepReview];

  return (
    <div className="flex min-h-screen flex-col bg-background" dir={dir}>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
              <FileText className="h-5 w-5 text-brand" />
              <span className="hidden sm:inline">{c.title}</span>
            </Link>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {c.step} {step + 1} {c.of} {steps.length}
              </p>
              <p className="text-sm font-semibold text-foreground">{steps[step]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <DocumentLanguageSwitcher value={draft.language} onChange={(next) => patch({ language: next })} />
            <Button size="sm" onClick={() => void exportPdf()} disabled={exporting || !draft.body}>
              {exporting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-4 w-4" />
              )}
              PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="space-y-4">
          {!authed && (
            <Card className="border-brand/30 bg-brand/5">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <span>{c.signInText}</span>
                <Button asChild size="sm" onClick={() => rememberAuthReturnPath("/anschreiben")}>
                  <Link to="/auth">{c.signIn}</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{c.stepJob}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="cl-position">{c.position}</Label>
                    <Input
                      id="cl-position"
                      value={draft.position}
                      placeholder={c.positionPlaceholder}
                      onChange={(e) => patch({ position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cl-company">{c.company}</Label>
                    <Input
                      id="cl-company"
                      value={draft.company}
                      placeholder={c.companyPlaceholder}
                      onChange={(e) => patch({ company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cl-recipient">{c.recipient}</Label>
                    <Input
                      id="cl-recipient"
                      value={draft.recipient}
                      placeholder={c.recipientPlaceholder}
                      onChange={(e) => patch({ recipient: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cl-address">{c.address}</Label>
                    <Input
                      id="cl-address"
                      value={draft.companyAddress}
                      placeholder={c.addressPlaceholder}
                      onChange={(e) => patch({ companyAddress: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cl-ad">{c.jobAd}</Label>
                  <Textarea
                    id="cl-ad"
                    rows={5}
                    value={draft.jobDescription}
                    placeholder={c.jobAdPlaceholder}
                    onChange={(e) => patch({ jobDescription: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{c.tone}</Label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["professional", c.toneProfessional],
                        ["warm", c.toneWarm],
                        ["confident", c.toneConfident],
                      ] as const
                    ).map(([value, label]) => (
                      <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={draft.tone === value ? "default" : "outline"}
                        onClick={() => patch({ tone: value })}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-sm font-semibold text-foreground">{c.yourData}</p>
                  <p className="mb-3 text-xs text-muted-foreground">{c.yourDataHint}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["fullName", c.fullName],
                        ["email", c.email],
                        ["phone", c.phone],
                        ["location", c.location],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className="space-y-1.5">
                        <Label htmlFor={`cl-${key}`} className="text-xs">
                          {label}
                        </Label>
                        <Input
                          id={`cl-${key}`}
                          value={draft.applicant[key]}
                          onChange={(e) =>
                            patch({ applicant: { ...draft.applicant, [key]: e.target.value } })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={goIdeas}>
                  {c.next}
                  <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">{c.ideasTitle}</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => void loadSuggestions()} disabled={loadingSuggestions}>
                  <RefreshCw className={cn("me-1.5 h-4 w-4", loadingSuggestions && "animate-spin")} />
                  {c.reload}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">{c.ideasHint}</p>

                {loadingSuggestions ? (
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                    {c.loading}
                  </div>
                ) : (
                  <div className="ai-suggestion-scroll relative max-h-[320px] space-y-2 overflow-y-auto p-1">
                    {suggestions.map((suggestion) => {
                      const active = selected.includes(suggestion.text);
                      return (
                        <button
                          key={suggestion.text}
                          type="button"
                          onClick={() => toggle(suggestion.text)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl border p-3 text-start transition-colors",
                            active
                              ? "border-brand bg-brand/5"
                              : "border-border bg-background hover:border-brand/40"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              active ? "border-brand bg-brand text-primary-foreground" : "border-border"
                            )}
                          >
                            {active ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          </span>
                          <span className="space-y-1">
                            <span className="block text-sm font-medium text-foreground">{suggestion.text}</span>
                            {suggestion.translation && (
                              <span className="block border-s-2 border-brand/25 ps-2 text-xs text-muted-foreground">
                                {suggestion.translation}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="cl-notes">{c.notes}</Label>
                  <Textarea
                    id="cl-notes"
                    rows={3}
                    value={draft.notes}
                    placeholder={c.notesPlaceholder}
                    onChange={(e) => patch({ notes: e.target.value })}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft className="me-1.5 h-4 w-4" />
                    {c.back}
                  </Button>
                  <Button className="flex-1" onClick={() => void generate()} disabled={writing}>
                    {writing ? (
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="me-2 h-4 w-4" />
                    )}
                    {writing ? c.generating : c.generate}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{c.editable}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">{c.editableHint}</p>
                <Textarea
                  rows={16}
                  value={draft.body}
                  onChange={(e) => patch({ body: e.target.value })}
                  className="font-serif text-sm leading-relaxed"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="me-1.5 h-4 w-4" />
                    {c.back}
                  </Button>
                  <Button variant="outline" onClick={() => void generate()} disabled={writing}>
                    {writing ? (
                      <Loader2 className="me-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="me-1.5 h-4 w-4" />
                    )}
                    {c.regenerate}
                  </Button>
                  <Button variant="outline" onClick={() => downloadCoverLetterWord(doc)} disabled={!draft.body}>
                    <Download className="me-1.5 h-4 w-4" />
                    {c.downloadWord}
                  </Button>
                  <Button variant="outline" onClick={() => void sendMail()} disabled={exporting || !draft.body}>
                    <Mail className="me-1.5 h-4 w-4" />
                    {c.sendMail}
                  </Button>
                  <Button className="flex-1" onClick={() => void exportPdf()} disabled={exporting || !draft.body}>
                    {exporting ? (
                      <Loader2 className="me-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="me-1.5 h-4 w-4" />
                    )}
                    {c.approve}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-2">
          <p className="text-xs text-muted-foreground">{c.preview}</p>
          <div className="overflow-hidden rounded-xl border border-border">
            <CoverLetterPreview doc={doc} />
          </div>
        </aside>
      </main>
    </div>
  );
}
