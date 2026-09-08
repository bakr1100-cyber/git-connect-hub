import { supabase } from "@/integrations/supabase/client";

/**
 * Testmodus: mit ?reset=1 in der URL werden ausschließlich Browserdaten des
 * aktuellen Tests entfernt. In Supabase gespeicherte Lebensläufe, Profile,
 * Käufe und Rechnungen bleiben erhalten.
 */
export const RESET_PARAM = "reset";

export async function runTestReset(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // Auch ohne Verbindung wird der lokale Testzustand aufgeräumt.
  }

  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {
    // ignorieren
  }

  try {
    if ("caches" in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
    }
  } catch {
    // CacheStorage ist nicht in jedem Browser verfügbar.
  }

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    // Ein fehlender Service Worker darf den Reset nicht verhindern.
  }

  const url = new URL(window.location.href);
  url.searchParams.delete(RESET_PARAM);
  window.location.replace(url.toString());
}
