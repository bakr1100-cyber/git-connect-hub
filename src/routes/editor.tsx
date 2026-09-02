import { createFileRoute } from "@tanstack/react-router";
import { ResumeEditor } from "@/components/resume/ResumeEditor";

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Lebenslauf erstellen — myCVonline.com" },
      { name: "description", content: "Erstelle deinen professionellen Lebenslauf mit Live-Vorschau und PDF-Export." },
      { property: "og:title", content: "Lebenslauf erstellen — myCVonline.com" },
      { property: "og:description", content: "Erstelle deinen professionellen Lebenslauf mit Live-Vorschau und PDF-Export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  return (
    <div className="min-h-screen bg-background">
      <ResumeEditor />
    </div>
  );
}
