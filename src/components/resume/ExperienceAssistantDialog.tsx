import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hasAiSession } from "@/lib/ai-auth";
import { rememberAuthReturnPath } from "@/lib/auth-return";
import { composeExperienceDescription, suggestExperience } from "@/lib/resume-ai.functions";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import type { WorkExperience } from "@/lib/resume-types";
import { cn } from "@/lib/utils";

const EMPTY_EXPERIENCE: WorkExperience = {
  id: "",
  position: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

export const EXPERIENCE_PENDING_KEY = "mycv-pending-experience-v1";

const dialogCopy = {
  de: {
    addTitle: "Berufserfahrung hinzufügen",
    editTitle: "Berufserfahrung bearbeiten",
    overview: "Übersicht",
    description: "Beschreibung & KI-Vorschläge",
    required: "Bitte gib zuerst deine Berufsbezeichnung ein.",
    rolePlaceholder: "z. B. SAP-Beraterin, Pflegefachmann, Verkäuferin",
    companyPlaceholder: "z. B. Deloitte",
    locationPlaceholder: "z. B. Düsseldorf",
    tasks: "Deine Aufgaben und Erfolge",
    tasksPlaceholder: "Schreibe eigene Stichpunkte oder wähle unten passende KI-Vorschläge aus.",
    aiFor: "KI-Vorschläge für",
    reload: "Neu laden",
    loading: "Die KI sucht passende Aufgaben für deinen Beruf …",
    signInText:
      "Melde dich an, damit die KI individuelle Vorschläge erstellen kann. Dein Entwurf bleibt gespeichert.",
    signIn: "Jetzt anmelden",
    suggestionsFailed: "Die KI-Vorschläge konnten nicht geladen werden.",
    finalFailed: "Der finale Text konnte nicht erstellt werden. Dein Entwurf bleibt erhalten.",
    retry: "Erneut versuchen",
    finalize: "Aus Auswahl professionellen Endtext erstellen",
    save: "Berufserfahrung speichern",
    back: "Zurück",
    next: "Weiter",
  },
  en: {
    addTitle: "Add work experience",
    editTitle: "Edit work experience",
    overview: "Overview",
    description: "Description & AI suggestions",
    required: "Please enter your job title first.",
    rolePlaceholder: "e.g. SAP consultant, nurse, sales assistant",
    companyPlaceholder: "e.g. Deloitte",
    locationPlaceholder: "e.g. London",
    tasks: "Your responsibilities and achievements",
    tasksPlaceholder: "Write your own notes or select suitable AI suggestions below.",
    aiFor: "AI suggestions for",
    reload: "Reload",
    loading: "AI is finding suitable tasks for your profession …",
    signInText: "Sign in to create personalised AI suggestions. Your draft will remain saved.",
    signIn: "Sign in now",
    suggestionsFailed: "The AI suggestions could not be loaded.",
    finalFailed: "The final text could not be created. Your draft has been kept.",
    retry: "Try again",
    finalize: "Create a professional final text from selection",
    save: "Save work experience",
    back: "Back",
    next: "Next",
  },
  fr: {
    addTitle: "Ajouter une expérience",
    editTitle: "Modifier l’expérience",
    overview: "Aperçu",
    description: "Description et suggestions IA",
    required: "Saisissez d’abord l’intitulé du poste.",
    rolePlaceholder: "ex. consultante SAP, infirmier, vendeuse",
    companyPlaceholder: "ex. Deloitte",
    locationPlaceholder: "ex. Paris",
    tasks: "Vos missions et réalisations",
    tasksPlaceholder: "Rédigez vos propres notes ou sélectionnez les suggestions IA ci-dessous.",
    aiFor: "Suggestions IA pour",
    reload: "Actualiser",
    loading: "L’IA recherche des missions adaptées à votre métier …",
    signInText:
      "Connectez-vous pour obtenir des suggestions IA personnalisées. Votre brouillon restera enregistré.",
    signIn: "Se connecter",
    suggestionsFailed: "Les suggestions IA n’ont pas pu être chargées.",
    finalFailed: "Le texte final n’a pas pu être créé. Votre brouillon a été conservé.",
    retry: "Réessayer",
    finalize: "Créer un texte final professionnel",
    save: "Enregistrer l’expérience",
    back: "Retour",
    next: "Suivant",
  },
  ar: {
    addTitle: "إضافة خبرة مهنية",
    editTitle: "تعديل الخبرة المهنية",
    overview: "نظرة عامة",
    description: "الوصف واقتراحات الذكاء الاصطناعي",
    required: "أدخل المسمى الوظيفي أولاً.",
    rolePlaceholder: "مثال: مستشار SAP، ممرض، بائعة",
    companyPlaceholder: "مثال: Deloitte",
    locationPlaceholder: "مثال: الدار البيضاء",
    tasks: "مهامك وإنجازاتك",
    tasksPlaceholder: "اكتب نقاطك أو اختر اقتراحات الذكاء الاصطناعي المناسبة أدناه.",
    aiFor: "اقتراحات الذكاء الاصطناعي لـ",
    reload: "اقتراحات جديدة",
    loading: "يبحث الذكاء الاصطناعي عن مهام مناسبة لمهنتك …",
    signInText: "سجّل الدخول للحصول على اقتراحات مخصصة. سيبقى مسودتك محفوظة.",
    signIn: "تسجيل الدخول",
    suggestionsFailed: "تعذر تحميل اقتراحات الذكاء الاصطناعي.",
    finalFailed: "تعذر إنشاء النص النهائي. تم الاحتفاظ بمسودتك.",
    retry: "إعادة المحاولة",
    finalize: "إنشاء نص نهائي احترافي من الاختيارات",
    save: "حفظ الخبرة المهنية",
    back: "رجوع",
    next: "التالي",
  },
  es: {
    addTitle: "Añadir experiencia laboral",
    editTitle: "Editar experiencia laboral",
    overview: "Resumen",
    description: "Descripción y sugerencias de IA",
    required: "Introduce primero el puesto.",
    rolePlaceholder: "p. ej. consultora SAP, enfermero, dependienta",
    companyPlaceholder: "p. ej. Deloitte",
    locationPlaceholder: "p. ej. Madrid",
    tasks: "Tus tareas y logros",
    tasksPlaceholder: "Escribe tus notas o selecciona sugerencias de IA abajo.",
    aiFor: "Sugerencias de IA para",
    reload: "Actualizar",
    loading: "La IA busca tareas adecuadas para tu profesión …",
    signInText:
      "Inicia sesión para recibir sugerencias personalizadas. Tu borrador seguirá guardado.",
    signIn: "Iniciar sesión",
    suggestionsFailed: "No se pudieron cargar las sugerencias de IA.",
    finalFailed: "No se pudo crear el texto final. Tu borrador se ha conservado.",
    retry: "Reintentar",
    finalize: "Crear texto final profesional",
    save: "Guardar experiencia",
    back: "Atrás",
    next: "Siguiente",
  },
  it: {
    addTitle: "Aggiungi esperienza lavorativa",
    editTitle: "Modifica esperienza lavorativa",
    overview: "Panoramica",
    description: "Descrizione e suggerimenti IA",
    required: "Inserisci prima il ruolo.",
    rolePlaceholder: "es. consulente SAP, infermiere, addetta vendite",
    companyPlaceholder: "es. Deloitte",
    locationPlaceholder: "es. Milano",
    tasks: "Mansioni e risultati",
    tasksPlaceholder: "Scrivi i tuoi appunti o seleziona i suggerimenti IA qui sotto.",
    aiFor: "Suggerimenti IA per",
    reload: "Aggiorna",
    loading: "L’IA cerca mansioni adatte alla tua professione …",
    signInText: "Accedi per ricevere suggerimenti personalizzati. La bozza resterà salvata.",
    signIn: "Accedi",
    suggestionsFailed: "Impossibile caricare i suggerimenti IA.",
    finalFailed: "Impossibile creare il testo finale. La bozza è stata conservata.",
    retry: "Riprova",
    finalize: "Crea un testo finale professionale",
    save: "Salva esperienza",
    back: "Indietro",
    next: "Avanti",
  },
  nl: {
    addTitle: "Werkervaring toevoegen",
    editTitle: "Werkervaring bewerken",
    overview: "Overzicht",
    description: "Beschrijving en AI-suggesties",
    required: "Vul eerst je functietitel in.",
    rolePlaceholder: "bijv. SAP-consultant, verpleegkundige, verkoper",
    companyPlaceholder: "bijv. Deloitte",
    locationPlaceholder: "bijv. Amsterdam",
    tasks: "Je taken en resultaten",
    tasksPlaceholder: "Schrijf eigen punten of kies hieronder passende AI-suggesties.",
    aiFor: "AI-suggesties voor",
    reload: "Vernieuwen",
    loading: "AI zoekt passende taken voor jouw beroep …",
    signInText: "Meld je aan voor persoonlijke AI-suggesties. Je concept blijft bewaard.",
    signIn: "Nu aanmelden",
    suggestionsFailed: "De AI-suggesties konden niet worden geladen.",
    finalFailed: "De definitieve tekst kon niet worden gemaakt. Je concept is bewaard.",
    retry: "Opnieuw proberen",
    finalize: "Professionele eindtekst maken",
    save: "Werkervaring opslaan",
    back: "Terug",
    next: "Volgende",
  },
} satisfies Record<Locale, Record<string, string>>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience?: WorkExperience | null;
  language: Locale;
  onSave: (experience: WorkExperience) => void;
}

function suggestionLine(text: string) {
  return `• ${text.replace(/^[•\-–]\s*/, "").trim()}`;
}

export function ExperienceAssistantDialog({
  open,
  onOpenChange,
  experience,
  language,
  onSave,
}: Props) {
  const { locale: uiLocale, t, dir } = useI18n();
  const copy = dialogCopy[uiLocale];
  const NextIcon = dir === "rtl" ? ArrowLeft : ArrowRight;
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;
  const [stage, setStage] = useState<"overview" | "description">("overview");
  const [draft, setDraft] = useState<WorkExperience>(EMPTY_EXPERIENCE);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suggest = useServerFn(suggestExperience);
  const compose = useServerFn(composeExperienceDescription);

  useEffect(() => {
    if (!open) return;
    const pending =
      typeof window !== "undefined" ? sessionStorage.getItem(EXPERIENCE_PENDING_KEY) : null;
    if (pending && !experience) {
      try {
        const parsed = JSON.parse(pending) as WorkExperience;
        setDraft(parsed);
        setStage("description");
        return;
      } catch {
        sessionStorage.removeItem(EXPERIENCE_PENDING_KEY);
      }
    }
    setDraft(experience ? { ...experience } : { ...EMPTY_EXPERIENCE, id: crypto.randomUUID() });
    setStage("overview");
    setSuggestions([]);
    setSelected([]);
    setError(null);
    setAuthRequired(false);
  }, [experience, open]);

  const title = useMemo(
    () => [draft.position, draft.company].filter(Boolean).join(" · ") || "Berufserfahrung",
    [draft.company, draft.position],
  );

  const update = (field: keyof WorkExperience, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const loadSuggestions = useCallback(async () => {
    if (draft.position.trim().length < 2) return;
    setLoadingSuggestions(true);
    setError(null);
    try {
      if (!(await hasAiSession())) {
        setAuthRequired(true);
        return;
      }
      setAuthRequired(false);
      const result = await suggest({
        data: { position: draft.position, company: draft.company, language },
      });
      setSuggestions(result.suggestions);
    } catch {
      setError(copy.suggestionsFailed);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [copy.suggestionsFailed, draft.company, draft.position, language, suggest]);

  const continueToDescription = () => {
    if (draft.position.trim().length < 2) {
      setError(copy.required);
      return;
    }
    setError(null);
    setSuggestions([]);
    setSelected([]);
    setStage("description");
  };

  useEffect(() => {
    if (
      !open ||
      stage !== "description" ||
      suggestions.length ||
      loadingSuggestions ||
      authRequired ||
      error
    )
      return;
    void loadSuggestions();
  }, [authRequired, error, loadSuggestions, loadingSuggestions, open, stage, suggestions.length]);

  const toggleSuggestion = (suggestion: string) => {
    const line = suggestionLine(suggestion);
    const isSelected = selected.includes(suggestion);
    setSelected((current) =>
      isSelected ? current.filter((item) => item !== suggestion) : [...current, suggestion],
    );
    setDraft((current) => {
      const lines = current.description
        .split("\n")
        .filter((item) => item.trim() && item.trim() !== line);
      return {
        ...current,
        description: isSelected ? lines.join("\n") : [...lines, line].join("\n"),
      };
    });
  };

  const reloadSuggestions = () => {
    const oldLines = new Set(selected.map(suggestionLine));
    setDraft((current) => ({
      ...current,
      description: current.description
        .split("\n")
        .filter((line) => !oldLines.has(line.trim()))
        .join("\n"),
    }));
    setSelected([]);
    setSuggestions([]);
    setError(null);
    void loadSuggestions();
  };

  const finalizeWithAi = async () => {
    if (!draft.description.trim()) return;
    setFinalizing(true);
    setError(null);
    try {
      if (!(await hasAiSession())) {
        setAuthRequired(true);
        return;
      }
      const result = await compose({
        data: {
          position: draft.position,
          company: draft.company,
          location: draft.location,
          sourceText: draft.description,
          selectedSuggestions: selected,
          language,
        },
      });
      update("description", result.text);
    } catch {
      setError(copy.finalFailed);
    } finally {
      setFinalizing(false);
    }
  };

  const rememberAndSignIn = () => {
    sessionStorage.setItem(EXPERIENCE_PENDING_KEY, JSON.stringify(draft));
    rememberAuthReturnPath();
  };

  const save = () => {
    onSave(draft);
    sessionStorage.removeItem(EXPERIENCE_PENDING_KEY);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0">
        <div className="border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle>{experience ? copy.editTitle : copy.addTitle}</DialogTitle>
            <DialogDescription>
              {stage === "overview" ? `1 / 2 · ${copy.overview}` : `2 / 2 · ${copy.description}`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid grid-cols-2 gap-2" aria-label="Fortschritt">
            <div
              className={`h-1.5 rounded-full ${stage === "overview" ? "bg-brand" : "bg-emerald-500"}`}
            />
            <div
              className={`h-1.5 rounded-full ${stage === "description" ? "bg-brand" : "bg-muted"}`}
            />
          </div>
        </div>

        {stage === "overview" ? (
          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="experience-position">{t("form.position")} *</Label>
              <Input
                id="experience-position"
                value={draft.position}
                onChange={(event) => update("position", event.target.value)}
                placeholder={copy.rolePlaceholder}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience-company">{t("form.company")}</Label>
              <Input
                id="experience-company"
                value={draft.company}
                onChange={(event) => update("company", event.target.value)}
                placeholder={copy.companyPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience-location">{t("form.location")}</Label>
              <Input
                id="experience-location"
                value={draft.location}
                onChange={(event) => update("location", event.target.value)}
                placeholder={copy.locationPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience-start">{t("form.startDate")}</Label>
              <Input
                id="experience-start"
                type="month"
                value={draft.startDate}
                onChange={(event) => update("startDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience-end">{t("form.endDate")}</Label>
              <Input
                id="experience-end"
                type="month"
                value={draft.endDate}
                onChange={(event) => update("endDate", event.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5 px-6 py-6">
            <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
              <p className="font-semibold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">
                {[draft.startDate, draft.endDate, draft.location].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience-description">{copy.tasks}</Label>
              <Textarea
                id="experience-description"
                value={draft.description}
                onChange={(event) => update("description", event.target.value)}
                rows={7}
                placeholder={copy.tasksPlaceholder}
              />
            </div>

            <section className="overflow-hidden rounded-xl border border-brand/25 bg-brand/5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand/15 px-4 py-3">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-brand" /> {copy.aiFor} {draft.position}
                </div>
                {!loadingSuggestions && !authRequired && (
                  <Button type="button" size="sm" variant="ghost" onClick={reloadSuggestions}>
                    {copy.reload}
                  </Button>
                )}
              </div>
              <div className="space-y-2 p-3">
                {loadingSuggestions && (
                  <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-brand" /> {copy.loading}
                  </div>
                )}
                {authRequired && (
                  <div className="rounded-lg bg-background p-4 text-sm">
                    <p className="mb-3 text-muted-foreground">{copy.signInText}</p>
                    <Button asChild size="sm">
                      <Link to="/auth" onClick={rememberAndSignIn}>
                        {copy.signIn}
                      </Link>
                    </Button>
                  </div>
                )}
                {error && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background p-3 text-sm text-destructive">
                    <span>{error}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        void loadSuggestions();
                      }}
                    >
                      {copy.retry}
                    </Button>
                  </div>
                )}
                {!loadingSuggestions &&
                  !authRequired &&
                  suggestions.map((suggestion) => {
                    const active = selected.includes(suggestion);
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => toggleSuggestion(suggestion)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-sm transition",
                          dir === "rtl" ? "text-right" : "text-left",
                          active
                            ? "border-brand bg-brand/10"
                            : "border-transparent bg-background hover:border-brand/40",
                        )}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? "border-brand bg-brand text-white" : "border-muted-foreground/50"}`}
                        >
                          {active ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span>{suggestion}</span>
                      </button>
                    );
                  })}
              </div>
            </section>

            <Button
              type="button"
              variant="outline"
              className="w-full border-brand/30"
              disabled={!draft.description.trim() || finalizing || authRequired}
              onClick={() => void finalizeWithAi()}
            >
              {finalizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 text-brand" />
              )}
              {copy.finalize}
            </Button>
          </div>
        )}

        <DialogFooter className="border-t border-border px-6 py-4">
          {stage === "description" && (
            <Button type="button" variant="ghost" onClick={() => setStage("overview")}>
              <BackIcon className="me-2 h-4 w-4" /> {copy.back}
            </Button>
          )}
          {stage === "overview" ? (
            <Button type="button" onClick={continueToDescription}>
              {copy.next} <NextIcon className="ms-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" disabled={!draft.position.trim()} onClick={save}>
              {copy.save}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
