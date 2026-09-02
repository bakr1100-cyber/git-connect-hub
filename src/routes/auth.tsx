import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { FileText } from "lucide-react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { finishAuthReturn, readAuthReturnPath } from "@/lib/auth-return";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Anmelden — myCVonline.com" },
      {
        name: "description",
        content:
          "Melde dich an oder registriere dich, um deinen Lebenslauf zu speichern, weiter zu bearbeiten und als PDF herunterzuladen.",
      },
      { property: "og:title", content: "Anmelden — myCVonline.com" },
      {
        property: "og:description",
        content: "Konto erstellen, Lebenslauf speichern und als PDF herunterladen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { isAuthenticated, loading } = useAuth();
  const returnPath = readAuthReturnPath();

  useEffect(() => {
    if (!loading && isAuthenticated) finishAuthReturn();
  }, [isAuthenticated, loading]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b border-white/10 bg-navy px-4 py-3">
        <Link to="/" className="mx-auto flex max-w-7xl items-center gap-2 text-lg font-bold text-primary-foreground">
          <FileText className="h-5 w-5 text-brand" />
          {t("brand.name")}
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <AuthPanel redirectPath={returnPath} onAuthenticated={finishAuthReturn} />
        </div>
      </main>
    </div>
  );
}
