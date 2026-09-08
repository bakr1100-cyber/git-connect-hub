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
  /** Visual style – "amber" matches the Amber resume template. */
  style?: "classic" | "amber";
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

const letterHeading: Record<Locale, string> = {
  de: "Anschreiben",
  en: "Cover letter",
  fr: "Lettre de motivation",
  ar: "خطاب التغطية",
  es: "Carta de presentación",
  it: "Lettera di presentazione",
  nl: "Motivatiebrief",
};

const contactHeading: Record<Locale, string> = {
  de: "Kontakt",
  en: "Contacts",
  fr: "Contacts",
  ar: "جهات الاتصال",
  es: "Contacto",
  it: "Contatti",
  nl: "Contact",
};

const recipientHeading: Record<Locale, string> = {
  de: "An",
  en: "To",
  fr: "À",
  ar: "إلى",
  es: "Para",
  it: "A",
  nl: "Aan",
};

export function formatLetterDate(doc: CoverLetterDocument) {
  const city = doc.applicant.location ? `${doc.applicant.location}, ` : "";
  return `${city}${new Date().toLocaleDateString(dateLocales[doc.language], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`;
}

export function subjectLine(doc: CoverLetterDocument) {
  return `${subjectPrefix[doc.language]} ${doc.position || "—"}`;
}

function AmberLetter({ doc, className }: { doc: CoverLetterDocument; className?: string }) {
  const rtl = isRtl(doc.language);
  const accent = "#f2a03d";
  const name = doc.applicant.fullName || "—";
  const parts = name.trim().split(" ");
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  const contacts = [
    doc.applicant.phone && { value: doc.applicant.phone, label: "Phone" },
    doc.applicant.email && { value: doc.applicant.email, label: "Email" },
    doc.applicant.location && { value: doc.applicant.location, label: "Address" },
  ].filter(Boolean) as { value: string; label: string }[];

  const recipientRows = [doc.recipient, doc.company, doc.companyAddress].filter(Boolean);

  return (
    <div
      id="cover-letter-preview-container"
      dir={rtl ? "rtl" : "ltr"}
      className={cn("relative flex min-h-[297mm] w-full overflow-hidden bg-white shadow-sm", className)}
      style={{ aspectRatio: "210 / 297", color: "#334155" } as CSSProperties}
    >
      {/* Left column */}
      <div className="w-[62mm] shrink-0 border-e border-slate-300 px-[8mm] py-[13mm]">
        {contacts.length > 0 && (
          <section>
            <h2
              className="text-end text-[10.5pt] font-semibold uppercase tracking-[0.16em]"
              style={{ color: accent }}
            >
              {contactHeading[doc.language]}
            </h2>
            <div className="mt-[1mm] h-[0.6mm] w-full bg-slate-800" />
            <ul className="mt-[3mm] space-y-[1.5mm] text-end text-[8pt]">
              {contacts.map((row, i) => (
                <li key={i} className="break-words">
                  <span className="text-slate-500">{row.value}</span>
                  <span className="text-slate-400"> : </span>
                  <span className="font-semibold text-slate-800">{row.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recipientRows.length > 0 && (
          <section className="mt-[12mm]">
            <p className="text-end text-[9pt] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>
              {recipientHeading[doc.language]}
            </p>
            <div className="mt-[2mm] space-y-[1mm] text-end text-[8.5pt]">
              {recipientRows.map((row, i) => (
                <p key={i} className={i === 0 ? "font-semibold text-slate-800" : "text-slate-500"}>
                  {row}
                </p>
              ))}
            </div>
          </section>
        )}

        <p className="mt-[10mm] text-end text-[8pt] text-slate-400">{formatLetterDate(doc)}</p>
      </div>

      {/* Right column */}
      <div className="min-w-0 flex-1 px-[10mm] py-[13mm]">
        <header className="border-b border-slate-300 pb-[6mm]">
          <h1 className="truncate text-[26pt] font-extrabold leading-none tracking-tight text-slate-900">
            {firstName} <span style={{ color: accent }}>{lastName}</span>
          </h1>
          {doc.position && <p className="mt-[2mm] truncate text-[11pt] text-slate-500">{doc.position}</p>}
        </header>

        <section className="mt-[7mm]">
          <h2 className="text-[11.5pt] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>
            {letterHeading[doc.language]}
          </h2>
          <div className="mt-[1mm] h-[0.6mm] w-full bg-slate-800" />
          <p className="mt-[4mm] text-[9.5pt] font-semibold text-slate-800">{subjectLine(doc)}</p>
          <div className="mt-[4mm] whitespace-pre-line text-justify text-[9.5pt] leading-relaxed text-slate-600">
            {doc.body}
          </div>
        </section>
      </div>
    </div>
  );
}

export function CoverLetterPreview({ doc, className }: { doc: CoverLetterDocument; className?: string }) {
  const rtl = isRtl(doc.language);

  if (doc.style === "amber") return <AmberLetter doc={doc} className={className ?? ""} />;



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
        {subjectLine(doc)}
      </p>

      <div className="mt-6 whitespace-pre-line">{doc.body}</div>
    </div>
  );
}
