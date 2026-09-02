import type { ResumeData } from "@/lib/resume-types";
import { ExtraSectionsBlock } from "./ExtraSectionsBlock";
import { translate, type TranslationKey } from "@/lib/i18n";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin, Globe, Linkedin, Calendar } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function EuropeanTemplate({ data }: TemplateProps) {
  const { personalDetails, workExperience, education, skills, languages, settings } = data;
  const lang = settings.language;
  const tr = (key: TranslationKey) => translate(lang, key);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(dateLocales[lang], {
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-full font-sans text-[11pt] leading-relaxed text-slate-800">
      {/* Sidebar */}
      <div className="w-[35%] bg-[var(--resume-accent-soft)] p-6 pr-4">
        {personalDetails.photo && (
          <div className="mb-6">
            <img src={personalDetails.photo} alt="" className="h-32 w-32 rounded object-cover" />
          </div>
        )}

        <div className="mb-6 space-y-2 text-[10pt] text-slate-700">
          {personalDetails.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-slate-500" />
              {personalDetails.email}
            </div>
          )}
          {personalDetails.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-500" />
              {personalDetails.phone}
            </div>
          )}
          {personalDetails.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              {personalDetails.location}
            </div>
          )}
          {personalDetails.dateOfBirth && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              {formatDate(personalDetails.dateOfBirth)}
            </div>
          )}
          {personalDetails.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              {personalDetails.website}
            </div>
          )}
          {personalDetails.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="h-3.5 w-3.5 text-slate-500" />
              {personalDetails.linkedin}
            </div>
          )}
        </div>

        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 border-b border-slate-300 pb-1 text-[11pt] font-bold uppercase tracking-wider text-slate-900">
              {tr("resume.skills")}
            </h2>
            <div className="space-y-1.5">
              {skills.map((item) => (
                <div key={item.id} className="text-[10pt] text-slate-700">
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 className="mb-3 border-b border-slate-300 pb-1 text-[11pt] font-bold uppercase tracking-wider text-slate-900">
              {tr("resume.languages")}
            </h2>
            <div className="space-y-1.5">
              {languages.map((item) => (
                <div key={item.id} className="flex justify-between text-[10pt]">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-[65%] p-6 pl-8">
        <div className="mb-8">
          <h1 className="text-[24pt] font-bold tracking-tight text-slate-900">{personalDetails.fullName || tr("resume.yourName")}</h1>
          {settings.targetPosition && <p className="mt-1 text-[12pt] text-slate-600">{settings.targetPosition}</p>}
        </div>

        {personalDetails.summary && (
          <section className="mb-6">
            <h2 className="mb-2 border-b border-slate-300 pb-1 text-[11pt] font-bold uppercase tracking-wider text-slate-900">
              {tr("resume.profile")}
            </h2>
            <p className="whitespace-pre-wrap text-[10.5pt] text-slate-700">{personalDetails.summary}</p>
          </section>
        )}

        {workExperience.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 border-b border-slate-300 pb-1 text-[11pt] font-bold uppercase tracking-wider text-slate-900">
              {tr("resume.experience")}
            </h2>
            <div className="space-y-4">
              {workExperience.map((item) => (
                <div key={item.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{item.position}</h3>
                    <span className="text-[9pt] text-slate-500">
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

        {education.length > 0 && (
          <section>
            <h2 className="mb-3 border-b border-slate-300 pb-1 text-[11pt] font-bold uppercase tracking-wider text-slate-900">
              {tr("resume.education")}
            </h2>
            <div className="space-y-4">
              {education.map((item) => (
                <div key={item.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{item.degree}</h3>
                    <span className="text-[9pt] text-slate-500">
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
      </div>

      <ExtraSectionsBlock data={data} />
    </div>
  );
}
