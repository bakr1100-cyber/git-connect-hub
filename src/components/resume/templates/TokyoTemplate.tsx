import type { ResumeData } from "@/lib/resume-types";
import { ExtraSectionsBlock } from "./ExtraSectionsBlock";
import { translate, type TranslationKey } from "@/lib/i18n";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin, Globe, Linkedin, Calendar } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function TokyoTemplate({ data }: TemplateProps) {
  const { personalDetails, workExperience, education, skills, languages, settings } = data;
  const lang = settings.language;
  const tr = (key: TranslationKey) => translate(lang, key);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(dateLocales[lang], { day: "2-digit", month: "short", year: "numeric" });
  };

  const heading = "mb-3 border-b border-[var(--resume-accent-soft)] pb-1.5 text-[11pt] font-bold uppercase tracking-[0.14em] text-slate-700";

  return (
    <div className="relative font-sans text-[11pt] leading-relaxed text-slate-700">
      {/* Watercolour washes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[30mm] -top-[36mm] h-[80mm] w-[116mm] blur-[28px]"
        style={{
          opacity: 0.72,
          background:
            "radial-gradient(52% 52% at 38% 42%, var(--resume-accent-wash, var(--resume-accent-soft)) 0%, transparent 72%), radial-gradient(42% 46% at 68% 60%, var(--resume-accent-wash, var(--resume-accent-soft)) 0%, transparent 70%), radial-gradient(34% 30% at 24% 74%, var(--resume-accent-wash, var(--resume-accent-soft)) 0%, transparent 74%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[32mm] -right-[26mm] h-[110mm] w-[120mm] blur-[26px]"
        style={{
          opacity: 0.85,
          background:
            "radial-gradient(52% 52% at 62% 56%, var(--resume-accent-wash, var(--resume-accent-soft)) 0%, transparent 72%), radial-gradient(38% 42% at 34% 78%, var(--resume-accent-wash, var(--resume-accent-soft)) 0%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10mm] top-[86mm] h-[55mm] w-[60mm] blur-[24px]"
        style={{
          opacity: 0.45,
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--resume-accent-wash, var(--resume-accent-soft)) 0%, transparent 72%)",
        }}
      />


      <div className="relative">
        {/* Header */}
        <header className="mb-10 flex items-start gap-6">
          {personalDetails.photo && (
            <img src={personalDetails.photo} alt="" className="h-[32mm] w-[26mm] rounded-sm object-cover" />
          )}
          <div>
            <h1 className="font-serif text-[34pt] font-light leading-[1.05] tracking-tight text-slate-700">
              {personalDetails.fullName || tr("resume.yourName")}
            </h1>
            {settings.targetPosition && (
              <p className="mt-3 text-[9.5pt] font-medium uppercase tracking-[0.28em] text-slate-500">
                {settings.targetPosition}
              </p>
            )}
          </div>
        </header>

        <div className="flex gap-8">
          {/* Left column */}
          <aside className="w-[38%] space-y-7">
            <div className="space-y-2.5 text-[10.5pt] font-medium leading-[1.45] text-slate-900">
              {personalDetails.email && (
                <div className="flex items-start gap-2">
                  <Mail className="mt-[3px] h-3 w-3 shrink-0 text-slate-400" />
                  <span className="break-all">{personalDetails.email}</span>
                </div>
              )}
              {personalDetails.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-[3px] h-3 w-3 shrink-0 text-slate-400" />
                  <span>{personalDetails.location}</span>
                </div>
              )}
              {personalDetails.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="mt-[3px] h-3 w-3 shrink-0 text-slate-400" />
                  <span>{personalDetails.phone}</span>
                </div>
              )}
              {personalDetails.dateOfBirth && (
                <div className="flex items-start gap-2">
                  <Calendar className="mt-[3px] h-3 w-3 shrink-0 text-slate-400" />
                  <span>{formatDate(personalDetails.dateOfBirth)}</span>
                </div>
              )}
              {personalDetails.website && (
                <div className="flex items-start gap-2">
                  <Globe className="mt-[3px] h-3 w-3 shrink-0 text-slate-400" />
                  <span className="break-all">{personalDetails.website}</span>
                </div>
              )}
              {personalDetails.linkedin && (
                <div className="flex items-start gap-2">
                  <Linkedin className="mt-[3px] h-3 w-3 shrink-0 text-slate-400" />
                  <span className="break-all">{personalDetails.linkedin}</span>
                </div>
              )}
            </div>

            {skills.length > 0 && (
              <section>
                <h2 className={heading}>{tr("resume.skills")}</h2>
                <ul className="space-y-2 text-[10pt] font-medium leading-[1.45] text-slate-900">
                  {skills.map((item) => (
                    <li key={item.id} className="flex gap-2">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {languages.length > 0 && (
              <section>
                <h2 className={heading}>{tr("resume.languages")}</h2>
                <ul className="space-y-2 text-[10pt] font-medium leading-[1.45] text-slate-900">
                  {languages.map((item) => (
                    <li key={item.id} className="flex gap-2">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                      <span>
                        {item.name}
                        {item.level ? ` | ${item.level}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>

          {/* Right column */}
          <div className="w-[62%] space-y-7">
            {personalDetails.summary && (
              <p className="whitespace-pre-wrap text-[10.5pt] leading-[1.55] text-slate-800">{personalDetails.summary}</p>
            )}

            {workExperience.length > 0 && (
              <section>
                <h2 className={heading}>{tr("resume.experience")}</h2>
                <div className="space-y-5">
                  {workExperience.map((item) => (
                    <div key={item.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-[9.5pt] font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {item.position}
                        </h3>
                        <span className="text-[9pt] font-medium text-slate-600">
                          {item.startDate} – {item.endDate || tr("resume.present")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[9.5pt] font-medium text-slate-600">
                        {item.company}
                        {item.location && ` | ${item.location}`}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <section>
                <h2 className={heading}>{tr("resume.education")}</h2>
                <div className="space-y-5">
                  {education.map((item) => (
                    <div key={item.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-[9.5pt] font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {item.degree}
                        </h3>
                        <span className="text-[9pt] font-medium text-slate-600">
                          {item.startDate} – {item.endDate}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[9.5pt] font-medium text-slate-600">
                        {item.institution}
                        {item.location && ` | ${item.location}`}
                      </p>
                      {item.description && (
                        <p className="mt-1.5 whitespace-pre-wrap text-[10pt] leading-[1.5] text-slate-700">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <ExtraSectionsBlock data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
