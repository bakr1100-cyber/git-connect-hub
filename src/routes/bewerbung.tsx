import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, FileText, Image as ImageIcon, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PACKAGES, useEntitlements, type Tier } from "@/lib/entitlements";
import { CheckoutDialog } from "@/components/pricing/CheckoutDialog";

export const Route = createFileRoute("/bewerbung")({
  head: () => ({
    meta: [
      { title: "Bewerbungspaket — Lebenslauf, KI-Foto & PDF | myCVonline.com" },
      {
        name: "description",
        content:
          "Ein Paket für die komplette Bewerbung: Lebenslauf-Editor, Bewerbungsfoto mit KI-Bearbeitung und PDF-Download in Druckqualität. Einmalzahlung, kein Abo.",
      },
      { property: "og:title", content: "Bewerbungspaket — Lebenslauf, KI-Foto & PDF" },
      {
        property: "og:description",
        content:
          "Lebenslauf-Editor, KI-Bewerbungsfoto und PDF-Download in einem Paket. Einmalzahlung, kein Abo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PackagePage,
});

function PackagePage() {
  const { t } = useI18n();
  const { standard, premium, purchase } = useEntitlements();
  const [checkoutTier, setCheckoutTier] = useState<Tier | null>(null);

  const includes = [
    { icon: FileText, text: t("pkg.include1") },
    { icon: ImageIcon, text: t("pkg.include2") },
    { icon: Download, text: t("pkg.include3") },
    { icon: Check, text: t("pkg.include4") },
  ];

  const tiers: Array<{ tier: Tier; name: string; desc: string; features: string[]; active: boolean }> = [
    {
      tier: "standard",
      name: t("pricing.standard.name"),
      desc: t("pricing.standard.desc"),
      features: [t("pkg.include1"), t("pkg.include2"), t("pkg.include3")],
      active: standard && !premium,
    },
    {
      tier: "premium",
      name: t("pricing.premium.name"),
      desc: t("pricing.premium.desc"),
      features: [t("pkg.include1"), t("pkg.include2"), t("pkg.include3"), t("pkg.include4")],
      active: premium,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("pkg.title")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("pkg.subtitle")}</p>
          {purchase && (
            <p className="mt-4 text-sm font-medium text-primary">
              {t("pkg.activeUntil")} {new Date(purchase.expiresAt).toLocaleDateString()}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/editor">{t("pkg.toEditor")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {includes.map(({ icon: Icon, text }) => (
            <div key={text} className="rounded-lg border p-4">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => {
            const info = PACKAGES[tier.tier];
            return (
              <Card key={tier.tier} className={tier.tier === "premium" ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{tier.name}</CardTitle>
                    {tier.active && <Badge>{t("pkg.active")}</Badge>}
                  </div>
                  <CardDescription>{tier.desc}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold">{info.price}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {info.days} {t("pkg.days")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.tier === "premium" ? "default" : "outline"}
                    onClick={() => setCheckoutTier(tier.tier)}
                  >
                    {`${t("pkg.choose")} · ${info.price}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">{t("pkg.faq")}</p>
      </section>

      <CheckoutDialog tier={checkoutTier} onOpenChange={(open) => !open && setCheckoutTier(null)} />
    </div>
  );
}
