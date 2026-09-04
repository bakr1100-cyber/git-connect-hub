import type { ResumeData } from "@/lib/resume-types";
import type { TranslationKey } from "@/lib/i18n";
import { templateTranslate } from "@/lib/i18n/templates";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

const PAPER = "#f7f0f3";

export function MilanoTemplate({ data }: TemplateProps) {
  const { personalDetails, workExperience, education, skills, languages, settings } = data;
  const lang = settings.language;
  const tr = (key: TranslationKey) => templateTranslate(settings.template, lang, key);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(dateLocales[lang], { month: "short", year: "numeric" });
  };

  const contacts = [
    personalDetails.phone && { icon: Phone, value: personalDetails.phone },
    personalDetails.email && { icon: Mail, value: personalDetails.email },
    personalDetails.location && { icon: MapPin, value: personalDetails.location },
    personalDetails.linkedin && { icon: Linkedin, value: personalDetails.linkedin },
    personalDetails.website && { icon: Globe, value: personalDetails.website },
  ].filter(Boolean) as { icon: typeof Phone; value: string }[];

  const extraSections = (data.extraSections ?? []).filter((s) => s.title.trim() || s.content.trim());

  const nameParts = (personalDetails.fullName || tr("resume.yourName")).trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const heading =
    "mb-2 text-[10.5pt] font-bold uppercase tracking-[0.16em] text-[var(--resume-accent)]";
  const subHeading = "text-[9.5pt] font-bold uppercase tracking-wide text-slate-800";

  return (
    <div
      className="-m-[20mm] flex h-[297mm] min-h-0 flex-col overflow-hidden px-[14mm] py-[13mm] font-sans text-[10pt] text-slate-700 [print-color-adjust:exact]"
      style={{ backgroundColor: PAPER }}
    >
      {/* Header */}
      <header className="flex min-w-0 items-start gap-[8mm] border-b border-slate-300 pb-[7mm]">
        <div className="min-w-0 flex-1">
          <h1 className="min-w-0 break-words leading-[0.95]">
            <span className="block text-[26pt] font-light uppercase tracking-[0.22em] text-slate-600">
              {firstName}
            </span>
            {lastName && (
              <span className="mt-1 block text-[30pt] font-black uppercase tracking-tight text-[var(--resume-accent)]">
                {lastName}
              </span>
            )}
          </h1>
          {settings.targetPosition && (
            <p className="mt-2 flex min-w-0 items-center gap-3 text-[11pt] text-slate-600">
              <span className="break-words">{settings.targetPosition}</span>
              <span className="h-px flex-1 bg-slate-400" aria-hidden />
            </p>
          )}
        </div>

        {personalDetails.photo && (
          <div className="relative shrink-0 p-[2.5mm]">
            <span
              className="absolute inset-0 border-2"
              style={{ borderColor: "var(--resume-accent)" }}
              aria-hidden
            />
            <img
              src={personalDetails.photo}
              alt=""
              className="h-[38mm] w-[32mm] object-cover grayscale"
            />
            <span
              className="absolute inset-x-[2.5mm] bottom-[2.5mm] block truncate px-2 py-[1mm] text-center text-[8pt] uppercase tracking-[0.2em] text-white [print-color-adjust:exact]"
              style={{ backgroundColor: "var(--resume-accent)" }}
            >
              {firstName}
            </span>
          </div>
        )}
      </header>

      <div className="mt-[7mm] grid min-h-0 flex-1 grid-cols-[1fr_58mm] gap-[8mm]">
        {/* Main column */}
        <div className="min-w-0 space-y-[6mm] overflow-hidden">
          {personalDetails.summary && (
            <section className="min-w-0">
              <h2 className={heading}>{tr("resume.profile")}</h2>
              <p className="whitespace-pre-wrap break-words text-justify text-[9.5pt] leading-[1.55]">
                {personalDetails.summary}
              </p>
            </section>
          )}

          {workExperience.length > 0 && (
            <section className="min-w-0">
              <h2 className={heading}>{tr("resume.experience")}</h2>
              <div className="space-y-[4mm]">
                {workExperience.map((item) => (
                  <div key={item.id} className="min-w-0">
                    <div className="flex min-w-0 items-baseline justify-between gap-3">
                      <h3 className={`${subHeading} min-w-0 break-words`}>{item.position}</h3>
                      <span className="shrink-0 whitespace-nowrap text-[8.5pt] text-slate-500">
                        {formatDate(item.startDate)}
                        {(item.endDate || item.startDate) &&
                          ` – ${item.endDate ? formatDate(item.endDate) : tr("resume.present")}`}
                      </span>
                    </div>
                    <p className="break-words text-[9pt] font-medium text-slate-600">
                      {item.company}
                      {item.location && `, ${item.location}`}
                    </p>
                    {item.description && (
                      <p className="mt-1 whitespace-pre-wrap break-words text-justify text-[9pt] leading-[1.5] text-slate-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="min-w-0">
              <h2 className={heading}>{tr("resume.education")}</h2>
              <div className="space-y-[3mm]">
                {education.map((item) => (
                  <div key={item.id} className="min-w-0">
                    <div className="flex min-w-0 items-baseline justify-between gap-3">
                      <h3 className={`${subHeading} min-w-0 break-words`}>{item.degree}</h3>
                      <span className="shrink-0 whitespace-nowrap text-[8.5pt] text-slate-500">
                        {formatDate(item.startDate)}
                        {item.endDate && ` – ${formatDate(item.endDate)}`}
                      </span>
                    </div>
                    <p className="break-words text-[9pt] text-slate-600">
                      {item.institution}
                      {item.location && `, ${item.location}`}
                    </p>
                    {item.description && (
                      <p className="mt-1 whitespace-pre-wrap break-words text-[9pt] leading-[1.5] text-slate-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right rail */}
        <aside className="min-w-0 space-y-[6mm] border-s border-slate-300 ps-[7mm]">
          {contacts.length > 0 && (
            <section className="min-w-0">
              <h2 className={heading}>{tr("resume.contact")}</h2>
              <ul className="space-y-2">
                {contacts.map(({ icon: Icon, value }, i) => (
                  <li key={i} className="flex min-w-0 items-start gap-2 text-[8.5pt] text-slate-600">
                    <span
                      className="mt-[0.5mm] grid h-[4.5mm] w-[4.5mm] shrink-0 place-items-center rounded-full text-white [print-color-adjust:exact]"
                      style={{ backgroundColor: "var(--resume-accent)" }}
                    >
                      <Icon className="h-2.5 w-2.5" />
                    </span>
                    <span className="break-all">{value}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skills.length > 0 && (
            <section className="min-w-0">
              <h2 className={heading}>{tr("resume.skills")}</h2>
              <ul className="space-y-1.5">
                {skills.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <p className="break-words text-[9pt] font-semibold uppercase tracking-wide text-slate-800">
                      {item.name}
                    </p>
                    {item.level && <p className="text-[8.5pt] text-slate-500">{item.level}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section className="min-w-0">
              <h2 className={heading}>{tr("resume.languages")}</h2>
              <ul className="space-y-1 text-[8.5pt] text-slate-600">
                {languages.map((item) => (
                  <li key={item.id} className="break-words">
                    <span className="font-semibold uppercase text-slate-800">{item.name}</span>
                    {item.level ? ` — ${item.level}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {extraSections.map((section) => (
            <section key={section.id} className="min-w-0">
              <h2 className={heading}>{section.title}</h2>
              <p className="whitespace-pre-wrap break-words text-[8.5pt] leading-[1.5] text-slate-600">
                {section.content}
              </p>
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}
