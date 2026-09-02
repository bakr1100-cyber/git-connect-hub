import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Button } from "@/components/ui/button";
import { decodeResumeShare, readSharePalette, readSharePayload } from "@/lib/resume-share";
import { accentPresets, resolveAccentId } from "@/lib/resume-accents";
import type { ResumeData } from "@/lib/resume-types";
import { useI18n } from "@/lib/i18n";
import { Eye, FileText } from "lucide-react";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Geteilte Lebenslauf-Vorschau — myCVonline.com" },
      {
        name: "description",
        content: "Read-only Vorschau eines mit myCVonline.com erstellten Lebenslaufs.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Geteilte Lebenslauf-Vorschau — myCVonline.com" },
      {
        property: "og:description",
        content: "Read-only Vorschau eines mit myCVonline.com erstellten Lebenslaufs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const { t } = useI18n();
  const [state, setState] = useState<{ status: "loading" | "ready" | "invalid"; data?: ResumeData }>({
    status: "loading",
  });

  useEffect(() => {
    const load = () => {
      const payload = readSharePayload(window.location.hash);
      const decoded = payload ? decodeResumeShare(payload) : null;
      if (!decoded) {
        setState({ status: "invalid" });
        return;
      }
      const override = readSharePalette(window.location.hash);
      const accent = accentPresets.some((preset) => preset.id === override)
        ? override!
        : resolveAccentId(decoded.settings.template, decoded.settings.accent);
      setState({
        status: "ready",
        data: { ...decoded, settings: { ...decoded.settings, accent } },
      });
    };
    load();
    window.addEventListener("hashchange", load);
    return () => window.removeEventListener("hashchange", load);
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">myCVonline.com</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              {t("share.readOnly")}
            </span>
            <Button asChild size="sm">
              <Link to="/editor">{t("share.createOwn")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {state.status === "loading" && (
          <p className="text-center text-sm text-muted-foreground">{t("share.loading")}</p>
        )}

        {state.status === "invalid" && (
          <div className="mx-auto max-w-md rounded-xl border border-border bg-background p-8 text-center">
            <h1 className="text-lg font-semibold text-foreground">{t("share.invalidTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("share.invalidDesc")}</p>
            <Button asChild className="mt-4">
              <Link to="/editor">{t("share.createOwn")}</Link>
            </Button>
          </div>
        )}

        {state.status === "ready" && state.data && (
          <div className="select-none">
            <ResumePreview data={state.data} hideCaption />
          </div>
        )}
      </main>
    </div>
  );
}
