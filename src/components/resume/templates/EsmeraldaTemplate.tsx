import type { ResumeData } from "@/lib/resume-types";
import type { TranslationKey } from "@/lib/i18n";
import { templateTranslate } from "@/lib/i18n/templates";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin, Globe, Linkedin, Calendar } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function EsmeraldaTemplate({ data }: TemplateProps) {
  const { personalDetails, workExperience, education, skills, languages, settings } = data;
  const lang = settings.language;
  const tr = (key: TranslationKey) => templateTranslate(settings.template, lang, key);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(dateLocales[lang], { month: "2-digit", year: "numeric" });
  };

  const heading =
    "mb-4 text-[19pt] font-semibold lowercase tracking-tight text-[var(--resume-accent)]";

  const contacts = [
    personalDetails.phone && { icon: Phone, value: personalDetails.phone },
    personalDetails.email && { icon: Mail, value: personalDetails.email },
    personalDetails.location && { icon: MapPin, value: personalDetails.location },
    personalDetails.dateOfBirth && { icon: Calendar, value: formatDate(personalDetails.dateOfBirth) },
    personalDetails.linkedin && { icon: Linkedin, value: personalDetails.linkedin },
    personalDetails.website && { icon: Globe, value: personalDetails.website },
  ].filter(Boolean) as { icon: typeof Phone; value: string }[];

  const extraSections = (data.extraSections ?? []).filter((s) => s.title.trim() || s.content.trim());

  const half = Math.ceil(workExperience.length / 2);
  const expColumns = [workExperience.slice(0, half), workExperience.slice(half)];

  const periodChip = (start: string, end?: string) => (
    <div className="flex min-h-[24mm] w-[7mm] shrink-0 items-center justify-center self-start rounded-full border border-[var(--resume-accent)]/40 py-2">
      <span className="whitespace-nowrap text-[6.5pt] font-semibold tracking-wide text-slate-600 [writing-mode:vertical-rl] [text-orientation:mixed]">
        {start}
        {start && " – "}
        {end || tr("resume.present")}
      </span>
    </div>
  );

  return (
    <div className="relative -m-[20mm] flex h-[297mm] min-h-0 flex-col overflow-hidden bg-[#fbf7ef] font-sans text-[11pt] leading-relaxed text-slate-700 [print-color-adjust:exact]">
      {/* Oversized watermark word */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-[6mm] -start-[7mm] select-none text-[76pt] font-light lowercase leading-none tracking-tight text-[var(--resume-accent)] opacity-[0.14] [writing-mode:vertical-rl] [text-orientation:mixed]"
      >
        resume
      </span>

      <div className="relative flex-1 py-[16mm] pe-[16mm] ps-[30mm]">
        {/* Header */}
        <header className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-7">
          {personalDetails.photo && (
            <img
              src={personalDetails.photo}
              alt=""
              className="h-[48mm] w-[38mm] shrink-0 object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-[30pt] font-semibold leading-[1.05] text-[var(--resume-accent)]">
              {personalDetails.fullName || tr("resume.yourName")}
            </h1>
            {settings.targetPosition && (
              <p className="mt-3 break-words text-[8.5pt] font-medium uppercase tracking-[0.22em] text-slate-600">
                [ {settings.targetPosition} ]
              </p>
            )}
            {personalDetails.summary && (
              <p className="mt-3 whitespace-pre-wrap text-[9pt] leading-[1.55] text-slate-600">
                {personalDetails.summary}
              </p>
            )}
          </div>
        </header>

        {/* Experience */}
        {workExperience.length > 0 && (
          <section className="mt-8 border-t border-[var(--resume-accent)]/25 pt-6">
            <h2 className={heading}>{tr("resume.experience")}.</h2>
            <div className="grid grid-cols-2 gap-8">
              {expColumns.map((column, colIndex) => (
                <div key={colIndex} className="min-w-0 space-y-5">
                  {column.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {periodChip(item.startDate, item.endDate)}
                        <div className="min-w-0 break-words">
                          <h3 className="break-words text-[9.5pt] font-bold text-slate-900">{item.position}</h3>
                          <p className="break-words text-[9pt] font-semibold text-slate-700">
                          {item.company}
                          {item.location && `, ${item.location}`}
                        </p>
                        {item.description && (
                          <ul className="mt-1.5 space-y-1 text-[8.5pt] leading-[1.5] text-slate-600">
                            {item.description
                              .split("\n")
                              .map((line) => line.replace(/^[•\-–]\s*/, "").trim())
                              .filter(Boolean)
                              .map((line, i) => (
                                <li key={i} className="flex gap-1.5">
                                  <span className="text-[var(--resume-accent)]">•</span>
                                  <span>{line}</span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education + Skills */}
        {(education.length > 0 || skills.length > 0 || languages.length > 0) && (
          <div className="mt-8 grid grid-cols-2 gap-8 border-t border-[var(--resume-accent)]/25 pt-6">
            <div className="min-w-0 space-y-5">
              {education.length > 0 && (
                <section>
                  <h2 className={heading}>{tr("resume.education")}.</h2>
                  <div className="space-y-4">
                    {education.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {periodChip(item.startDate, item.endDate)}
                        <div className="min-w-0 break-words">
                          <h3 className="break-words text-[9.5pt] font-bold text-slate-900">{item.degree}</h3>
                          <p className="break-words text-[9pt] text-slate-600">
                            {item.institution}
                            {item.location && `, ${item.location}`}
                          </p>
                          {item.description && (
                            <p className="mt-1 whitespace-pre-wrap text-[8.5pt] leading-[1.5] text-slate-600">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="min-w-0 space-y-5">
              {skills.length > 0 && (
                <section>
                  <h2 className={heading}>{tr("resume.skills")}.</h2>
                  <ul className="space-y-1 break-words text-[8.5pt] leading-[1.5] text-slate-600">
                    {skills.map((item) => (
                      <li key={item.id} className="flex gap-1.5">
                        <span className="text-[var(--resume-accent)]">•</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {languages.length > 0 && (
                <section>
                  <h2 className={heading}>{tr("resume.languages")}.</h2>
                  <ul className="space-y-1 break-words text-[8.5pt] leading-[1.5] text-slate-600">
                    {languages.map((item) => (
                      <li key={item.id} className="flex gap-1.5">
                        <span className="text-[var(--resume-accent)]">•</span>
                        <span>
                          {item.name}
                          {item.level ? ` (${item.level})` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        )}

        {extraSections.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-8 border-t border-[var(--resume-accent)]/25 pt-6">
            {extraSections.map((section) => (
              <section key={section.id} className="min-w-0 break-words">
                <h2 className={`${heading} break-words`}>{section.title}</h2>
                <p className="whitespace-pre-wrap break-words text-[8.5pt] leading-[1.5] text-slate-600">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Footer contact bar */}
      {contacts.length > 0 && (
        <footer
          className="mt-auto grid grid-cols-3 gap-x-6 gap-y-2 px-[16mm] py-[8mm] text-[8.5pt] text-white [print-color-adjust:exact]"
          style={{ backgroundColor: "var(--resume-accent)" }}
        >
          {contacts.map(({ icon: Icon, value }, i) => (
            <div key={i} className="flex min-w-0 items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">{value}</span>
            </div>
          ))}
        </footer>
      )}
    </div>
  );
}
