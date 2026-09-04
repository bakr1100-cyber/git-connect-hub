import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, AlertTriangle, Globe, Rocket, ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Bereitstellungsstatus — myCVonline.com" },
      { name: "description", content: "Aktueller Stand der Veröffentlichung: Sicherheitsprüfung, Zeitplan und offene Schritte." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StatusPage,
});

const PUBLISHED_URL = "https://connect-the-dots-gh.lovable.app";
const SCAN_DATE = "04.09.2026, 17:22 Uhr";

const warnings = [
  {
    title: "Interne Helfer-Funktion in der Datenbank",
    note: "Eine Datenbank-Funktion ist technisch für angemeldete Nutzer aufrufbar. Sie enthält keine sensiblen Daten – Risiko gering, wird bei Gelegenheit abgesichert.",
  },
  {
    title: "Nutzungszähler der KI",
    note: "Die Zähltabelle ist absichtlich schreibgeschützt für Nutzer – die Einträge werden nur serverseitig angelegt. So soll es sein.",
  },
  {
    title: "Paket-Freischaltungen",
    note: "Freischaltungen (z. B. Premium) werden bewusst nur serverseitig verwaltet, damit sie niemand selbst verändern kann. So soll es sein.",
  },
];

const steps = [
  { label: "Code geprüft und fehlerfrei", done: true },
  { label: "Sicherheitsprüfung durchgeführt – keine kritischen Befunde", done: true },
  { label: "Änderungen veröffentlicht (Live-Seite aktualisieren)", done: false },
  { label: "Frische Prüfung nach der Veröffentlichung", done: false },
];

function StatusPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <PageTopBar />
      <div className="px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
        </Link>

        <header>
          <h1 className="text-2xl font-bold text-foreground">Bereitstellungsstatus</h1>
          <p className="mt-1 text-sm text-muted-foreground">Übersicht über Sicherheit, Zeitplan und offene Schritte.</p>
        </header>

        {/* Scan */}
        <section className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h2 className="font-semibold text-foreground">Sicherheitsprüfung</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Letzter Stand: {SCAN_DATE} · <span className="font-medium text-foreground">0 kritische Befunde</span> · {warnings.length} Hinweise (unkritisch)
          </p>
          <ul className="mt-4 space-y-3">
            {warnings.map((w) => (
              <li key={w.title} className="flex gap-3 rounded-lg bg-muted/60 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-cta" />
                <div>
                  <p className="text-sm font-medium text-foreground">{w.title}</p>
                  <p className="text-xs text-muted-foreground">{w.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Live */}
        <section className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand" />
            <h2 className="font-semibold text-foreground">Live-Adresse</h2>
          </div>
          <a href={PUBLISHED_URL} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-brand underline">
            {PUBLISHED_URL}
          </a>
          <p className="mt-1 text-xs text-muted-foreground">
            Nach dem Klick auf „Veröffentlichen“ ist die Seite in etwa einer Minute aktualisiert.
          </p>
        </section>

        {/* Steps */}
        <section className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-brand" />
            <h2 className="font-semibold text-foreground">Zeitplan & offene Schritte</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${s.done ? "text-brand" : "text-muted-foreground/40"}`} />
                <span className={s.done ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
                {!s.done && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">offen</span>}
              </li>
            ))}
          </ul>
        </section>
      </div>
      </div>
    </div>
  );
}
