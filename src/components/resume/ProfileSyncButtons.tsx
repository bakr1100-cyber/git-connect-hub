import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import type { ResumeData } from "@/lib/resume-types";
import {
  applyProfileToResume,
  emptyProfile,
  loadApplicantProfile,
  profileFromResume,
  saveApplicantProfile,
} from "@/lib/applicant-profile";
import { PROFILE_APPLY_KEY } from "@/components/profile/ApplicantProfileForm";

const copy = {
  de: {
    apply: "Aus Profil übernehmen",
    save: "Ins Profil speichern",
    applied: "Profildaten übernommen.",
    savedOk: "Profil aktualisiert.",
    empty: "Noch kein Bewerberprofil vorhanden.",
    needAuth: "Melde dich an, um dein Bewerberprofil zu nutzen.",
    failed: "Aktion fehlgeschlagen.",
  },
  en: {
    apply: "Fill from profile",
    save: "Save to profile",
    applied: "Profile data applied.",
    savedOk: "Profile updated.",
    empty: "No applicant profile yet.",
    needAuth: "Sign in to use your applicant profile.",
    failed: "Action failed.",
  },
  es: {
    apply: "Rellenar desde el perfil",
    save: "Guardar en el perfil",
    applied: "Datos del perfil aplicados.",
    savedOk: "Perfil actualizado.",
    empty: "Todavía no hay perfil del candidato.",
    needAuth: "Inicia sesión para usar tu perfil.",
    failed: "La acción ha fallado.",
  },
} as const;

export function ProfileSyncButtons({
  data,
  onChange,
}: {
  data: ResumeData;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}) {
  const { locale } = useI18n();
  const c = copy[locale === "es" ? "es" : locale === "de" ? "de" : "en"];
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const applyProfile = async (silent = false) => {
    if (!user) {
      if (!silent) toast.error(c.needAuth);
      return;
    }
    setBusy(true);
    try {
      const profile = await loadApplicantProfile();
      if (!profile) {
        if (!silent) toast.info(c.empty);
        return;
      }
      onChange((prev) => applyProfileToResume(profile, prev));
      toast.success(c.applied);
    } catch {
      if (!silent) toast.error(c.failed);
    } finally {
      setBusy(false);
    }
  };

  // Kommt der Nutzer von der Profilseite ("Im Lebenslauf verwenden"), direkt übernehmen.
  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    if (window.sessionStorage.getItem(PROFILE_APPLY_KEY) !== "1") return;
    window.sessionStorage.removeItem(PROFILE_APPLY_KEY);
    void applyProfile(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saveToProfile = async () => {
    if (!user) {
      toast.error(c.needAuth);
      return;
    }
    setBusy(true);
    try {
      const existing = (await loadApplicantProfile()) ?? { ...emptyProfile, email: user.email ?? "" };
      await saveApplicantProfile(user.id, profileFromResume(existing, data));
      toast.success(c.savedOk);
    } catch {
      toast.error(c.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void applyProfile()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundCog className="h-4 w-4" />}
        <span className="ml-1.5">{c.apply}</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void saveToProfile()}>
        <Download className="h-4 w-4" />
        <span className="ml-1.5">{c.save}</span>
      </Button>
    </div>
  );
}
