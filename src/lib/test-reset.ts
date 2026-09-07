import { supabase } from "@/integrations/supabase/client";

/**
 * Testmodus: mit ?reset=1 in der URL werden alle Daten des aktuellen Tests
 * entfernt (lokaler Entwurf, gespeicherte Lebensläufe, Profil, Anmeldung),
 * damit jeder Testlauf bei null anfängt.
 */
export const RESET_PARAM = "reset";

export async function runTestReset(): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (userId) {
      await supabase.from("resumes").delete().eq("user_id", userId);
      await supabase.from("applicant_profiles").delete().eq("user_id", userId);
      await supabase.auth.signOut();
    }
  } catch {
    // Auch ohne Verbindung wird lokal aufgeräumt.
  }

  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {
    // ignorieren
  }

  const url = new URL(window.location.href);
  url.searchParams.delete(RESET_PARAM);
  window.location.replace(url.toString());
}
