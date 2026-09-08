import { PageTopBar } from "@/components/layout/PageTopBar";
import { createFileRoute } from "@tanstack/react-router";
import { ApplicantProfileForm } from "@/components/profile/ApplicantProfileForm";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Bewerberprofil anlegen — myCVonline.com" },
      {
        name: "description",
        content:
          "Speichere deine Bewerberdaten einmal sicher ab und übernimm sie mit einem Klick in Lebenslauf und Anschreiben.",
      },
      { property: "og:title", content: "Bewerberprofil anlegen — myCVonline.com" },
      {
        property: "og:description",
        content: "Stammdaten einmal ausfüllen und direkt im Lebenslauf-Editor verwenden.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <PageTopBar />
      <ApplicantProfileForm />
    </div>
  );
}
