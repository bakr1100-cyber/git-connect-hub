import { useCallback, useEffect, useState } from "react";

export const STANDARD_KEY = "resume-unlocked-v1";
export const PREMIUM_KEY = "resume-premium-v1";
/** Purchase record: which package was bought and when access ends. */
export const PURCHASE_KEY = "resume-purchase-v1";

export type Tier = "standard" | "premium";

export interface PackageInfo {
  tier: Tier;
  price: string;
  amountCents: number;
  currency: "EUR";
  days: number;
}

export const PACKAGES: Record<Tier, PackageInfo> = {
  standard: { tier: "standard", price: "9,90 €", amountCents: 990, currency: "EUR", days: 5 },
  premium: { tier: "premium", price: "19,90 €", amountCents: 1990, currency: "EUR", days: 30 },
};

export const STANDARD_PRICE = PACKAGES.standard.price;
export const PREMIUM_PRICE = PACKAGES.premium.price;

export interface Purchase {
  tier: Tier;
  purchasedAt: number;
  expiresAt: number;
}

export interface Entitlements {
  standard: boolean;
  premium: boolean;
  purchase: Purchase | null;
}

const EVENT = "resume-entitlements-changed";
const EMPTY: Entitlements = { standard: false, premium: false, purchase: null };

function readPurchase(): Purchase | null {
  const raw = window.localStorage.getItem(PURCHASE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Purchase;
    if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function read(): Entitlements {
  if (typeof window === "undefined") return EMPTY;
  const purchase = readPurchase();
  const premium = purchase?.tier === "premium" || window.localStorage.getItem(PREMIUM_KEY) === "true";
  const standard =
    premium || purchase?.tier === "standard" || window.localStorage.getItem(STANDARD_KEY) === "true";
  return { premium, standard, purchase };
}

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<Entitlements>(EMPTY);

  useEffect(() => {
    const sync = () => setEntitlements(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    const timer = window.setInterval(sync, 60_000);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
      window.clearInterval(timer);
    };
  }, []);

  const unlock = useCallback((tier: Tier) => {
    const info = PACKAGES[tier];
    const purchase: Purchase = {
      tier,
      purchasedAt: Date.now(),
      expiresAt: Date.now() + info.days * 24 * 60 * 60 * 1000,
    };
    window.localStorage.setItem(PURCHASE_KEY, JSON.stringify(purchase));
    window.localStorage.setItem(tier === "premium" ? PREMIUM_KEY : STANDARD_KEY, "true");
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { ...entitlements, unlock };
}
