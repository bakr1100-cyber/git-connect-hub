import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "@/lib/stripe.server";
import { PACKAGES, type Tier } from "@/lib/packages";

const envSchema = z.enum(["sandbox", "live"]);

const startSchema = z.object({
  tier: z.enum(["standard", "premium", "unlimited6", "unlimited12"]),
  returnUrl: z.string().url(),
  environment: envSchema,
});

const verifySchema = z.object({
  sessionId: z.string().min(1).max(200),
  environment: envSchema,
});

export type StartCheckoutResult =
  | { clientSecret: string; purchaseId: string }
  | { error: string };

export type VerifyCheckoutResult =
  | { status: "paid"; purchaseId: string; tier: Tier }
  | { status: "pending" }
  | { status: "failed"; error: string };

/** Finds or creates the buyer's customer record so purchases stay linked to the account. */
async function resolveCustomer(
  stripe: Stripe,
  options: { userId: string; email?: string | undefined },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 1,
  });
  if (found.data.length && found.data[0]) return found.data[0].id;

  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      if (customer.metadata?.["userId"] !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }

  const created = await stripe.customers.create({
    ...(options.email ? { email: options.email } : {}),
    metadata: { userId: options.userId },
  });
  return created.id;
}

/**
 * Creates a pending purchase in the account and an embedded checkout session for it.
 * Nothing is unlocked until the payment is confirmed by the provider.
 */
export const startPackageCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => startSchema.parse(d))
  .handler(async ({ data, context }): Promise<StartCheckoutResult> => {
    const info = PACKAGES[data.tier];
    try {
      const stripe = createStripeClient(data.environment as StripeEnv);
      const prices = await stripe.prices.list({ lookup_keys: [info.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice) return { error: "Price not found" };

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
        .select("id")
        .single();
      if (error || !row) return { error: error?.message ?? "Purchase could not be created" };

      const email = (context.claims as { email?: string } | undefined)?.email;
      const customerId = await resolveCustomer(stripe, { userId: context.userId, email });

      const productId =
        typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: `${data.returnUrl}${data.returnUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
        customer: customerId,
        payment_intent_data: { description: product.name },
        metadata: { userId: context.userId, purchaseId: row.id as string, tier: data.tier },
        managed_payments: { enabled: true },
      } as Stripe.Checkout.SessionCreateParams);

      return { clientSecret: session.client_secret ?? "", purchaseId: row.id as string };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Confirms a finished checkout and activates the purchase in the account. */
export const verifyPackageCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => verifySchema.parse(d))
  .handler(async ({ data, context }): Promise<VerifyCheckoutResult> => {
    try {
      const stripe = createStripeClient(data.environment as StripeEnv);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      const purchaseId = session.metadata?.["purchaseId"];
      const tier = session.metadata?.["tier"] as Tier | undefined;
      const owner = session.metadata?.["userId"];
      if (!purchaseId || !tier || owner !== context.userId) {
        return { status: "failed", error: "Unknown checkout session" };
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      if (session.payment_status === "paid") {
        await supabaseAdmin
          .from("purchases")
          .update({ status: "active" })
          .eq("id", purchaseId)
          .eq("user_id", context.userId)
          .eq("status", "pending");
        // Server-side truth for AI limits and feature gates.
        await supabaseAdmin
          .from("user_entitlements")
          .upsert({ user_id: context.userId, tier, updated_at: new Date().toISOString() });
        return { status: "paid", purchaseId, tier };
      }

      if (session.status === "expired") {
        await supabaseAdmin
          .from("purchases")
          .update({ status: "failed" })
          .eq("id", purchaseId)
          .eq("user_id", context.userId)
          .eq("status", "pending");
        return { status: "failed", error: "Checkout expired" };
      }

      return { status: "pending" };
    } catch (error) {
      return { status: "failed", error: getStripeErrorMessage(error) };
    }
  });
