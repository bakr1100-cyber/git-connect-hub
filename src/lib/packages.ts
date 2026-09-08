/** Package catalogue — shared by the client hook and the server functions. */
export type Tier = "standard" | "premium";

export interface PackageInfo {
  tier: Tier;
  price: string;
  amountCents: number;
  currency: "EUR";
  days: number;
  /** Price identifier in the payment provider. */
  priceId: string;
}

export const PACKAGES: Record<Tier, PackageInfo> = {
  standard: {
    tier: "standard",
    price: "9,90 €",
    amountCents: 990,
    currency: "EUR",
    days: 5,
    priceId: "cv_standard_onetime",
  },
  premium: {
    tier: "premium",
    price: "19,90 €",
    amountCents: 1990,
    currency: "EUR",
    days: 30,
    priceId: "cv_premium_onetime",
  },
};

export const STANDARD_PRICE = PACKAGES.standard.price;
export const PREMIUM_PRICE = PACKAGES.premium.price;
