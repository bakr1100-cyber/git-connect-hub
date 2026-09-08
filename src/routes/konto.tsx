import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock, Download, RefreshCw, Sparkles, XCircle } from "lucide-react";
import { PageTopBar } from "@/components/layout/PageTopBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { listMyPurchases, type StoredPurchase } from "@/lib/purchases.functions";
import { getAiUsage } from "@/lib/resume-ai.functions";
import { PACKAGES } from "@/lib/packages";
import { downloadInvoice } from "@/lib/invoice";

export const Route = createFileRoute("/konto")({
  head: () => ({
    meta: [
      { title: "Konto-Dashboard: Käufe & Zugriff — myCVonline.com" },
      {
        name: "description",
        content:
          "Tagesaktuelle Übersicht über deine Käufe, Belegstatus, verbleibende Zugriffsdauer und dein KI-Kontingent.",
      },
      { property: "og:title", content: "Konto-Dashboard: Käufe & Zugriff — myCVonline.com" },
      {
        property: "og:description",
        content: "Alle Käufe, Belege und die Restlaufzeit deines Zugriffs auf einen Blick.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountDashboard,
});

const TIER_NAMES: Record<string, string> = {
  standard: "Einzel-Export",
  premium: "Premium",
  unlimited6: "Unlimited 6 Monate",
  unlimited12: "Unlimited 12 Monate",
};

function money(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} ${currency === "EUR" ? "€" : currency}`;
}

function daysLeft(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function StatusPill({ purchase }: { purchase: StoredPurchase }) {
  const expired = purchase.status === "active" && daysLeft(purchase.expiresAt) <= 0;
  if (purchase.status === "active" && !expired)
    return (
      <Badge className="gap-1">
        <CheckCircle2 className="h-3.5 w-3.5" /> Bezahlt
      </Badge>
    );
  if (expired) return <Badge variant="secondary">Abgelaufen</Badge>;
  if (purchase.status === "pending")
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3.5 w-3.5" /> Offen
      </Badge>
    );
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3.5 w-3.5" /> Fehlgeschlagen
    </Badge>
  );
}

function AccountDashboard() {
  const { user, loading } = useAuth();
  const loadPurchases = useServerFn(listMyPurchases);
  const loadUsage = useServerFn(getAiUsage);

  const purchases = useQuery({
    queryKey: ["my-purchases"],
    queryFn: () => loadPurchases() as Promise<StoredPurchase[]>,
    enabled: !!user,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const usage = useQuery({
    queryKey: ["ai-usage"],
    queryFn: () => loadUsage() as Promise<{ used: number; limit: number; remaining: number }>,
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const rows = purchases.data ?? [];
  const active = rows.find((p) => p.status === "active" && daysLeft(p.expiresAt) > 0) ?? null;
  const spent = rows.filter((p) => p.status === "active").reduce((s, p) => s + p.amountCents, 0);

  return (
    <div className="min-h-screen bg-background">
      <PageTopBar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mein Konto</h1>
            <p className="text-sm text-muted-foreground">
              Käufe, Belege und Zugriffsdauer – automatisch aktualisiert.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void purchases.refetch();
              void usage.refetch();
            }}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Aktualisieren
          </Button>
        </div>

        {!user && !loading ? (
          <div className="mt-8 rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              Melde dich an, um deine Käufe und deinen Zugriff zu sehen.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/auth">Anmelden</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Aktueller Zugriff</p>
                <p className="mt-1 text-lg font-semibold">
                  {active ? TIER_NAMES[active.tier] : "Kein aktives Paket"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {active
                    ? `Noch ${daysLeft(active.expiresAt)} Tage · bis ${new Date(active.expiresAt).toLocaleDateString("de-DE")}`
                    : "Erstellen bleibt kostenlos – bezahlt wird erst beim Download."}
                </p>
              </div>

              <div className="rounded-lg border p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">KI-Vorschläge heute</p>
                <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {usage.data ? `${usage.data.remaining} übrig` : "–"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {usage.data ? `${usage.data.used} von ${usage.data.limit} genutzt` : "Wird geladen …"}
                </p>
              </div>

              <div className="rounded-lg border p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Bezahlt gesamt</p>
                <p className="mt-1 text-lg font-semibold">{money(spent, "EUR")}</p>
                <p className="text-sm text-muted-foreground">Einmalzahlungen – kein Abo</p>
              </div>
            </div>

            <section className="mt-8 rounded-lg border p-5">
              <h2 className="text-sm font-medium">Käufe und Belege</h2>

              {purchases.isLoading ? (
                <p className="mt-3 text-sm text-muted-foreground">Wird geladen …</p>
              ) : rows.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Noch keine Käufe vorhanden.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {rows.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {p.invoiceNo} · {money(p.amountCents, p.currency)} · {TIER_NAMES[p.tier]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Gekauft am {new Date(p.purchasedAt).toLocaleDateString("de-DE")} ·{" "}
                          {p.status === "active"
                            ? daysLeft(p.expiresAt) > 0
                              ? `Zugriff bis ${new Date(p.expiresAt).toLocaleDateString("de-DE")} (${daysLeft(p.expiresAt)} Tage)`
                              : `Abgelaufen am ${new Date(p.expiresAt).toLocaleDateString("de-DE")}`
                            : `Laufzeit ${PACKAGES[p.tier].days} Tage ab Zahlung`}
                          {p.emailSent ? " · Beleg per E-Mail gesendet" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill purchase={p} />
                        {p.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              downloadInvoice({
                                id: p.invoiceNo,
                                tier: p.tier,
                                amountCents: p.amountCents,
                                currency: "EUR",
                                purchasedAt: new Date(p.purchasedAt).getTime(),
                                expiresAt: new Date(p.expiresAt).getTime(),
                                emailSent: p.emailSent,
                              })
                            }
                          >
                            <Download className="mr-1.5 h-4 w-4" />
                            Beleg
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
