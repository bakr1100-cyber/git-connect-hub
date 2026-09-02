import type { ResumeData } from "@/lib/resume-types";
import { ExtraSectionsBlock } from "./ExtraSectionsBlock";
import { translate, type TranslationKey } from "@/lib/i18n";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin, Globe, Linkedin, Calendar } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function ModernTemplate({ data }: TemplateProps) {
  const { personalDetails, workExperience, education, skills, languages, settings } = data;
  const lang = settings.language;
  const tr = (key: TranslationKey) => translate(lang, key);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(dateLocales[lang], {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="font-sans text-[11pt] leading-relaxed text-slate-800">
      {/* Header with accent */}
      <div
        className="relative -mx-[20mm] -mt-[20mm] mb-7 overflow-hidden px-[20mm] py-[14mm] text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--resume-accent) 0%, color-mix(in oklab, var(--resume-accent) 82%, black) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute -end-16 -top-24 h-56 w-56 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
        />
        <div className="relative flex items-center gap-7">
          {personalDetails.photo && (
            <img
              src={personalDetails.photo}
              alt=""
              className="h-[30mm] w-[30mm] shrink-0 rounded-full object-cover shadow-lg ring-4 ring-white/25"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-[27pt] font-semibold leading-[1.05] tracking-tight">
              {personalDetails.fullName || tr("resume.yourName")}
            </h1>
            {settings.targetPosition && (
              <p className="mt-1.5 text-[11.5pt] font-medium uppercase tracking-[0.18em] text-white/70">
                {settings.targetPosition}
              </p>
            )}
            <div className="mt-4 h-px w-16 bg-white/35" />
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[9.5pt] text-white/85">
              {personalDetails.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 opacity-70" /> {personalDetails.email}
                </span>
              )}
              {personalDetails.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 opacity-70" /> {personalDetails.phone}
                </span>
              )}
              {personalDetails.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 opacity-70" /> {personalDetails.location}
                </span>
              )}
              {personalDetails.dateOfBirth && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 opacity-70" /> {formatDate(personalDetails.dateOfBirth)}
                </span>
              )}
              {personalDetails.website && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 opacity-70" /> {personalDetails.website}
                </span>
              )}
              {personalDetails.linkedin && (
                <span className="flex items-center gap-1.5">
                  <Linkedin className="h-3.5 w-3.5 opacity-70" /> {personalDetails.linkedin}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Summary */}
      {personalDetails.summary && (
        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 text-[12pt] font-bold text-slate-900">
            <span className="h-2 w-2 rounded-full bg-[var(--resume-accent)]" />
            {tr("resume.profile")}
          </h2>
          <p className="whitespace-pre-wrap text-[10.5pt] text-slate-700">{personalDetails.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-[12pt] font-bold text-slate-900">
            <span className="h-2 w-2 rounded-full bg-[var(--resume-accent)]" />
            {tr("resume.experience")}
          </h2>
          <div className="space-y-4">
            {workExperience.map((item) => (
              <div key={item.id} className="border-l-2 border-slate-200 pl-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{item.position}</h3>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[9pt] text-slate-600">
                    {item.startDate} – {item.endDate || tr("resume.present")}
                  </span>
                </div>
                <p className="text-[10.5pt] font-medium text-slate-600">
                  {item.company}
                  {item.location && `, ${item.location}`}
                </p>
                {item.description && (
                  <p className="mt-1 whitespace-pre-wrap text-[10pt] text-slate-700">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-[12pt] font-bold text-slate-900">
            <span className="h-2 w-2 rounded-full bg-[var(--resume-accent)]" />
            {tr("resume.education")}
          </h2>
          <div className="space-y-4">
            {education.map((item) => (
              <div key={item.id} className="border-l-2 border-slate-200 pl-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{item.degree}</h3>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[9pt] text-slate-600">
                    {item.startDate} – {item.endDate}
                  </span>
                </div>
                <p className="text-[10.5pt] font-medium text-slate-600">
                  {item.institution}
                  {item.location && `, ${item.location}`}
                </p>
                {item.description && (
                  <p className="mt-1 whitespace-pre-wrap text-[10pt] text-slate-700">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Languages */}
      <div className="grid gap-6 sm:grid-cols-2">
        {skills.length > 0 && (
          <section>
            <h2 className="mb-2 flex items-center gap-2 text-[12pt] font-bold text-slate-900">
              <span className="h-2 w-2 rounded-full bg-[var(--resume-accent)]" />
              {tr("resume.skills")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((item) => (
                <span key={item.id} className="rounded bg-[var(--resume-accent)] px-3 py-1 text-[9.5pt] text-white">
                  {item.name}
                </span>
              ))}
            </div>
          </section>
        )}
        {languages.length > 0 && (
          <section>
            <h2 className="mb-2 flex items-center gap-2 text-[12pt] font-bold text-slate-900">
              <span className="h-2 w-2 rounded-full bg-[var(--resume-accent)]" />
              {tr("resume.languages")}
            </h2>
            <div className="space-y-1">
              {languages.map((item) => (
                <div key={item.id} className="flex justify-between text-[10pt]">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <ExtraSectionsBlock data={data} />
    </div>
  );
}
