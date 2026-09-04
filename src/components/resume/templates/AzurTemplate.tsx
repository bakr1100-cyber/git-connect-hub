import type { ResumeData } from "@/lib/resume-types";
import type { TranslationKey } from "@/lib/i18n";
import { templateTranslate } from "@/lib/i18n/templates";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin, Globe, Linkedin, Calendar } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function AzurTemplate({ data }: TemplateProps) {
  const { personalDetails, workExperience, education, skills, languages, settings } = data;
  const lang = settings.language;
  const tr = (key: TranslationKey) => templateTranslate(settings.template, lang, key);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(dateLocales[lang], { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const heading = "mb-2.5 text-[12pt] font-bold uppercase tracking-wide text-slate-900";

  const contacts = [
    personalDetails.phone && { icon: Phone, value: personalDetails.phone },
    personalDetails.dateOfBirth && { icon: Calendar, value: formatDate(personalDetails.dateOfBirth) },
    personalDetails.email && { icon: Mail, value: personalDetails.email },
    
    personalDetails.location && { icon: MapPin, value: personalDetails.location },
    personalDetails.linkedin && { icon: Linkedin, value: personalDetails.linkedin },
    personalDetails.website && { icon: Globe, value: personalDetails.website },
  ].filter(Boolean) as { icon: typeof Phone; value: string }[];

  const extraSections = (data.extraSections ?? []).filter((s) => s.title.trim() || s.content.trim());

  return (
    <div className="font-sans text-[11pt] leading-relaxed text-slate-700">
      {/* Header */}
      <header
        className="-mx-[20mm] -mt-[20mm] mb-8 flex items-center gap-7 px-[20mm] py-8"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--resume-accent) 16%, var(--resume-accent-soft))",
        }}
      >
        {personalDetails.photo && (
          <img
            src={personalDetails.photo}
            alt=""
            className="h-[38mm] w-[38mm] shrink-0 rounded-full border-4 border-white object-cover shadow-md"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-[24pt] font-bold leading-tight text-slate-900">
            {personalDetails.fullName || tr("resume.yourName")}
          </h1>
          {settings.targetPosition && (
            <p className="mt-0.5 text-[11.5pt] font-medium text-slate-700">{settings.targetPosition}</p>
          )}
          {contacts.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1.5 text-[9.5pt] text-slate-800">
              {contacts.map(({ icon: Icon, value }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  <span className="break-all">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="flex gap-10">
        {/* Left column */}
        <aside className="w-[34%] space-y-8">
          {skills.length > 0 && (
            <section>
              <h2 className={heading}>{tr("resume.skills")}</h2>
              <ul className="space-y-2.5 text-[10pt] leading-[1.5] text-slate-800">
                {skills.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <h2 className={heading}>{tr("resume.languages")}</h2>
              <ul className="space-y-2.5 text-[10pt] leading-[1.5] text-slate-800">
                {languages.map((item) => (
                  <li key={item.id}>
                    {item.name}
                    {item.level ? ` (${item.level})` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {extraSections.map((section) => (
            <section key={section.id}>
              <h2 className={heading}>{section.title}</h2>
              <p className="whitespace-pre-wrap text-[10pt] leading-[1.5] text-slate-800">{section.content}</p>
            </section>
          ))}
        </aside>

        {/* Right column */}
        <div className="w-[66%] space-y-8">
          {personalDetails.summary && (
            <section>
              <h2 className={heading}>{tr("resume.profile")}</h2>
              <p className="whitespace-pre-wrap text-[10pt] leading-[1.55] text-slate-800">{personalDetails.summary}</p>
            </section>
          )}

          {workExperience.length > 0 && (
            <section>
              <h2 className={heading}>{tr("resume.experience")}</h2>
              <div className="space-y-5">
                {workExperience.map((item) => (
                  <div key={item.id}>
                    <h3 className="text-[10.5pt] font-bold text-slate-900">{item.position}</h3>
                    <p className="mt-0.5 text-[10pt] font-medium text-slate-600">
                      {item.company}
                      {item.location && `, ${item.location}`}
                      {" / "}
                      {item.startDate} – {item.endDate || tr("resume.present")}
                    </p>
                    {item.description && (
                      <p className="mt-1.5 whitespace-pre-wrap text-[10pt] leading-[1.5] text-slate-700">
                        {item.description}
                      </p>
                    )}
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
                    <h3 className="text-[10.5pt] font-bold text-slate-900">{item.degree}</h3>
                    <p className="mt-0.5 text-[10pt] font-medium text-slate-600">
                      {item.institution}
                      {item.location && `, ${item.location}`}
                      {" / "}
                      {item.startDate}
                      {item.endDate && ` – ${item.endDate}`}
                    </p>
                    {item.description && (
                      <p className="mt-1.5 whitespace-pre-wrap text-[10pt] leading-[1.5] text-slate-700">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
