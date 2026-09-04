import type { ResumeData } from "@/lib/resume-types";
import { translate, type TranslationKey } from "@/lib/i18n";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin, Globe, Linkedin, Calendar, Briefcase, GraduationCap } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

const SIDEBAR = "#12263a";

export function MarinaTemplate({ data }: TemplateProps) {
  const { personalDetails, workExperience, education, skills, languages, settings } = data;
  const lang = settings.language;
  const tr = (key: TranslationKey) => translate(lang, key);

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
  ].filter(Boolean) as { icon: typeof Phone; value: string }[];

  const sideContacts = [
    personalDetails.dateOfBirth && { icon: Calendar, value: formatDate(personalDetails.dateOfBirth) },
    personalDetails.linkedin && { icon: Linkedin, value: personalDetails.linkedin },
    personalDetails.website && { icon: Globe, value: personalDetails.website },
  ].filter(Boolean) as { icon: typeof Phone; value: string }[];

  const extraSections = (data.extraSections ?? []).filter((s) => s.title.trim() || s.content.trim());

  const nameParts = (personalDetails.fullName || tr("resume.yourName")).split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const sideHeading =
    "mb-2 border-b border-white/20 pb-1.5 text-[11pt] font-bold uppercase tracking-[0.08em] text-white";
  const mainHeading =
    "mb-3 text-[12.5pt] font-bold uppercase tracking-[0.06em] text-slate-900";
  const rule = (
    <span className="mt-1 block h-[2px] w-[14mm] bg-[var(--resume-accent)]" aria-hidden />
  );

  return (
    <div className="-m-[20mm] flex h-[297mm] min-h-0 overflow-hidden bg-white font-sans text-[11pt] text-slate-700 [print-color-adjust:exact]">
      {/* Sidebar */}
      <aside
        className="flex w-[62mm] shrink-0 flex-col gap-6 px-[9mm] py-[12mm] text-white [print-color-adjust:exact]"
        style={{ backgroundColor: SIDEBAR }}
      >
        {personalDetails.photo && (
          <div className="mx-auto rounded-full p-[3px]" style={{ border: "2px solid var(--resume-accent)" }}>
            <img
              src={personalDetails.photo}
              alt=""
              className="h-[34mm] w-[34mm] rounded-full object-cover"
            />
          </div>
        )}

        {personalDetails.summary && (
          <section>
            <h2 className={sideHeading}>{tr("resume.profile")}</h2>
            <p className="whitespace-pre-wrap text-[8.5pt] leading-[1.5] text-white/70">
              {personalDetails.summary}
            </p>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2 className={sideHeading}>{tr("resume.education")}</h2>
            <div className="space-y-3">
              {education.map((item) => (
                <div key={item.id} className="min-w-0">
                  <p className="text-[8pt] text-white/60">
                    {item.startDate}
                    {item.endDate && ` – ${item.endDate}`}
                  </p>
                  <p className="break-words text-[9pt] font-semibold text-[var(--resume-accent)]">
                    {item.degree}
                  </p>
                  <p className="break-words text-[8.5pt] text-white/70">{item.institution}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className={sideHeading}>{tr("resume.skills")}</h2>
            <ul className="space-y-2.5">
              {skills.map((item, index) => (
                <li key={item.id} className="min-w-0">
                  <p className="break-words text-[9pt] font-medium uppercase tracking-wide text-white">
                    {item.name}
                  </p>
                  <span className="mt-1 block h-[3px] w-full rounded-full bg-white/25">
                    <span
                      className="block h-full rounded-full bg-[var(--resume-accent)]"
                      style={{ width: `${72 + ((index * 9) % 26)}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <h2 className={sideHeading}>{tr("resume.languages")}</h2>
            <ul className="space-y-1 text-[9pt] text-white/80">
              {languages.map((item) => (
                <li key={item.id} className="break-words">
                  {item.name}
                  {item.level ? ` – ${item.level}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {sideContacts.length > 0 && (
          <section className="mt-auto space-y-1.5 text-[8.5pt] text-white/70">
            {sideContacts.map(({ icon: Icon, value }, i) => (
              <div key={i} className="flex min-w-0 items-center gap-2">
                <Icon className="h-3 w-3 shrink-0 text-[var(--resume-accent)]" />
                <span className="break-all">{value}</span>
              </div>
            ))}
          </section>
        )}
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col px-[12mm] py-[12mm]">
        <header>
          <h1 className="text-[26pt] font-black uppercase leading-none tracking-tight text-slate-900">
            {firstName} <span className="text-[var(--resume-accent)]">{lastName}</span>
          </h1>
          {settings.targetPosition && (
            <p className="mt-1 text-[11pt] font-medium uppercase tracking-[0.22em] text-slate-500">
              {settings.targetPosition}
            </p>
          )}
          <span className="mt-2 block h-[2px] w-[36mm] bg-[var(--resume-accent)]" aria-hidden />
        </header>

        {contacts.length > 0 && (
          <div className="mt-5 grid grid-cols-3 items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3">
            {contacts.map(({ icon: Icon, value }, i) => (
              <div
                key={i}
                className={`flex min-w-0 flex-col items-center gap-1 text-center ${i > 0 ? "border-s border-slate-200 ps-2" : ""}`}
              >
                <span
                  className="grid h-[7mm] w-[7mm] place-items-center rounded-full text-white [print-color-adjust:exact]"
                  style={{ backgroundColor: "var(--resume-accent)" }}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <span className="break-all text-[8pt] text-slate-600">{value}</span>
              </div>
            ))}
          </div>
        )}

        {workExperience.length > 0 && (
          <section className="mt-6 min-h-0">
            <h2 className={mainHeading}>
              {tr("resume.experience")}
              {rule}
            </h2>
            <div className="relative space-y-4 ps-[26mm]">
              <span
                aria-hidden
                className="absolute inset-y-1 start-[23.5mm] w-px bg-slate-300"
              />
              {workExperience.map((item) => (
                <div key={item.id} className="relative min-w-0">
                  <span
                    className="absolute -start-[26mm] top-0 flex h-[10mm] w-[19mm] flex-col justify-center rounded-s-sm px-2 text-white [print-color-adjust:exact]"
                    style={{ backgroundColor: "var(--resume-accent)" }}
                  >
                    <span className="whitespace-nowrap text-[7pt] font-semibold leading-tight">
                      {item.startDate}
                    </span>
                    <span className="whitespace-nowrap text-[7pt] leading-tight opacity-90">
                      {item.endDate || tr("resume.present")}
                    </span>
                  </span>
                  <span
                    className="absolute -start-[5.5mm] top-[2mm] grid h-[6mm] w-[6mm] place-items-center rounded-full text-white [print-color-adjust:exact]"
                    style={{ backgroundColor: "var(--resume-accent)" }}
                  >
                    <Briefcase className="h-2.5 w-2.5" />
                  </span>
                  <h3 className="break-words text-[10pt] font-bold uppercase text-slate-900">
                    {item.company}
                    {item.position && ` / ${item.position}`}
                  </h3>
                  {item.location && (
                    <p className="text-[8.5pt] text-slate-500">{item.location}</p>
                  )}
                  {item.description && (
                    <p className="mt-1 whitespace-pre-wrap break-words text-[9pt] leading-[1.45] text-slate-600">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {extraSections.length > 0 && (
          <section className="mt-auto grid grid-cols-2 gap-6 border-t border-slate-200 pt-4">
            {extraSections.slice(0, 2).map((section) => (
              <div key={section.id} className="min-w-0">
                <h2 className={mainHeading}>
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-[var(--resume-accent)]" />
                    {section.title}
                  </span>
                  {rule}
                </h2>
                <p className="whitespace-pre-wrap break-words text-[9pt] leading-[1.45] text-slate-600">
                  {section.content}
                </p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
