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

/** Lets any mounted hook re-read the account's purchases immediately. */
function emit() {
  window.dispatchEvent(new Event(EVENT));
}


function toPurchase(row: StoredPurchase): Purchase {
  return {
    id: row.id,
    tier: row.tier,
    status: row.status,
    purchasedAt: new Date(row.purchasedAt).getTime(),
    expiresAt: new Date(row.expiresAt).getTime(),
  };
}

function toReceipt(row: StoredPurchase): Receipt {
  return {
    id: row.invoiceNo,
    tier: row.tier,
    amountCents: row.amountCents,
    currency: "EUR",
    purchasedAt: new Date(row.purchasedAt).getTime(),
    expiresAt: new Date(row.expiresAt).getTime(),
    emailSent: row.emailSent,
  };
}

function derive(rows: StoredPurchase[]): Entitlements {
  const now = Date.now();
  const active = rows.filter((r) => r.status === "active" && new Date(r.expiresAt).getTime() > now);
  const premium = active.some((r) => r.tier === "premium");
  const standard = premium || active.length > 0;
  const latest = rows[0] ? toPurchase(rows[0]) : null;
  return {
    premium,
    standard,
    purchase: latest,
    receipts: rows.filter((r) => r.status === "active").map(toReceipt),
  };
}

/**
 * Entitlements live in the account, not in the browser: a purchase follows the
 * user across devices and cannot be faked by editing local storage.
 */
export function useEntitlements() {
  const { isAuthenticated } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlements>(EMPTY);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setEntitlements(EMPTY);
      return;
    }
    try {
      const rows = await listMyPurchases();
      setEntitlements(derive(rows));
    } catch {
      setEntitlements(EMPTY);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener(EVENT, onChange);
    const timer = window.setInterval(onChange, 60_000);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.clearInterval(timer);
    };
  }, [refresh]);

  /** Legt einen Kauf im Status "pending" an — schaltet noch nichts frei. */
  const startPurchase = useCallback(async (tier: Tier): Promise<Purchase> => {
    const row = await createPurchaseFn({ data: { tier } });
    emit();
    return toPurchase(row);
  }, []);

  /** Bestätigt die Zahlung: erst jetzt sind PDF-Download und KI-Foto frei. */
  const confirmPurchase = useCallback(
    async (purchase: Purchase, emailSent: boolean): Promise<Receipt> => {
      const row = await confirmPurchaseFn({ data: { id: purchase.id, emailSent } });
      emit();
      return toReceipt(row);
    },
    [],
  );

  const failPurchase = useCallback(async (purchase: Purchase) => {
    await failPurchaseFn({ data: { id: purchase.id } });
    emit();
  }, []);

  /** Direktfreischaltung (z. B. Support) — legt sofort einen aktiven Kauf an. */
  const unlock = useCallback(
    async (tier: Tier) => {
      const purchase = await startPurchase(tier);
      await confirmPurchase(purchase, false);
    },
    [startPurchase, confirmPurchase],
  );

  return { ...entitlements, unlock, startPurchase, confirmPurchase, failPurchase, refresh };
}

void PACKAGES;

