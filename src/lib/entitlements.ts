import { useCallback, useEffect, useState } from "react";

export const STANDARD_KEY = "resume-unlocked-v1";
export const PREMIUM_KEY = "resume-premium-v1";

export const STANDARD_PRICE = "9,99 €";
export const PREMIUM_PRICE = "15,00 €";

export interface Entitlements {
  standard: boolean;
  premium: boolean;
}

const EVENT = "resume-entitlements-changed";

function read(): Entitlements {
  if (typeof window === "undefined") return { standard: false, premium: false };
  const premium = window.localStorage.getItem(PREMIUM_KEY) === "true";
  return {
    premium,
    standard: premium || window.localStorage.getItem(STANDARD_KEY) === "true",
  };
}

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<Entitlements>({ standard: false, premium: false });

  useEffect(() => {
    const sync = () => setEntitlements(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const unlock = useCallback((tier: "standard" | "premium") => {
    window.localStorage.setItem(tier === "premium" ? PREMIUM_KEY : STANDARD_KEY, "true");
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { ...entitlements, unlock };
}
