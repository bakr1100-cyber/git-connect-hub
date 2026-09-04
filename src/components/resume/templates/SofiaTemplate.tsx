import type { ResumeData } from "@/lib/resume-types";
import type { TranslationKey } from "@/lib/i18n";
import { templateTranslate } from "@/lib/i18n/templates";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

const PAPER = "#fdfbf8";

export function SofiaTemplate({ data }: TemplateProps) {
  const { personalDetails, workExperience, education, skills, languages, settings } = data;
  const lang = settings.language;
  const tr = (key: TranslationKey) => templateTranslate(settings.template, lang, key);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(dateLocales[lang], { month: "short", year: "numeric" });
  };

  const fullName = personalDetails.fullName || tr("resume.yourName");
  const extraSections = (data.extraSections ?? []).filter((s) => s.title.trim() || s.content.trim());

  const contacts = [
    personalDetails.phone && { icon: Phone, value: personalDetails.phone },
    personalDetails.email && { icon: Mail, value: personalDetails.email },
    personalDetails.location && { icon: MapPin, value: personalDetails.location },
    personalDetails.linkedin && { icon: Linkedin, value: personalDetails.linkedin },
    personalDetails.website && { icon: Globe, value: personalDetails.website },
  ].filter(Boolean) as { icon: typeof Mail; value: string }[];

  const heading =
    "text-[10pt] font-semibold uppercase tracking-[0.18em] text-slate-800 [font-family:Georgia,'Times_New_Roman',serif]";
  const rule = "mt-[1.5mm] h-px w-full";

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-[3mm]">
      <h2 className={heading}>{children}</h2>
      <div className={rule} style={{ backgroundColor: "var(--resume-accent)", opacity: 0.55 }} />
    </div>
  );

  return (
    <div
      className="-m-[20mm] flex h-[297mm] min-h-0 flex-col overflow-hidden font-sans text-[10pt] text-slate-600 [print-color-adjust:exact]"
      style={{ backgroundColor: PAPER }}
    >
      {/* Header */}
      <header className="flex min-w-0 items-center gap-[7mm] px-[15mm] pb-[7mm] pt-[13mm]">
        {personalDetails.photo && (
          <img
            src={personalDetails.photo}
            alt=""
            className="h-[26mm] w-[26mm] shrink-0 rounded-full object-cover [print-color-adjust:exact]"
            style={{ boxShadow: "0 0 0 1mm var(--resume-accent-soft)" }}
          />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[22pt] font-light uppercase leading-tight tracking-[0.12em] text-slate-900 [font-family:Georgia,'Times_New_Roman',serif]">
            {fullName}
          </h1>
          {settings.targetPosition && (
            <p className="mt-[1.5mm] truncate text-[10.5pt] uppercase tracking-[0.22em]" style={{ color: "var(--resume-accent)" }}>
              {settings.targetPosition}
            </p>
          )}
          <div className="mt-[3mm] h-[0.8mm] w-[28mm]" style={{ backgroundColor: "var(--resume-accent)" }} />
        </div>
      </header>

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_58mm] gap-[8mm] px-[15mm] pb-[12mm]">
        {/* Main column */}
        <div className="min-w-0 space-y-[6mm]">
          {personalDetails.summary && (
            <section className="min-w-0">
              <SectionTitle>{tr("resume.profile")}</SectionTitle>
              <p className="whitespace-pre-wrap text-[9.5pt] leading-relaxed">{personalDetails.summary}</p>
            </section>
          )}

          {workExperience.length > 0 && (
            <section className="min-w-0">
              <SectionTitle>{tr("resume.experience")}</SectionTitle>
              <div className="space-y-[4mm]">
                {workExperience.map((item) => (
                  <div key={item.id} className="min-w-0">
                    <p className="truncate text-[10pt] font-semibold text-slate-800">{item.position}</p>
                    <p className="truncate text-[9pt]" style={{ color: "var(--resume-accent)" }}>
                      {[item.company, item.location].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-[8.5pt] uppercase tracking-[0.08em] text-slate-400">
                      {formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : tr("resume.present")}
                    </p>
                    {item.description && (
                      <p className="mt-[1.5mm] whitespace-pre-wrap text-[9.5pt] leading-relaxed">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="min-w-0">
              <SectionTitle>{tr("resume.education")}</SectionTitle>
              <div className="space-y-[3.5mm]">
                {education.map((item) => (
                  <div key={item.id} className="min-w-0">
                    <p className="truncate text-[10pt] font-semibold text-slate-800">{item.degree}</p>
                    <p className="truncate text-[9pt]" style={{ color: "var(--resume-accent)" }}>
                      {[item.institution, item.location].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-[8.5pt] uppercase tracking-[0.08em] text-slate-400">
                      {formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : tr("resume.present")}
                    </p>
                    {item.description && (
                      <p className="mt-[1.5mm] whitespace-pre-wrap text-[9.5pt] leading-relaxed">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {extraSections.map((section) => (
            <section key={section.id} className="min-w-0">
              <SectionTitle>{section.title}</SectionTitle>
              <p className="whitespace-pre-wrap text-[9.5pt] leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <aside
          className="min-w-0 space-y-[6mm] px-[5mm] py-[5mm] [print-color-adjust:exact]"
          style={
            contacts.length > 0 || skills.length > 0 || languages.length > 0
              ? { backgroundColor: "var(--resume-accent-soft)" }
              : undefined
          }
        >
          {contacts.length > 0 && (
            <section className="min-w-0">
              <SectionTitle>{tr("resume.contact")}</SectionTitle>
              <ul className="space-y-[2mm]">
                {contacts.map(({ icon: Icon, value }, i) => (
                  <li key={i} className="flex min-w-0 items-start gap-2 text-[8.5pt]">
                    <Icon className="mt-[0.5mm] h-3 w-3 shrink-0" style={{ color: "var(--resume-accent)" }} />
                    <span className="min-w-0 break-words">{value}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skills.length > 0 && (
            <section className="min-w-0">
              <SectionTitle>{tr("resume.skills")}</SectionTitle>
              <ul className="space-y-[1.5mm]">
                {skills.map((skill) => (
                  <li key={skill.id} className="flex min-w-0 items-center gap-2 text-[8.5pt]">
                    <span
                      className="h-[1.6mm] w-[1.6mm] shrink-0 rounded-full"
                      style={{ backgroundColor: "var(--resume-accent)" }}
                    />
                    <span className="min-w-0 truncate">
                      {skill.name}
                      {skill.level ? ` — ${skill.level}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section className="min-w-0">
              <SectionTitle>{tr("resume.languages")}</SectionTitle>
              <ul className="space-y-[1.5mm]">
                {languages.map((item) => (
                  <li key={item.id} className="min-w-0 truncate text-[8.5pt]">
                    {item.name}
                    {item.level ? ` — ${item.level}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
