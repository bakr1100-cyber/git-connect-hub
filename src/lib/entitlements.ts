import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  createPurchase as createPurchaseFn,
  confirmPurchase as confirmPurchaseFn,
  failPurchase as failPurchaseFn,
  listMyPurchases,
  type StoredPurchase,
} from "@/lib/purchases.functions";

export const STANDARD_KEY = "resume-unlocked-v1";
export const PREMIUM_KEY = "resume-premium-v1";
/** Purchase record: which package was bought and when access ends. */
export const PURCHASE_KEY = "resume-purchase-v1";
/** Belege/Rechnungen der bestätigten Käufe. */
export const RECEIPTS_KEY = "resume-receipts-v1";

export { PACKAGES, PREMIUM_PRICE, STANDARD_PRICE } from "@/lib/packages";
export type { PackageInfo, Tier } from "@/lib/packages";
import { PACKAGES, type Tier } from "@/lib/packages";


/** Zahlungsstatus eines Kaufs. Erst "active" schaltet Funktionen frei. */
export type PurchaseStatus = "pending" | "active" | "failed";

export interface Purchase {
  id: string;
  tier: Tier;
  status: PurchaseStatus;
  purchasedAt: number;
  expiresAt: number;
}

export interface Receipt {
  id: string;
  tier: Tier;
  amountCents: number;
  currency: "EUR";
  purchasedAt: number;
  expiresAt: number;
  emailSent: boolean;
}

export interface Entitlements {
  standard: boolean;
  premium: boolean;
  purchase: Purchase | null;
  receipts: Receipt[];
}

const EVENT = "resume-entitlements-changed";
const EMPTY: Entitlements = { standard: false, premium: false, purchase: null, receipts: [] };

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

export function readReceipts(): Receipt[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECEIPTS_KEY) ?? "[]") as Receipt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function read(): Entitlements {
  if (typeof window === "undefined") return EMPTY;
  const purchase = readPurchase();
  const confirmed = purchase?.status === "active" ? purchase : null;
  const premium = confirmed?.tier === "premium" || window.localStorage.getItem(PREMIUM_KEY) === "true";
  const standard =
    premium || confirmed?.tier === "standard" || window.localStorage.getItem(STANDARD_KEY) === "true";
  return { premium, standard, purchase, receipts: readReceipts() };
}

function emit() {
  window.dispatchEvent(new Event(EVENT));
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

  /** Legt einen Kauf im Status "pending" an — schaltet noch nichts frei. */
  const startPurchase = useCallback((tier: Tier): Purchase => {
    const info = PACKAGES[tier];
    const purchase: Purchase = {
      id: `INV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`,
      tier,
      status: "pending",
      purchasedAt: Date.now(),
      expiresAt: Date.now() + info.days * 24 * 60 * 60 * 1000,
    };
    window.localStorage.setItem(PURCHASE_KEY, JSON.stringify(purchase));
    emit();
    return purchase;
  }, []);

  /** Bestätigt die Zahlung: erst jetzt sind PDF-Download und KI-Foto frei. */
  const confirmPurchase = useCallback((purchase: Purchase, emailSent: boolean): Receipt => {
    const info = PACKAGES[purchase.tier];
    const active: Purchase = { ...purchase, status: "active" };
    window.localStorage.setItem(PURCHASE_KEY, JSON.stringify(active));
    window.localStorage.setItem(purchase.tier === "premium" ? PREMIUM_KEY : STANDARD_KEY, "true");
    const receipt: Receipt = {
      id: purchase.id,
      tier: purchase.tier,
      amountCents: info.amountCents,
      currency: info.currency,
      purchasedAt: purchase.purchasedAt,
      expiresAt: purchase.expiresAt,
      emailSent,
    };
    window.localStorage.setItem(RECEIPTS_KEY, JSON.stringify([receipt, ...readReceipts()].slice(0, 50)));
    emit();
    return receipt;
  }, []);

  const failPurchase = useCallback((purchase: Purchase) => {
    window.localStorage.setItem(PURCHASE_KEY, JSON.stringify({ ...purchase, status: "failed" }));
    emit();
  }, []);

  /** Direktfreischaltung (z. B. Support) — legt sofort einen aktiven Kauf an. */
  const unlock = useCallback(
    (tier: Tier) => {
      const purchase = startPurchase(tier);
      confirmPurchase(purchase, false);
    },
    [startPurchase, confirmPurchase],
  );

  return { ...entitlements, unlock, startPurchase, confirmPurchase, failPurchase };
}
