import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Upload, Loader2, Sparkles, Pencil } from "lucide-react";
import type { ResumeData, Education, WorkExperience, Skill, Language } from "@/lib/resume-types";
import { useI18n } from "@/lib/i18n";
import { SUPPORTED_LOCALES, localeFlags, localeNames, type Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { AIAssistButton } from "./AIAssistButton";
import { EXPERIENCE_PENDING_KEY, ExperienceAssistantDialog } from "./ExperienceAssistantDialog";
import { VoiceInputButton } from "./VoiceInputButton";
import { PremiumUpsellDialog } from "./PremiumUpsellDialog";
import { useEntitlements } from "@/lib/entitlements";

import { useServerFn } from "@tanstack/react-start";
import { generateCoverLetter } from "@/lib/resume-ai.functions";
import { aiErrorKey } from "@/lib/ai-errors";
import { hasAiSession } from "@/lib/ai-auth";
import { trackAiAction } from "@/lib/ai-cost";
import { toast } from "sonner";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
  /** When provided, the form is driven by an external wizard and hides its own tab bar. */
  step?: string;
}

export const resumeStepIds = [
  "personal",
  "education",
  "experience",
  "skills",
  "summary",
  "cover-letter",
  "settings",
] as const;
export type ResumeStepId = (typeof resumeStepIds)[number];

const stepIds = resumeStepIds;

const stepLabelKeys = {
  personal: "tab.personal",
  experience: "tab.experience",
  education: "tab.education",
  skills: "tab.skills",
  summary: "form.summary",
  "cover-letter": "tab.coverLetter",
  settings: "tab.settings",
} as const;

const levelKeys = ["native", "fluent", "advanced", "intermediate", "beginner"] as const;

const fieldExamples: Record<Locale, Record<string, string>> = {
  de: {
    fullName: "z. B. Sara Benali",
    location: "z. B. Köln, Deutschland",
    email: "z. B. sara.benali@email.de",
    phone: "z. B. +49 170 1234567",
    linkedin: "z. B. linkedin.com/in/sara-benali",
    website: "z. B. sarabenali.de",
    position: "z. B. Projektmanagerin",
    company: "z. B. Deloitte",
    workLocation: "z. B. Düsseldorf",
    degree: "z. B. Bachelor Wirtschaftsinformatik",
    institution: "z. B. Universität zu Köln",
    educationLocation: "z. B. Köln",
    skill: "z. B. Projektmanagement",
    language: "z. B. Deutsch",
  },
  en: {
    fullName: "e.g. Sara Benali",
    location: "e.g. London, United Kingdom",
    email: "e.g. sara.benali@email.com",
    phone: "e.g. +44 7700 900123",
    linkedin: "e.g. linkedin.com/in/sara-benali",
    website: "e.g. sarabenali.com",
    position: "e.g. Project Manager",
    company: "e.g. Deloitte",
    workLocation: "e.g. London",
    degree: "e.g. BSc Business Information Systems",
    institution: "e.g. University of London",
    educationLocation: "e.g. London",
    skill: "e.g. Project management",
    language: "e.g. English",
  },
  fr: {
    fullName: "ex. Sara Benali",
    location: "ex. Paris, France",
    email: "ex. sara.benali@email.fr",
    phone: "ex. +33 6 12 34 56 78",
    linkedin: "ex. linkedin.com/in/sara-benali",
    website: "ex. sarabenali.fr",
    position: "ex. Cheffe de projet",
    company: "ex. Deloitte",
    workLocation: "ex. Paris",
    degree: "ex. Licence en informatique de gestion",
    institution: "ex. Université Paris Cité",
    educationLocation: "ex. Paris",
    skill: "ex. Gestion de projet",
    language: "ex. Français",
  },
  ar: {
    fullName: "مثال: سارة بنعلي",
    location: "مثال: الدار البيضاء، المغرب",
    email: "مثال: sara.benali@email.ma",
    phone: "مثال: +212 6 12 34 56 78",
    linkedin: "مثال: linkedin.com/in/sara-benali",
    website: "مثال: sarabenali.ma",
    position: "مثال: مديرة مشاريع",
    company: "مثال: Deloitte",
    workLocation: "مثال: الدار البيضاء",
    degree: "مثال: إجازة في نظم المعلومات",
    institution: "مثال: جامعة الحسن الثاني",
    educationLocation: "مثال: الدار البيضاء",
    skill: "مثال: إدارة المشاريع",
    language: "مثال: العربية",
  },
  es: {
    fullName: "p. ej. Sara Benali",
    location: "p. ej. Madrid, España",
    email: "p. ej. sara.benali@email.es",
    phone: "p. ej. +34 612 345 678",
    linkedin: "p. ej. linkedin.com/in/sara-benali",
    website: "p. ej. sarabenali.es",
    position: "p. ej. Gestora de proyectos",
    company: "p. ej. Deloitte",
    workLocation: "p. ej. Madrid",
    degree: "p. ej. Grado en Sistemas de Información",
    institution: "p. ej. Universidad Complutense",
    educationLocation: "p. ej. Madrid",
    skill: "p. ej. Gestión de proyectos",
    language: "p. ej. Español",
  },
  it: {
    fullName: "es. Sara Benali",
    location: "es. Milano, Italia",
    email: "es. sara.benali@email.it",
    phone: "es. +39 320 123 4567",
    linkedin: "es. linkedin.com/in/sara-benali",
    website: "es. sarabenali.it",
    position: "es. Project manager",
    company: "es. Deloitte",
    workLocation: "es. Milano",
    degree: "es. Laurea in Sistemi informativi",
    institution: "es. Università degli Studi di Milano",
    educationLocation: "es. Milano",
    skill: "es. Gestione progetti",
    language: "es. Italiano",
  },
  nl: {
    fullName: "bijv. Sara Benali",
    location: "bijv. Amsterdam, Nederland",
    email: "bijv. sara.benali@email.nl",
    phone: "bijv. +31 6 12345678",
    linkedin: "bijv. linkedin.com/in/sara-benali",
    website: "bijv. sarabenali.nl",
    position: "bijv. Projectmanager",
    company: "bijv. Deloitte",
    workLocation: "bijv. Amsterdam",
    degree: "bijv. Bachelor Bedrijfsinformatica",
    institution: "bijv. Universiteit van Amsterdam",
    educationLocation: "bijv. Amsterdam",
    skill: "bijv. Projectmanagement",
    language: "bijv. Nederlands",
  },
};

function isRTL(text: string) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

export function ResumeForm({ data, onChange, step: controlledStep }: ResumeFormProps) {
  const [internalStep, setInternalStep] = useState<string>("personal");
  const activeStep = controlledStep ?? internalStep;

  const { t, locale } = useI18n();
  const fieldExample = fieldExamples[locale];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const createCoverLetter = useServerFn(generateCoverLetter);
  const { premium } = useEntitlements();
  const [showUpsell, setShowUpsell] = useState(false);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);

  useEffect(() => {
    if (activeStep !== "experience" || typeof window === "undefined") return;
    if (!sessionStorage.getItem(EXPERIENCE_PENDING_KEY)) return;
    setEditingExperience(null);
    setExperienceDialogOpen(true);
  }, [activeStep]);

  const handleGenerateCoverLetter = async () => {
    if (!premium) {
      setShowUpsell(true);
      return;
    }
    if (!company.trim()) {
      toast.error(t("cover.needCompany"));
      return;
    }
    setIsGenerating(true);

    try {
      if (!(await hasAiSession())) throw new Error("AI_AUTH_REQUIRED");
      const result = await createCoverLetter({
        data: {
          resume: {
            personalDetails: {
              fullName: data.personalDetails.fullName || "",
              email: data.personalDetails.email || "",
              phone: data.personalDetails.phone || "",
              location: data.personalDetails.location || "",
            },
            settings: {
              language: data.settings.language,
              targetPosition: data.settings.targetPosition || "",
            },
            workExperience: data.workExperience.map((w) => ({
              position: w.position,
              company: w.company,
              description: w.description,
            })),
            education: data.education.map((e) => ({
              degree: e.degree,
              institution: e.institution,
            })),
          },
          company: company.trim(),
          jobDescription: jobDescription.trim() || undefined,
        },
      });
      trackAiAction("coverLetter");
      onChange((prev) => ({ ...prev, coverLetter: result.text }));
      toast.success(t("cover.created"));
    } catch (error) {
      toast.error(t(aiErrorKey(error, "cover.failed")));
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePersonal = (field: keyof ResumeData["personalDetails"], value: string) => {
    onChange((prev) => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [field]: value },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updatePersonal("photo", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openNewExperience = () => {
    setEditingExperience(null);
    setExperienceDialogOpen(true);
  };

  const openExperience = (item: WorkExperience) => {
    setEditingExperience(item);
    setExperienceDialogOpen(true);
  };

  const saveWorkExperience = (experience: WorkExperience) => {
    onChange((prev) => {
      const exists = prev.workExperience.some((item) => item.id === experience.id);
      return {
        ...prev,
        workExperience: exists
          ? prev.workExperience.map((item) => (item.id === experience.id ? experience : item))
          : [...prev.workExperience, experience],
      };
    });
  };

  const removeWorkExperience = (id: string) => {
    onChange((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((item) => item.id !== id),
    }));
  };

  const addEducation = () => {
    const item: Education = {
      id: crypto.randomUUID(),
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    onChange((prev) => ({ ...prev, education: [...prev.education, item] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeEducation = (id: string) => {
    onChange((prev) => ({ ...prev, education: prev.education.filter((item) => item.id !== id) }));
  };

  const addSkill = () => {
    const item: Skill = { id: crypto.randomUUID(), name: "" };
    onChange((prev) => ({ ...prev, skills: [...prev.skills, item] }));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    onChange((prev) => ({
      ...prev,
      skills: prev.skills.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const removeSkill = (id: string) => {
    onChange((prev) => ({ ...prev, skills: prev.skills.filter((item) => item.id !== id) }));
  };

  const addLanguage = () => {
    const item: Language = { id: crypto.randomUUID(), name: "", level: "fluent" };
    onChange((prev) => ({ ...prev, languages: [...prev.languages, item] }));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    onChange((prev) => ({
      ...prev,
      languages: prev.languages.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeLanguage = (id: string) => {
    onChange((prev) => ({ ...prev, languages: prev.languages.filter((item) => item.id !== id) }));
  };

  return (
    <div className="w-full">
      <Tabs value={activeStep} onValueChange={setInternalStep} className="w-full">
        {!controlledStep && (
          <div className="sticky top-[57px] z-40 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-md">
            <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-transparent p-0 sm:grid-cols-6">
              {stepIds.map((step) => (
                <TabsTrigger
                  key={step}
                  value={step}
                  className="truncate rounded-md px-1 py-1.5 text-[10px] font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-xs"
                >
                  {t(stepLabelKeys[step])}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}

        <div className="p-4 pb-8 lg:p-6">
          <TabsContent value="personal" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.personalTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {data.personalDetails.photo ? (
                      <img
                        src={data.personalDetails.photo}
                        alt="Profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="photo-upload">{t("form.photoLabel")}</Label>
                    <Input
                      id="photo-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="fullName">{t("form.fullName")}</Label>
                    <Input
                      id="fullName"
                      value={data.personalDetails.fullName}
                      onChange={(e) => updatePersonal("fullName", e.target.value)}
                      placeholder={fieldExample["fullName"]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t("form.dateOfBirth")}</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={data.personalDetails.dateOfBirth}
                      onChange={(e) => updatePersonal("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">{t("form.location")}</Label>
                    <Input
                      id="location"
                      value={data.personalDetails.location}
                      onChange={(e) => updatePersonal("location", e.target.value)}
                      placeholder={fieldExample["location"]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("form.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.personalDetails.email}
                      onChange={(e) => updatePersonal("email", e.target.value)}
                      placeholder={fieldExample["email"]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("form.phone")}</Label>
                    <Input
                      id="phone"
                      value={data.personalDetails.phone}
                      onChange={(e) => updatePersonal("phone", e.target.value)}
                      placeholder={fieldExample["phone"]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={data.personalDetails.linkedin}
                      onChange={(e) => updatePersonal("linkedin", e.target.value)}
                      placeholder={fieldExample["linkedin"]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={data.personalDetails.website}
                      onChange={(e) => updatePersonal("website", e.target.value)}
                      placeholder={fieldExample["website"]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.summary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    id="summary"
                    value={data.personalDetails.summary}
                    onChange={(e) => updatePersonal("summary", e.target.value)}
                    placeholder={t("form.summaryPlaceholder")}
                    rows={8}
                    className={cn(
                      "pb-10",
                      isRTL(data.personalDetails.summary || "") && "text-right",
                    )}
                    dir={isRTL(data.personalDetails.summary || "") ? "rtl" : "ltr"}
                  />
                  <VoiceInputButton
                    className="absolute right-10 bottom-2"
                    onTranscript={(text) =>
                      updatePersonal(
                        "summary",
                        data.personalDetails.summary
                          ? `${data.personalDetails.summary} ${text}`
                          : text,
                      )
                    }
                  />
                  <AIAssistButton
                    text={data.personalDetails.summary || ""}
                    language={data.settings.language}
                    context={t("form.summaryContext")}
                    onResult={(text) => updatePersonal("summary", text)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="mt-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("tab.experience")}</h3>
              <Button size="sm" onClick={openNewExperience}>
                <Plus className="mr-1.5 h-4 w-4" /> {t("form.add")}
              </Button>
            </div>
            {data.workExperience.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  {t("form.emptyExperience")}
                </CardContent>
              </Card>
            )}
            {data.workExperience.map((item, index) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">{`${t("form.entry")} ${index + 1}`}</p>
                    <CardTitle className="text-lg">{item.position || t("form.position")}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[
                        item.company,
                        item.location,
                        [item.startDate, item.endDate].filter(Boolean).join(" – "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Berufserfahrung bearbeiten"
                      onClick={() => openExperience(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Berufserfahrung löschen"
                      onClick={() => removeWorkExperience(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                {item.description && (
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
            <ExperienceAssistantDialog
              open={experienceDialogOpen}
              onOpenChange={setExperienceDialogOpen}
              experience={editingExperience}
              language={data.settings.language}
              onSave={saveWorkExperience}
            />
          </TabsContent>

          <TabsContent value="education" className="mt-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("tab.education")}</h3>
              <Button size="sm" onClick={addEducation}>
                <Plus className="mr-1.5 h-4 w-4" /> {t("form.add")}
              </Button>
            </div>
            {data.education.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  {t("form.emptyEducation")}
                </CardContent>
              </Card>
            )}
            {data.education.map((item, index) => (
              <Card key={item.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">{`${t("form.entry")} ${index + 1}`}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => removeEducation(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("form.degree")}</Label>
                      <Input
                        value={item.degree}
                        onChange={(e) => updateEducation(item.id, "degree", e.target.value)}
                        placeholder={fieldExample["degree"]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.institution")}</Label>
                      <Input
                        value={item.institution}
                        onChange={(e) => updateEducation(item.id, "institution", e.target.value)}
                        placeholder={fieldExample["institution"]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.location")}</Label>
                      <Input
                        value={item.location}
                        onChange={(e) => updateEducation(item.id, "location", e.target.value)}
                        placeholder={fieldExample["educationLocation"]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.period")}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            {t("form.startDate")}
                          </Label>
                          <Input
                            type="month"
                            value={item.startDate}
                            onChange={(e) => updateEducation(item.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            {t("form.endDate")}
                          </Label>
                          <Input
                            type="month"
                            value={item.endDate}
                            onChange={(e) => updateEducation(item.id, "endDate", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="skills" className="mt-0 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>{t("form.skills")}</CardTitle>
                <Button size="sm" onClick={addSkill}>
                  <Plus className="mr-1.5 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("form.emptySkills")}</p>
                )}
                {data.skills.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input
                      value={item.name}
                      onChange={(e) => updateSkill(item.id, "name", e.target.value)}
                      placeholder={fieldExample["skill"]}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeSkill(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>{t("form.languages")}</CardTitle>
                <Button size="sm" onClick={addLanguage}>
                  <Plus className="mr-1.5 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.languages.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("form.emptyLanguages")}</p>
                )}
                {data.languages.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateLanguage(item.id, "name", e.target.value)}
                        placeholder={fieldExample["language"]}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeLanguage(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {levelKeys.map((key) => (
                        <Button
                          key={key}
                          type="button"
                          variant={item.level === key ? "default" : "outline"}
                          size="sm"
                          className="h-auto whitespace-normal py-2 text-xs"
                          onClick={() => updateLanguage(item.id, "level", key)}
                        >
                          {t(`level.${key}`)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cover-letter" className="mt-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("cover.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!premium && (
                  <p className="rounded-md border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
                    {t("cover.premiumHint")}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="company">{t("cover.company")}</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t("cover.companyPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">{t("cover.jobDescription")}</Label>
                  <Textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder={t("cover.jobDescriptionPlaceholder")}
                    rows={5}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleGenerateCoverLetter}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("cover.generating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> {t("cover.generate")}
                    </>
                  )}
                </Button>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">{t("cover.editable")}</Label>
                  <Textarea
                    id="coverLetter"
                    value={data.coverLetter || ""}
                    onChange={(e) => onChange((prev) => ({ ...prev, coverLetter: e.target.value }))}
                    placeholder={t("cover.placeholder")}
                    rows={16}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.outputSettings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("form.outputLanguage")}</Label>
                  <Select
                    value={data.settings.language}
                    onValueChange={(v) =>
                      onChange((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, language: v as Locale },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LOCALES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {localeFlags[code]} {localeNames[code]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="targetPosition">{t("form.targetPosition")}</Label>
                  <Input
                    id="targetPosition"
                    value={data.settings.targetPosition || ""}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, targetPosition: e.target.value },
                      }))
                    }
                    placeholder={t("form.targetPositionPlaceholder")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
      <PremiumUpsellDialog open={showUpsell} onOpenChange={setShowUpsell} feature="cover-letter" />
    </div>
  );
}
