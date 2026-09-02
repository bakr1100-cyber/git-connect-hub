import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function resolveRecipient(context: { supabase: any; userId?: string }) {
  const { data } = await context.supabase.auth.getUser();
  const user = data?.user;
  return {
    email: user?.email as string | undefined,
    name: (user?.user_metadata?.full_name as string | undefined) ?? undefined,
    userId: user?.id as string | undefined,
  };
}

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { sendTemplateEmail } = await import("./email-templates/send-email");
    const { email, name, userId } = await resolveRecipient(context);
    if (!email) return { sent: false as const, reason: "no_email" as const };
    return sendTemplateEmail("welcome", email, {
      templateData: { name },
      idempotencyKey: `welcome-${userId}`,
    });
  });

export const sendUnfinishedDocumentReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { sendTemplateEmail } = await import("./email-templates/send-email");
    const { email, name, userId } = await resolveRecipient(context);
    if (!email) return { sent: false as const, reason: "no_email" as const };
    const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return sendTemplateEmail("unfinished-document", email, {
      templateData: { name },
      idempotencyKey: `unfinished-doc-${userId}-${week}`,
    });
  });
