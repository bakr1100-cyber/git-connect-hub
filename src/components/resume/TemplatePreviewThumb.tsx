import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import type { ResumeData, TemplateId } from "@/lib/resume-types";
import { getAccent, resolveAccentId } from "@/lib/resume-accents";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { EuropeanTemplate } from "./templates/EuropeanTemplate";
import { TokyoTemplate } from "./templates/TokyoTemplate";
import { AzurTemplate } from "./templates/AzurTemplate";
import { EsmeraldaTemplate } from "./templates/EsmeraldaTemplate";
import { MarinaTemplate } from "./templates/MarinaTemplate";
import { MilanoTemplate } from "./templates/MilanoTemplate";
import { SofiaTemplate } from "./templates/SofiaTemplate";
import { AmberTemplate } from "./templates/AmberTemplate";
import { VeronaTemplate } from "./templates/VeronaTemplate";
import samplePhoto from "@/assets/sample-cv-photo.jpg";

/** 210mm at 96dpi – the same page width the live preview renders. */
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

const templateComponents: Record<TemplateId, ComponentType<{ data: ResumeData }>> = {
  minimalist: MinimalistTemplate,
  modern: ModernTemplate,
  european: EuropeanTemplate,
  tokyo: TokyoTemplate,
  azur: AzurTemplate,
  esmeralda: EsmeraldaTemplate,
  marina: MarinaTemplate,
  milano: MilanoTemplate,
  sofia: SofiaTemplate,
  amber: AmberTemplate,
  verona: VeronaTemplate,
};

/** Realistic sample CV so every gallery card shows the true end result. */
function buildSampleData(template: TemplateId, accent: string): ResumeData {
  return {
    personalDetails: {
      fullName: "Anna Schneider",
      dateOfBirth: "1992-04-18",
      email: "anna.schneider@example.de",
      phone: "+49 170 1234567",
      location: "Berlin",
      linkedin: "linkedin.com/in/annaschneider",
      website: "",
      photo: samplePhoto,
      summary:
        "Marketing-Managerin mit acht Jahren Erfahrung in Kampagnen-Strategie und Teamführung. Ich verbinde datenbasierte Analyse mit kreativen Ideen und habe zuletzt ein Team von sechs Personen geleitet.",
    },
    workExperience: [
      {
        id: "w1",
        position: "Senior Marketing-Managerin",
        company: "Nordwind GmbH",
        location: "Berlin",
        startDate: "2021-03-01",
        endDate: "",
        description:
          "Leitung von sechs Mitarbeitenden, Budgetverantwortung über 1,2 Mio. €. Steigerung der Online-Reichweite um 45 % innerhalb eines Jahres.",
      },
      {
        id: "w2",
        position: "Marketing-Managerin",
        company: "Lumen Digital AG",
        location: "Hamburg",
        startDate: "2017-06-01",
        endDate: "2021-02-01",
        description:
          "Planung und Umsetzung internationaler Kampagnen, Einführung eines neuen CRM-Systems.",
      },
    ],
    education: [
      {
        id: "e1",
        degree: "M.A. Betriebswirtschaftslehre",
        institution: "Humboldt-Universität zu Berlin",
        location: "Berlin",
        startDate: "2012-10-01",
        endDate: "2017-03-01",
        description: "Schwerpunkt Marketing & Kommunikation, Abschluss mit Auszeichnung.",
      },
    ],
    skills: [
      { id: "s1", name: "Kampagnen-Strategie", level: "expert" },
      { id: "s2", name: "Teamführung", level: "expert" },
      { id: "s3", name: "SEO / SEA", level: "advanced" },
      { id: "s4", name: "Datenanalyse", level: "advanced" },
      { id: "s5", name: "Content-Marketing", level: "advanced" },
    ],
    languages: [
      { id: "l1", name: "Deutsch", level: "Muttersprache" },
      { id: "l2", name: "Englisch", level: "Fließend" },
      { id: "l3", name: "Französisch", level: "Grundkenntnisse" },
    ],
    settings: {
      language: "de",
      template,
      accent,
      fontStyle: "modern",
      fontScale: 0.9,
      lineSpacing: 1.35,
    },
    extraSections: [],
  };
}

export function TemplatePreviewThumb({ template, accent }: { template: TemplateId; accent?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.27);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => {
      if (frame.clientWidth > 0) setScale(frame.clientWidth / PAGE_WIDTH);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const accentId = resolveAccentId(template, accent);
  const resolved = getAccent(accentId);
  const Template = templateComponents[template] ?? ModernTemplate;
  const data = buildSampleData(template, accentId);

  return (
    <div ref={frameRef} className="relative h-full w-full overflow-hidden bg-white">
      <div
        dir="ltr"
        aria-hidden="true"
        className="resume-preview-page pointer-events-none absolute left-0 top-0 origin-top-left overflow-hidden bg-white p-[20mm]"
        style={
          {
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            transform: `scale(${scale})`,
            "--resume-accent": resolved.color,
            "--resume-accent-soft": resolved.soft,
            "--resume-accent-wash": resolved.wash,
            fontFamily: "system-ui, sans-serif",
            fontSize: "90%",
            lineHeight: 1.35,
          } as CSSProperties
        }
      >
        <Template data={data} />
      </div>
    </div>
  );
}
