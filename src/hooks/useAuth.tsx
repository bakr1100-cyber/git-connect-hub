import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      if (event === "SIGNED_IN" && nextSession?.user) {
        void import("@/lib/email-triggers").then((m) => m.maybeSendWelcomeEmail(nextSession.user));
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
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
