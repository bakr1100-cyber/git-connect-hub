import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, FileText, Image as ImageIcon, Download, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PACKAGES, useEntitlements, type Tier } from "@/lib/entitlements";
import { CheckoutDialog } from "@/components/pricing/CheckoutDialog";
import { PaymentStatusCard } from "@/components/pricing/PaymentStatusCard";
import { ResumeEditor } from "@/components/resume/ResumeEditor";
import { PDFExportButton } from "@/components/resume/PDFExportButton";
import { defaultResumeData, type ResumeData } from "@/lib/resume-types";

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

const DRAFT_KEY = "resume-draft-v1";

/** Reads the resume draft the embedded editor keeps in local storage. */
function useDraft(active: boolean): ResumeData {
  const [draft, setDraft] = useState<ResumeData>(defaultResumeData);
  useEffect(() => {
    if (!active) return;
    const read = () => {
      try {
        const raw = window.localStorage.getItem(DRAFT_KEY);
        if (raw) setDraft({ ...defaultResumeData, ...(JSON.parse(raw) as ResumeData) });
      } catch {
        /* ignore malformed drafts */
      }
    };
    read();
    const id = window.setInterval(read, 1500);
    return () => window.clearInterval(id);
  }, [active]);
  return draft;
}

function PackagePage() {
  const { t } = useI18n();
  const { standard, premium, purchase } = useEntitlements();
  const [checkoutTier, setCheckoutTier] = useState<Tier | null>(null);
  const [step, setStep] = useState(0);
  const paid = (standard || premium) && purchase?.status !== "pending";
  const draft = useDraft(step === 2);

  useEffect(() => {
    if (paid && step === 0) setStep(1);
  }, [paid]); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = [t("flow.step1"), t("flow.step2"), t("flow.step3")];

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
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("flow.title")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("flow.subtitle")}</p>

          <ol className="mx-auto mt-8 flex max-w-2xl items-center justify-between gap-2">
            {steps.map((label, index) => {
              const done = index < step;
              const current = index === step;
              const locked = index > 0 && !paid;
              return (
                <li key={label} className="flex flex-1 flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => setStep(index)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${
                      current
                        ? "border-primary bg-primary text-primary-foreground"
                        : done
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground"
                    } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {locked ? <Lock className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : index + 1}
                  </button>
                  <span className={`text-xs ${current ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          {paid && purchase && (
            <p className="mt-6 text-sm font-medium text-primary">
              {t("flow.paid")} · {t("pkg.activeUntil")} {new Date(purchase.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </section>

      {step === 0 && (
        <>
          <section className="mx-auto max-w-5xl px-4 pt-10">
            <PaymentStatusCard />
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

            <p className="mt-8 text-center text-xs text-muted-foreground">
              {paid ? t("pkg.faq") : t("flow.locked")}
            </p>

            {paid && (
              <div className="mt-6 text-center">
                <Button size="lg" onClick={() => setStep(1)}>
                  {t("flow.continue")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </section>
        </>
      )}

      {step > 0 && (
        <section className="mx-auto w-full max-w-[1400px] px-2 py-6 sm:px-4">
          {step === 2 && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle>{t("flow.downloadTitle")}</CardTitle>
                <CardDescription>{t("flow.downloadDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="max-w-sm">
                <PDFExportButton data={draft} label={t("ws.download")} />
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("flow.back")}
            </Button>
            {step === 1 && (
              <Button onClick={() => setStep(2)}>
                {t("flow.toDownload")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border">
            <ResumeEditor />
          </div>
        </section>
      )}

      <CheckoutDialog
        tier={checkoutTier}
        onOpenChange={(open) => !open && setCheckoutTier(null)}
        onPurchased={() => setStep(1)}
      />
    </div>
  );
}
