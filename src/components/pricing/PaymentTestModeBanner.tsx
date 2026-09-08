const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"] as string | undefined;

/** Shows whether the checkout currently runs in test mode. */
export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
        Die Bezahlung ist für diese Version noch nicht freigeschaltet.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full rounded-md border border-amber-300 bg-amber-100 px-3 py-2 text-center text-xs text-amber-900">
        Testmodus: Es wird kein echtes Geld abgebucht. Testkarte 4242 4242 4242 4242.
      </div>
    );
  }
  return null;
}
