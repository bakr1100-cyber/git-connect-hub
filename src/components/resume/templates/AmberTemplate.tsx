import type { ResumeData } from "@/lib/resume-types";
import { translate, type TranslationKey } from "@/lib/i18n";
import { dateLocales } from "@/lib/i18n/locales";

interface TemplateProps {
  data: ResumeData;
}

/** Maps a free-text level ("Expert", "B2", "Gut") to a 0-1 bar fill. */
function levelToRatio(level: string | undefined, index: number): number {
  const value = (level ?? "").toLowerCase();
  const table: [string, number][] = [
    ["mutter", 1], ["native", 1], ["c2", 1], ["expert", 0.95], ["experte", 0.95],
    ["fließend", 0.92], ["fluent", 0.92], ["c1", 0.88], ["sehr gut", 0.85],
    ["advanced", 0.85], ["fortgeschritten", 0.8], ["b2", 0.75], ["gut", 0.72],
    ["good", 0.72], ["b1", 0.6], ["mittel", 0.6], ["intermediate", 0.6],
    ["a2", 0.45], ["grund", 0.4], ["basic", 0.4], ["a1", 0.3], ["anfänger", 0.3],
  ];
  for (const [key, ratio] of table) if (value.includes(key)) return ratio;
  return [0.9, 0.8, 0.7, 0.85, 0.75, 0.65][index % 6]!;
}

export function AmberTemplate({ data }: TemplateProps) {
  const { personalDetails, workExperience, education, skills, languages, settings } = data;
  const lang = settings.language;
  const tr = (key: TranslationKey) => translate(lang, key);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(dateLocales[lang], { year: "numeric" });
  };

  const fullName = personalDetails.fullName || tr("resume.yourName");
  const parts = fullName.trim().split(" ");
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  const extraSections = (data.extraSections ?? []).filter((s) => s.title.trim() || s.content.trim());

  const contactRows = [
    personalDetails.phone && { value: personalDetails.phone, label: tr("resume.phone") },
    personalDetails.email && { value: personalDetails.email, label: tr("resume.email") },
    personalDetails.location && { value: personalDetails.location, label: tr("resume.address") },
    personalDetails.website && { value: personalDetails.website, label: tr("resume.website") },
    personalDetails.linkedin && { value: personalDetails.linkedin, label: "LinkedIn" },
  ].filter(Boolean) as { value: string; label: string }[];

  const LeftHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-[3mm]">
      <h2
        className="text-end text-[10.5pt] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "var(--resume-accent)" }}
      >
        {children}
      </h2>
      <div className="mt-[1mm] h-[0.6mm] w-full bg-slate-800" />
    </div>
  );

  const RightHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-[3mm]">
      <h2
        className="text-[11.5pt] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "var(--resume-accent)" }}
      >
        {children}
      </h2>
      <div className="mt-[1mm] h-[0.6mm] w-full bg-slate-800" />
    </div>
  );

  return (
    <div className="-m-[20mm] flex h-[297mm] min-h-0 overflow-hidden bg-white font-sans text-[10pt] text-slate-600 [print-color-adjust:exact]">
      {/* Left column */}
      <div className="w-[62mm] shrink-0 border-e border-slate-300 px-[8mm] py-[13mm]">
        {contactRows.length > 0 && (
          <section className="min-w-0">
            <LeftHeading>{tr("resume.contact")}</LeftHeading>
            <ul className="space-y-[1.5mm] text-end text-[8pt]">
              {contactRows.map((row, i) => (
                <li key={i} className="min-w-0 break-words">
                  <span className="text-slate-500">{row.value}</span>
                  <span className="text-slate-400"> : </span>
                  <span className="font-semibold text-slate-800">{row.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {education.length > 0 && (
          <section className="mt-[8mm] min-w-0">
            <LeftHeading>{tr("resume.education")}</LeftHeading>
            <div className="space-y-[4mm] text-end">
              {education.map((item) => (
                <div key={item.id} className="min-w-0">
                  <p className="text-[8pt] text-slate-400">
                    {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : tr("resume.present")}
                  </p>
                  <p className="text-[9pt] font-bold uppercase tracking-[0.04em] text-slate-800">{item.degree}</p>
                  <p className="text-[8.5pt] text-slate-500">
                    {[item.institution, item.location].filter(Boolean).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {personalDetails.photo && (
          <img src={personalDetails.photo} alt="" className="mt-[8mm] h-[52mm] w-full object-cover" />
        )}

        {skills.length > 0 && (
          <section className="mt-[8mm] min-w-0">
            <LeftHeading>{tr("resume.skills")}</LeftHeading>
            <div className="space-y-[3mm]">
              {skills.slice(0, 8).map((skill, index) => (
                <div key={skill.id} className="min-w-0">
                  <p className="truncate text-end text-[8.5pt] text-slate-600">{skill.name}</p>
                  <div className="mt-[1mm] h-[1.2mm] w-full bg-slate-200">
                    <div
                      className="h-full [print-color-adjust:exact]"
                      style={{
                        width: `${levelToRatio(skill.level, index) * 100}%`,
                        backgroundColor: "var(--resume-accent)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section className="mt-[8mm] min-w-0">
            <LeftHeading>{tr("resume.languages")}</LeftHeading>
            <ul className="space-y-[1mm] text-end text-[8.5pt]">
              {languages.map((item) => (
                <li key={item.id} className="min-w-0 truncate">
                  {item.name}
                  {item.level ? ` — ${item.level}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Right column */}
      <div className="min-w-0 flex-1 px-[10mm] py-[13mm]">
        <header className="min-w-0 border-b border-slate-300 pb-[6mm]">
          <h1 className="truncate text-[26pt] font-extrabold leading-none tracking-tight text-slate-900">
            {firstName} <span style={{ color: "var(--resume-accent)" }}>{lastName}</span>
          </h1>
          {settings.targetPosition && (
            <p className="mt-[2mm] truncate text-[11pt] text-slate-500">{settings.targetPosition}</p>
          )}
        </header>

        <div className="mt-[7mm] space-y-[7mm]">
          {personalDetails.summary && (
            <section className="min-w-0">
              <RightHeading>{tr("resume.profile")}</RightHeading>
              <p className="whitespace-pre-wrap text-justify text-[9.5pt] leading-relaxed">
                {personalDetails.summary}
              </p>
            </section>
          )}

          {workExperience.length > 0 && (
            <section className="min-w-0">
              <RightHeading>{tr("resume.experience")}</RightHeading>
              <div className="space-y-[4mm]">
                {workExperience.map((item, i) => (
                  <div
                    key={item.id}
                    className={i > 0 ? "min-w-0 border-t border-slate-200 pt-[4mm]" : "min-w-0"}
                  >
                    <p className="text-[8pt] text-slate-400">
                      {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : tr("resume.present")}
                    </p>
                    <p className="truncate text-[9.5pt] font-bold uppercase tracking-[0.04em] text-slate-800">
                      {item.position}
                    </p>
                    <p className="truncate text-[9pt] text-slate-500">
                      {[item.company, item.location].filter(Boolean).join(", ")}
                    </p>
                    {item.description && (
                      <p className="mt-[2mm] whitespace-pre-wrap text-justify text-[9pt] leading-relaxed text-slate-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {extraSections.map((section) => (
            <section key={section.id} className="min-w-0">
              <RightHeading>{section.title}</RightHeading>
              <p className="whitespace-pre-wrap text-justify text-[9.5pt] leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
