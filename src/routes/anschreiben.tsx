import { createFileRoute } from "@tanstack/react-router";
import { CoverLetterGenerator } from "@/components/cover/CoverLetterGenerator";

export const Route = createFileRoute("/anschreiben")({
  head: () => ({
    meta: [
      { title: "Anschreiben-Generator — myCVonline.com" },
      {
        name: "description",
        content:
          "Erstelle dein Anschreiben passend zur Stelle: KI-Vorschläge, eigene Sprache, Bearbeitung als Word und Download als PDF.",
      },
      { property: "og:title", content: "Anschreiben-Generator — myCVonline.com" },
      {
        property: "og:description",
        content: "Passgenaues Anschreiben mit KI-Vorschlägen, Word-Bearbeitung und PDF-Download.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoverLetterPage,
});

function CoverLetterPage() {
  return (
    <div className="min-h-screen bg-background">
      <CoverLetterGenerator />
    </div>
  );
}
