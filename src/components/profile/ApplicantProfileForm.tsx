import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import {
  emptyProfile,
  loadApplicantProfile,
  saveApplicantProfile,
  type ApplicantProfile,
} from "@/lib/applicant-profile";

const copy = {
  de: {
    title: "Bewerberprofil",
    intro:
      "Deine Stammdaten – einmal ausfüllen, in jedem Lebenslauf und Anschreiben verwenden.",
    person: "Person",
    contact: "Kontakt",
    address: "Adresse",
    application: "Bewerbung",
    firstName: "Vorname",
    lastName: "Nachname",
    dob: "Geburtsdatum",
    nationality: "Staatsangehörigkeit",
    email: "E-Mail",
    phone: "Telefon",
    street: "Straße und Hausnummer",
    postalCode: "PLZ",
    city: "Ort",
    country: "Land",
    linkedin: "LinkedIn",
    website: "Website",
    summary: "Kurzprofil",
    targetPosition: "Wunschposition",
    salary: "Gehaltsvorstellung",
    start: "Frühester Starttermin",
    license: "Führerschein",
    relocate: "Umzugsbereit",
    permit: "Arbeitserlaubnis",
    save: "Profil speichern",
    saved: "Profil gespeichert.",
    toEditor: "Im Lebenslauf verwenden",
    signIn: "Bitte melde dich an, um dein Profil zu speichern.",
    signInCta: "Anmelden",
  },
  en: {
    title: "Applicant profile",
    intro: "Your master data – fill in once, reuse in every resume and cover letter.",
    person: "Person",
    contact: "Contact",
    address: "Address",
    application: "Application",
    firstName: "First name",
    lastName: "Last name",
    dob: "Date of birth",
    nationality: "Nationality",
    email: "Email",
    phone: "Phone",
    street: "Street and number",
    postalCode: "Postal code",
    city: "City",
    country: "Country",
    linkedin: "LinkedIn",
    website: "Website",
    summary: "Summary",
    targetPosition: "Target position",
    salary: "Salary expectation",
    start: "Earliest start date",
    license: "Driving licence",
    relocate: "Willing to relocate",
    permit: "Work permit",
    save: "Save profile",
    saved: "Profile saved.",
    toEditor: "Use in resume",
    signIn: "Please sign in to save your profile.",
    signInCta: "Sign in",
  },
  es: {
    title: "Perfil del candidato",
    intro: "Tus datos base: rellénalos una vez y úsalos en cada CV y carta.",
    person: "Persona",
    contact: "Contacto",
    address: "Dirección",
    application: "Candidatura",
    firstName: "Nombre",
    lastName: "Apellidos",
    dob: "Fecha de nacimiento",
    nationality: "Nacionalidad",
    email: "Correo electrónico",
    phone: "Teléfono",
    street: "Calle y número",
    postalCode: "Código postal",
    city: "Ciudad",
    country: "País",
    linkedin: "LinkedIn",
    website: "Sitio web",
    summary: "Resumen",
    targetPosition: "Puesto deseado",
    salary: "Expectativa salarial",
    start: "Fecha de incorporación",
    license: "Carné de conducir",
    relocate: "Disponible para mudarse",
    permit: "Permiso de trabajo",
    save: "Guardar perfil",
    saved: "Perfil guardado.",
    toEditor: "Usar en el CV",
    signIn: "Inicia sesión para guardar tu perfil.",
    signInCta: "Iniciar sesión",
  },
} as const;

export const PROFILE_APPLY_KEY = "resume-apply-profile";

export function ApplicantProfileForm() {
  const { locale } = useI18n();
  const c = copy[locale === "es" ? "es" : locale === "de" ? "de" : "en"];
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApplicantProfile>(emptyProfile);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setFetching(false);
      return;
    }
    void loadApplicantProfile()
      .then((data) => {
        if (data) setProfile(data);
        else setProfile((p) => ({ ...p, email: user.email ?? p.email }));
      })
      .catch(() => toast.error("Profil konnte nicht geladen werden."))
      .finally(() => setFetching(false));
  }, [user, loading]);

  const set = <K extends keyof ApplicantProfile>(key: K, value: ApplicantProfile[K]) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await saveApplicantProfile(user.id, profile);
      toast.success(c.saved);
    } catch {
      toast.error("Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const handleUseInResume = async () => {
    if (user) await handleSave();
    window.sessionStorage.setItem(PROFILE_APPLY_KEY, "1");
    void navigate({ to: "/editor" });
  };

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">{c.title}</h1>
        <p className="mt-3 text-muted-foreground">{c.signIn}</p>
        <Button asChild className="mt-6">
          <Link to="/auth">{c.signInCta}</Link>
        </Button>
      </div>
    );
  }

  const field = (
    id: keyof ApplicantProfile,
    label: string,
    type: "text" | "date" | "email" = "text",
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={(profile[id] as string | null) ?? ""}
        onChange={(e) => set(id, e.target.value as never)}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{c.title}</h1>
        <p className="mt-2 text-muted-foreground">{c.intro}</p>
      </header>

      {fetching ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> …
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{c.person}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {field("first_name", c.firstName)}
              {field("last_name", c.lastName)}
              {field("date_of_birth", c.dob, "date")}
              {field("nationality", c.nationality)}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="summary">{c.summary}</Label>
                <Textarea
                  id="summary"
                  rows={4}
                  value={profile.summary}
                  onChange={(e) => set("summary", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{c.contact}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {field("email", c.email, "email")}
              {field("phone", c.phone)}
              {field("linkedin", c.linkedin)}
              {field("website", c.website)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{c.address}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{field("street", c.street)}</div>
              {field("postal_code", c.postalCode)}
              {field("city", c.city)}
              {field("country", c.country)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{c.application}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {field("target_position", c.targetPosition)}
              {field("salary_expectation", c.salary)}
              {field("earliest_start_date", c.start, "date")}
              {field("drivers_license", c.license)}
              {field("work_permit", c.permit)}
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="relocate"
                  checked={profile.willing_to_relocate}
                  onCheckedChange={(v) => set("willing_to_relocate", v)}
                />
                <Label htmlFor="relocate">{c.relocate}</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="ml-2">{c.save}</span>
            </Button>
            <Button variant="outline" onClick={handleUseInResume} disabled={busy}>
              <FileText className="h-4 w-4" />
              <span className="ml-2">{c.toEditor}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
