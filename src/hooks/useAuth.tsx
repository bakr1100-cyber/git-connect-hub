import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (cancelled) return;
      // Never downgrade a known session on transient events; only trust
      // explicit SIGNED_OUT to clear it. Everything else either carries a
      // session or is ignored so a hiccup can't log the user out visually.
      if (nextSession) {
        setSession(nextSession);
        setUser(nextSession.user);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
      if (event === "SIGNED_IN" && nextSession?.user) {
        void import("@/lib/email-triggers").then((m) => m.maybeSendWelcomeEmail(nextSession.user));
        if (typeof window !== "undefined") {
          const target = window.sessionStorage.getItem("auth-redirect-path");
          if (target) {
            window.sessionStorage.removeItem("auth-redirect-path");
            if (window.location.pathname !== target.split("?")[0]) {
              window.location.href = target;
            }
          }
        }
      }
    });

    const hydrate = async (attempt = 0): Promise<void> => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) throw error;
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        } else {
          // Only trust "no session" from storage, not a failed fetch.
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      } catch {
        // Transient failure (offline, broker timeout): retry briefly instead
        // of flashing the logged-out state.
        if (!cancelled && attempt < 3) {
          setTimeout(() => void hydrate(attempt + 1), 500 * (attempt + 1));
        } else if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void hydrate();

    // Re-validate (and let auto-refresh run) whenever the tab comes back,
    // so a long-idle tab never shows a stale logged-out state.
    const onVisible = () => {
      if (document.visibilityState === "visible") void hydrate();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, loading, isAuthenticated: !!session, signOut };
}

export async function signInWithGoogle(redirectPath = "/editor") {
  try {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("auth-redirect-path", redirectPath);
    }
    const { lovable } = await import("@/integrations/lovable/index");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return { error: result.error as { message: string } };
    if (!result.redirected && typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
    return { error: null };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : "Google sign-in failed" } };
  }
}


export async function signUpWithEmail(email: string, password: string, redirectPath = "/editor") {
  return supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}${redirectPath}` },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}
