import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PACKAGES, type Tier } from "@/lib/entitlements";

const tierSchema = z.object({ tier: z.enum(["standard", "premium"]) });
const idSchema = z.object({ id: z.string().uuid(), emailSent: z.boolean().optional() });

export interface StoredPurchase {
  id: string;
  invoiceNo: string;
  tier: Tier;
  status: "pending" | "active" | "failed";
  amountCents: number;
  currency: string;
  purchasedAt: string;
  expiresAt: string;
  emailSent: boolean;
}

function map(row: Record<string, any>): StoredPurchase {
  return {
    id: row["id"],
    invoiceNo: row["invoice_no"],
    tier: row["tier"],
    status: row["status"],
    amountCents: row["amount_cents"],
    currency: row["currency"],
    purchasedAt: row["purchased_at"],
    expiresAt: row["expires_at"],
    emailSent: row["email_sent"],
  };
}


/** All purchases of the signed-in user, newest first. */
export const listMyPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StoredPurchase[]> => {
    const { data, error } = await context.supabase
      .from("purchases")
      .select("*")
      .order("purchased_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map(map);
  });

/** Creates a pending purchase tied to the account. Unlocks nothing yet. */
export const createPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => tierSchema.parse(d))
  .handler(async ({ context, data }): Promise<StoredPurchase> => {
    const info = PACKAGES[data.tier];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const expires = new Date(Date.now() + info.days * 24 * 60 * 60 * 1000).toISOString();
    const { data: row, error } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: context.userId,
        invoice_no: `INV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`,
        tier: data.tier,
        status: "pending",
        amount_cents: info.amountCents,
        currency: info.currency,
        expires_at: expires,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return map(row);
  });

/** Marks a pending purchase of the signed-in user as paid. */
export const confirmPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idSchema.parse(d))
  .handler(async ({ context, data }): Promise<StoredPurchase> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("purchases")
      .update({ status: "active", email_sent: data.emailSent ?? false })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .eq("status", "pending")
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return map(row);
  });

/** Marks a pending purchase as failed. */
export const failPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("purchases")
      .update({ status: "failed" })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .eq("status", "pending");
    return { ok: true };
  });
