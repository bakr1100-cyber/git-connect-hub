import { supabase } from "@/integrations/supabase/client";

/**
 * Returns true when a Supabase session exists. Used to avoid calling
 * auth-protected AI server functions while signed out (which would throw
 * an unhandled "Unauthorized" server error).
 */
export async function hasAiSession(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session?.access_token);
  } catch {
    return false;
  }
}
