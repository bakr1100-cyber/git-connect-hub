import { useCallback } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { startPackageCheckout } from "@/lib/payments.functions";
import type { Tier } from "@/lib/packages";

interface Props {
  tier: Tier;
  returnUrl: string;
  onError: (message: string) => void;
}

/** Inline payment form of the payment provider. */
export function StripeEmbeddedCheckout({ tier, returnUrl, onError }: Props) {
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const result = await startPackageCheckout({
      data: { tier, returnUrl, environment: getStripeEnvironment() },
    });
    if ("error" in result) {
      onError(result.error);
      throw new Error(result.error);
    }
    if (!result.clientSecret) {
      onError("No client secret returned");
      throw new Error("No client secret returned");
    }
    return result.clientSecret;
  }, [tier, returnUrl, onError]);

  return (
    <div id="checkout" className="max-h-[70vh] overflow-y-auto">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
