import { createFileRoute } from "@tanstack/react-router";
import { MyTemplates } from "@/components/templates/MyTemplates";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Meine Vorlagen — myCVonline.com" },
      {
        name: "description",
        content:
          "Lade eigene Lebenslauf-Vorlagen als Bild oder PDF hoch, verwalte sie privat und wähle sie als Referenz für deinen Lebenslauf.",
      },
      { property: "og:title", content: "Meine Vorlagen — myCVonline.com" },
      {
        property: "og:description",
        content: "Eigene Lebenslauf-Vorlagen hochladen, privat verwalten und als Referenz auswählen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <MyTemplates />
    </div>
  );
}
