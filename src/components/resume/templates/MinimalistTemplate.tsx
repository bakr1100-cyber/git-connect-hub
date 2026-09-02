import type { ResumeData } from "@/lib/resume-types";
import { ExtraSectionsBlock } from "./ExtraSectionsBlock";
import { translate, type TranslationKey } from "@/lib/i18n";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin, Globe, Linkedin, Calendar } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function MinimalistTemplate({ data }: TemplateProps) {
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
      {/* Header */}
      <div className="mb-6 border-b-2 border-[var(--resume-accent)] pb-6">
        <h1 className="text-[28pt] font-light tracking-tight text-slate-900">{personalDetails.fullName || tr("resume.yourName")}</h1>
        {settings.targetPosition && (
          <p className="mt-1 text-[13pt] font-medium text-slate-600">{settings.targetPosition}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[10pt] text-slate-600">
          {personalDetails.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {personalDetails.email}
            </span>
          )}
          {personalDetails.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {personalDetails.phone}
            </span>
          )}
          {personalDetails.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {personalDetails.location}
            </span>
          )}
          {personalDetails.dateOfBirth && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(personalDetails.dateOfBirth)}
            </span>
          )}
          {personalDetails.website && (
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> {personalDetails.website}
            </span>
          )}
          {personalDetails.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="h-3.5 w-3.5" /> {personalDetails.linkedin}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalDetails.summary && (
        <section className="mb-6">
          <h2 className="mb-2 text-[12pt] font-bold uppercase tracking-wider text-slate-900">
            {tr("resume.profile")}
          </h2>
          <p className="whitespace-pre-wrap text-[10.5pt] text-slate-700">{personalDetails.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-[12pt] font-bold uppercase tracking-wider text-slate-900">
            {tr("resume.experience")}
          </h2>
          <div className="space-y-4">
            {workExperience.map((item) => (
              <div key={item.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{item.position}</h3>
                  <span className="text-[9.5pt] text-slate-500">
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
          <h2 className="mb-3 text-[12pt] font-bold uppercase tracking-wider text-slate-900">
            {tr("resume.education")}
          </h2>
          <div className="space-y-4">
            {education.map((item) => (
              <div key={item.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{item.degree}</h3>
                  <span className="text-[9.5pt] text-slate-500">
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
            <h2 className="mb-2 text-[12pt] font-bold uppercase tracking-wider text-slate-900">
              {tr("resume.skills")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((item) => (
                <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-[9.5pt] text-slate-700">
                  {item.name}
                </span>
              ))}
            </div>
          </section>
        )}
        {languages.length > 0 && (
          <section>
            <h2 className="mb-2 text-[12pt] font-bold uppercase tracking-wider text-slate-900">
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
