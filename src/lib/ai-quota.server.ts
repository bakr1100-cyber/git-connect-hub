import type { SupabaseClient } from "@supabase/supabase-js";

/** Estimated cost units per AI action (rough proxy for token/credit usage). */
export const aiCostUnits = {
  optimize: 0.5,
  translate: 0.5,
  coverLetter: 1.5,
  transcribe: 1,
  parseResume: 1.5,
} as const;

export type AiAction = keyof typeof aiCostUnits;

export interface QuotaResult {
  allowed: boolean;
  reason?: "unauthenticated" | "limit_reached" | "too_fast";
  tier?: string;
  used?: number;
  limit?: number;
  remaining?: number;
}

/** Temporary product-development switch. Set to false before the public launch. */
export const AI_QUOTA_BYPASS_DURING_BUILD = true;

export function developmentAiQuota(): QuotaResult {
  return { allowed: true, tier: "development", used: 0, limit: 999_999, remaining: 999_999 };
}

export class AiQuotaError extends Error {
  readonly reason: NonNullable<QuotaResult["reason"]>;
  readonly quota: QuotaResult;

  constructor(quota: QuotaResult) {
    super(
      quota.reason === "too_fast"
        ? "AI_RATE_LIMIT"
        : quota.reason === "unauthenticated"
          ? "AI_AUTH_REQUIRED"
          : "AI_DAILY_LIMIT",
    );
    this.name = "AiQuotaError";
    this.reason = quota.reason ?? "limit_reached";
    this.quota = quota;
  }
}

/**
 * Consumes one AI call from the signed-in user's daily quota.
 * Throws AiQuotaError when the burst or daily limit is reached.
 */
export async function consumeAiQuota(
  supabase: SupabaseClient<any, "public", any>,
  action: AiAction,
): Promise<QuotaResult> {
  if (AI_QUOTA_BYPASS_DURING_BUILD) return developmentAiQuota();

  const { data, error } = await supabase.rpc("consume_ai_quota", {
    _cost: aiCostUnits[action],
  });

  if (error) throw new Error(`Quota check failed: ${error.message}`);

  const quota = (data ?? {}) as QuotaResult;
  if (!quota.allowed) throw new AiQuotaError(quota);
  return quota;
}
