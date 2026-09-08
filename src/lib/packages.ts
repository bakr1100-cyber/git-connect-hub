/** Package catalogue — shared by the client hook and the server functions. */
export type Tier = "standard" | "premium" | "unlimited6" | "unlimited12";

export const TIERS: Tier[] = ["standard", "premium", "unlimited6", "unlimited12"];

export interface PackageInfo {
  tier: Tier;
  price: string;
  amountCents: number;
  currency: "EUR";
  days: number;
  /** Price identifier in the payment provider. */
  priceId: string;
  /** Translation keys for name and description. */
  nameKey: string;
  descKey: string;
}

export const PACKAGES: Record<Tier, PackageInfo> = {
  standard: {
    tier: "standard",
    price: "9,90 €",
    amountCents: 990,
    currency: "EUR",
    days: 30,
    priceId: "cv_standard_onetime",
    nameKey: "pricing.standard.name",
    descKey: "pricing.standard.desc",
  },
  premium: {
    tier: "premium",
    price: "14,90 €",
    amountCents: 1490,
    currency: "EUR",
    days: 30,
    priceId: "cv_premium_onetime",
    nameKey: "pricing.premium.name",
    descKey: "pricing.premium.desc",
  },
  unlimited6: {
    tier: "unlimited6",
    price: "29,90 €",
    amountCents: 2990,
    currency: "EUR",
    days: 180,
    priceId: "cv_unlimited6_onetime",
    nameKey: "pricing.unlimited6.name",
    descKey: "pricing.unlimited6.desc",
  },
  unlimited12: {
    tier: "unlimited12",
    price: "44,90 €",
    amountCents: 4490,
    currency: "EUR",
    days: 365,
    priceId: "cv_unlimited12_onetime",
    nameKey: "pricing.unlimited12.name",
    descKey: "pricing.unlimited12.desc",
  },
};

/** True for every package that includes the premium features. */
export function isPremiumTier(tier: Tier): boolean {
  return tier !== "standard";
}

export const STANDARD_PRICE = PACKAGES.standard.price;
export const PREMIUM_PRICE = PACKAGES.premium.price;
