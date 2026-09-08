import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { verifyPackageCheckout } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { notifyEntitlementsChanged } from "@/lib/entitlements";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

/**
 * After the payment provider sends the buyer back, confirm the session once and
 * unlock the account. Runs on every page, because the return URL is the page the
 * purchase started on.
 */
export function useCheckoutReturn() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useI18n();
  const handled = useRef(false);

  useEffect(() => {
    if (loading || !isAuthenticated || handled.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;
    handled.current = true;

    void (async () => {
      try {
        const result = await verifyPackageCheckout({
          data: { sessionId, environment: getStripeEnvironment() },
        });
        if (result.status === "paid") {
          notifyEntitlementsChanged();
          toast.success(t("checkout.success"));
        } else if (result.status === "failed") {
          toast.error(t("pay.status.failed"));
        } else {
          toast.info(t("pay.status.pending"));
        }
      } catch {
        toast.error(t("pay.status.failed"));
      } finally {
        params.delete("session_id");
        const query = params.toString();
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${query ? `?${query}` : ""}`,
        );
      }
    })();
  }, [isAuthenticated, loading, t]);
}
