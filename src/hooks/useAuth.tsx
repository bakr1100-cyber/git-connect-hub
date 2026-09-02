import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
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
  const redirectTo = `${window.location.origin}${redirectPath}`;
  return supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
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
