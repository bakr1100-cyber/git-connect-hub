import type { CSSProperties } from "react";
import { isRtl, dateLocales, type Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

export interface CoverLetterDocument {
  applicant: { fullName: string; email: string; phone: string; location: string };
  company: string;
  recipient: string;
  companyAddress: string;
  position: string;
  body: string;
  language: Locale;
}

const subjectPrefix: Record<Locale, string> = {
  de: "Bewerbung als",
  en: "Application for",
  fr: "Candidature au poste de",
  ar: "طلب توظيف لوظيفة",
  es: "Candidatura para",
  it: "Candidatura come",
  nl: "Sollicitatie als",
};

export function formatLetterDate(doc: CoverLetterDocument) {
  const city = doc.applicant.location ? `${doc.applicant.location}, ` : "";
  return `${city}${new Date().toLocaleDateString(dateLocales[doc.language], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`;
}

export function CoverLetterPreview({ doc, className }: { doc: CoverLetterDocument; className?: string }) {
  const rtl = isRtl(doc.language);

  return (
    <div
      id="cover-letter-preview-container"
      dir={rtl ? "rtl" : "ltr"}
      className={cn(
        "relative min-h-[297mm] w-full overflow-hidden p-[20mm] text-[11pt] leading-relaxed shadow-sm",
        className
      )}
      style={
        {
          aspectRatio: "210 / 297",
          fontFamily: "Georgia, 'Times New Roman', serif",
          backgroundColor: "#ffffff",
          color: "#2b2b2b",
        } as CSSProperties
      }
    >
      <div className="pb-4" style={{ borderBottom: "1px solid #d4d4d4" }}>
        <p className="text-[15pt] font-semibold tracking-tight" style={{ color: "#111111" }}>
          {doc.applicant.fullName || "—"}
        </p>
        <p className="mt-1 text-[9.5pt]" style={{ color: "#6b6b6b" }}>
          {[doc.applicant.location, doc.applicant.email, doc.applicant.phone].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="mt-10 whitespace-pre-line text-[10.5pt]" style={{ color: "#3d3d3d" }}>
        {[doc.company, doc.recipient, doc.companyAddress].filter(Boolean).join("\n")}
      </div>

      <p className="mt-10 text-[9.5pt]" style={{ color: "#6b6b6b" }}>{formatLetterDate(doc)}</p>

      <p className="mt-8 font-semibold" style={{ color: "#111111" }}>
        {subjectPrefix[doc.language]} {doc.position || "—"}
      </p>

      <div className="mt-6 whitespace-pre-line">{doc.body}</div>
    </div>
  );
}
