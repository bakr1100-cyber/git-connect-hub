import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const receiptInput = z.object({
  orderId: z.string().min(3).max(64),
  tier: z.enum(["standard", "premium"]),
  packageName: z.string().min(1).max(60),
  price: z.string().min(1).max(20),
  days: z.number().int().positive().max(365),
  validUntil: z.string().min(1).max(40),
  date: z.string().min(1).max(40),
});

export const sendPurchaseReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => receiptInput.parse(data))
  .handler(async ({ context, data }) => {
    const { sendTemplateEmail } = await import("./email-templates/send-email");
    const { email, name } = await resolveRecipient(context);
    if (!email) return { sent: false as const, reason: "no_email" as const };
    return sendTemplateEmail("purchase-receipt", email, {
      templateData: {
        name,
        orderId: data.orderId,
        packageName: data.packageName,
        price: data.price,
        days: data.days,
        validUntil: data.validUntil,
        date: data.date,
      },
      idempotencyKey: `receipt-${data.orderId}`,
    });
  });

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
