import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AdminPackage {
  tier: string;
  name: string;
  amountCents: number;
  currency: string;
  days: number;
  priceId: string;
  sortOrder: number;
  isActive: boolean;
  isPopular: boolean;
}

export interface AdminPurchase {
  id: string;
  userId: string;
  email: string | null;
  invoiceNo: string;
  tier: string;
  status: string;
  amountCents: number;
  currency: string;
  purchasedAt: string;
  expiresAt: string;
  emailSent: boolean;
}

export interface AdminUser {
  userId: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  tier: string | null;
  expiresAt: string | null;
  aiCalls: number;
  aiLimit: number;
}

export interface AdminStats {
  revenueCents: number;
  purchaseCount: number;
  activeUsers: number;
  totalUsers: number;
  perTier: { tier: string; count: number; revenueCents: number }[];
}

/** Throws unless the caller holds the admin role. */
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return data === true;
  });

/* ---------------------------------------------------------------- packages */

const packageSchema = z.object({
  tier: z.string().min(1),
  name: z.string().min(1),
  amountCents: z.number().int().min(0),
  currency: z.string().min(1).default("EUR"),
  days: z.number().int().min(1),
  priceId: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
});

function mapPackage(row: Record<string, any>): AdminPackage {
  return {
    tier: row["tier"],
    name: row["name"],
    amountCents: row["amount_cents"],
    currency: row["currency"],
    days: row["days"],
    priceId: row["price_id"],
    sortOrder: row["sort_order"],
    isActive: row["is_active"],
    isPopular: row["is_popular"],
  };
}

export const adminListPackages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminPackage[]> => {
    await assertAdmin(context as any);
    const db = await admin();
    const { data, error } = await db.from("packages").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapPackage);
  });

export const adminSavePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => packageSchema.parse(d))
  .handler(async ({ context, data }): Promise<AdminPackage> => {
    await assertAdmin(context as any);
    const db = await admin();
    const { data: row, error } = await db
      .from("packages")
      .upsert(
        {
          tier: data.tier,
          name: data.name,
          amount_cents: data.amountCents,
          currency: data.currency,
          days: data.days,
          price_id: data.priceId,
          sort_order: data.sortOrder,
          is_active: data.isActive,
          is_popular: data.isPopular,
        },
        { onConflict: "tier" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapPackage(row as Record<string, any>);
  });

export const adminDeletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tier: z.string().min(1) }).parse(d))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    await assertAdmin(context as any);
    const db = await admin();
    const { error } = await db.from("packages").delete().eq("tier", data.tier);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------------------------------------- purchases */

export const adminListPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminPurchase[]> => {
    await assertAdmin(context as any);
    const db = await admin();
    const { data, error } = await db
      .from("purchases")
      .select("*")
      .order("purchased_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const emails = await emailMap(db, (data ?? []).map((r: any) => r.user_id));
    return (data ?? []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      email: emails.get(row.user_id) ?? null,
      invoiceNo: row.invoice_no,
      tier: row.tier,
      status: row.status,
      amountCents: row.amount_cents,
      currency: row.currency,
      purchasedAt: row.purchased_at,
      expiresAt: row.expires_at,
      emailSent: row.email_sent,
    }));
  });

export const adminUpdatePurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "active", "failed"]).optional(),
        invoiceNo: z.string().min(1).optional(),
        amountCents: z.number().int().min(0).optional(),
        expiresAt: z.string().min(1).optional(),
        emailSent: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    await assertAdmin(context as any);
    const db = await admin();
    const patch: Record<string, any> = {};
    if (data.status !== undefined) patch["status"] = data.status;
    if (data.invoiceNo !== undefined) patch["invoice_no"] = data.invoiceNo;
    if (data.amountCents !== undefined) patch["amount_cents"] = data.amountCents;
    if (data.expiresAt !== undefined) patch["expires_at"] = new Date(data.expiresAt).toISOString();
    if (data.emailSent !== undefined) patch["email_sent"] = data.emailSent;
    const { error } = await db.from("purchases").update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------------------------------------- users */

async function emailMap(db: any, ids: string[]) {
  const map = new Map<string, string>();
  const unique = [...new Set(ids)];
  if (unique.length === 0) return map;
  const { data } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  for (const u of data?.users ?? []) {
    if (u.email) map.set(u.id, u.email);
  }
  return map;
}

const TIER_LIMITS: Record<string, number> = {
  unlimited12: 200,
  unlimited6: 150,
  premium: 60,
  standard: 20,
  free: 3,
};

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUser[]> => {
    await assertAdmin(context as any);
    const db = await admin();
    const { data: list, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw new Error(error.message);
    const { data: ents } = await db.from("user_entitlements").select("*");
    const { data: usage } = await db.from("ai_usage").select("*");
    const entMap = new Map((ents ?? []).map((e: any) => [e.user_id, e]));
    const today = new Date().toISOString().slice(0, 10);
    const usageMap = new Map(
      (usage ?? []).filter((u: any) => u.usage_date === today).map((u: any) => [u.user_id, u]),
    );
    return (list?.users ?? []).map((u: any) => {
      const ent: any = entMap.get(u.id);
      const tier = ent?.tier ?? "free";
      return {
        userId: u.id,
        email: u.email ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        tier,
        expiresAt: ent?.expires_at ?? null,
        aiCalls: (usageMap.get(u.id) as any)?.calls ?? 0,
        aiLimit: TIER_LIMITS[tier] ?? 3,
      };
    });
  });

export const adminSetEntitlement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        userId: z.string().uuid(),
        tier: z.string().min(1),
        days: z.number().int().min(0).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    await assertAdmin(context as any);
    const db = await admin();
    const expires =
      data.tier === "free"
        ? null
        : new Date(Date.now() + (data.days ?? 30) * 86_400_000).toISOString();
    const { error } = await db
      .from("user_entitlements")
      .upsert(
        { user_id: data.userId, tier: data.tier, expires_at: expires, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminResetAiUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    await assertAdmin(context as any);
    const db = await admin();
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await db
      .from("ai_usage")
      .update({ calls: 0, cost_units: 0, updated_at: new Date().toISOString() })
      .eq("user_id", data.userId)
      .eq("usage_date", today);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------------------------------------------- stats */

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminStats> => {
    await assertAdmin(context as any);
    const db = await admin();
    const { data: purchases } = await db.from("purchases").select("tier, status, amount_cents");
    const paid = (purchases ?? []).filter((p: any) => p.status === "active");
    const perTier = new Map<string, { count: number; revenueCents: number }>();
    for (const p of paid) {
      const cur = perTier.get(p.tier) ?? { count: 0, revenueCents: 0 };
      cur.count += 1;
      cur.revenueCents += p.amount_cents;
      perTier.set(p.tier, cur);
    }
    const { data: ents } = await db.from("user_entitlements").select("expires_at");
    const now = Date.now();
    const activeUsers = (ents ?? []).filter(
      (e: any) => !e.expires_at || new Date(e.expires_at).getTime() > now,
    ).length;
    const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    return {
      revenueCents: paid.reduce((s: number, p: any) => s + p.amount_cents, 0),
      purchaseCount: paid.length,
      activeUsers,
      totalUsers: list?.users?.length ?? 0,
      perTier: [...perTier.entries()].map(([tier, v]) => ({ tier, ...v })),
    };
  });
