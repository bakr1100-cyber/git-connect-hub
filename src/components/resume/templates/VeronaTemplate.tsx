import type { ResumeData } from "@/lib/resume-types";
import type { TranslationKey } from "@/lib/i18n";
import { templateTranslate } from "@/lib/i18n/templates";
import { dateLocales } from "@/lib/i18n/locales";
import { Mail, Phone, MapPin } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

const PAPER = "#f6f2e8";
const PANEL = "#efe7dd";

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

export function VeronaTemplate({ data }: TemplateProps) {
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
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const extraSections = (data.extraSections ?? []).filter((s) => s.title.trim() || s.content.trim());

  const footerItems = [
    personalDetails.phone && { icon: Phone, value: personalDetails.phone },
    personalDetails.location && { icon: MapPin, value: personalDetails.location },
    personalDetails.email && { icon: Mail, value: personalDetails.email },
  ].filter(Boolean) as { icon: typeof Phone; value: string }[];

  const heading =
    "text-[15pt] font-light tracking-[0.02em] text-slate-500 [font-family:Georgia,'Times_New_Roman',serif]";
  const entryTitle = "text-[9.5pt] font-bold uppercase tracking-[0.06em] text-slate-800";

  return (
    <div
      className="-m-[20mm] flex h-[297mm] min-h-0 flex-col overflow-hidden font-sans text-[10pt] text-slate-600 [print-color-adjust:exact]"
      style={{ backgroundColor: PAPER }}
    >
      <div className="grid min-h-0 flex-1 grid-cols-[62mm_1fr]">
        {/* Left column */}
        <div className="min-w-0 px-[9mm] py-[11mm]" style={{ backgroundColor: PANEL }}>
          {personalDetails.photo ? (
            <div className="relative">
              <img
                src={personalDetails.photo}
                alt=""
                className="h-[58mm] w-full object-cover"
              />
              <div
                className="absolute inset-x-0 bottom-0 px-[4mm] py-[3mm] text-white [print-color-adjust:exact]"
                style={{ backgroundColor: "var(--resume-accent)" }}
              >
                <p className="truncate text-[10pt] font-light uppercase tracking-[0.18em]">{firstName}</p>
                {lastName && (
                  <p className="truncate text-[15pt] font-semibold uppercase tracking-[0.06em] leading-tight">
                    {lastName}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div
              className="px-[4mm] py-[5mm] text-white [print-color-adjust:exact]"
              style={{ backgroundColor: "var(--resume-accent)" }}
            >
              <p className="truncate text-[11pt] font-light uppercase tracking-[0.18em]">{firstName}</p>
              {lastName && (
                <p className="truncate text-[17pt] font-semibold uppercase tracking-[0.06em] leading-tight">
                  {lastName}
                </p>
              )}
            </div>
          )}

          {settings.targetPosition && (
            <p className="mt-[4mm] text-[9pt] uppercase tracking-[0.16em] text-slate-500">
              {settings.targetPosition}
            </p>
          )}

          {personalDetails.summary && (
            <section className="mt-[7mm] min-w-0">
              <h2 className={heading}>{tr("resume.profile")}</h2>
              <p className="mt-[3mm] whitespace-pre-wrap break-words text-[8.5pt] leading-[1.6] text-slate-600">
                {personalDetails.summary}
              </p>
            </section>
          )}

          {extraSections.length > 0 && (
            <div className="mt-[7mm] space-y-[5mm]">
              {extraSections.map((section) => (
                <section key={section.id} className="min-w-0">
                  <h2 className={heading}>{section.title}</h2>
                  <p className="mt-[2mm] whitespace-pre-wrap break-words text-[8.5pt] leading-[1.6]">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-[7mm] px-[11mm] py-[11mm]">
          {workExperience.length > 0 && (
            <section className="min-w-0">
              <h2 className={heading}>{tr("resume.experience")}</h2>
              <div className="mt-[4mm] space-y-[4mm]">
                {workExperience.map((item) => (
                  <div key={item.id} className="grid min-w-0 grid-cols-[26mm_1fr] gap-x-[4mm]">
                    <span className="pt-[0.5mm] text-[8.5pt] tracking-[0.06em] text-slate-500">
                      {formatDate(item.startDate)}
                      {(item.endDate || item.startDate) &&
                        ` – ${item.endDate ? formatDate(item.endDate) : tr("resume.present")}`}
                    </span>
                    <div className="min-w-0">
                      <h3 className={`${entryTitle} break-words`}>{item.company}</h3>
                      <p className="break-words text-[9pt] text-slate-500">
                        {item.position}
                        {item.location && `, ${item.location}`}
                      </p>
                      {item.description && (
                        <p className="mt-[1.5mm] whitespace-pre-wrap break-words text-[8.5pt] leading-[1.55]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="min-w-0">
              <h2 className={heading}>{tr("resume.education")}</h2>
              <div className="mt-[4mm] space-y-[3mm]">
                {education.map((item) => (
                  <div key={item.id} className="grid min-w-0 grid-cols-[26mm_1fr] gap-x-[4mm]">
                    <span className="pt-[0.5mm] text-[8.5pt] tracking-[0.06em] text-slate-500">
                      {formatDate(item.startDate)}
                      {item.endDate && ` – ${formatDate(item.endDate)}`}
                    </span>
                    <div className="min-w-0">
                      <h3 className={`${entryTitle} break-words`}>{item.institution}</h3>
                      <p className="break-words text-[9pt] text-slate-500">
                        {item.degree}
                        {item.location && `, ${item.location}`}
                      </p>
                      {item.description && (
                        <p className="mt-[1.5mm] whitespace-pre-wrap break-words text-[8.5pt] leading-[1.55]">
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
      </div>

      {/* Skills band spanning both columns */}
      {skills.length > 0 && (
        <div className="mx-[9mm] border border-slate-300/70">
          <div className="grid grid-cols-[53mm_1fr] items-center gap-x-[6mm] px-[5mm] py-[5mm]">
            <h2 className={heading}>{tr("resume.skills")}</h2>
            <div />
            {skills.slice(0, 8).map((item, index) => (
              <div key={item.id} className="contents">
                <p className="mt-[2mm] truncate text-[8.5pt] text-slate-600">{item.name}</p>
                <div className="mt-[2mm] h-[2.6mm] w-full" style={{ backgroundColor: "var(--resume-accent-soft)" }}>
                  <div
                    className="h-full [print-color-adjust:exact]"
                    style={{
                      width: `${levelToRatio(item.level, index) * 100}%`,
                      backgroundColor: "var(--resume-accent)",
                      opacity: 0.85,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="mt-[6mm] min-w-0 px-[9mm]">
          <h2 className={heading}>{tr("resume.languages")}</h2>
          <div className="mt-[3mm] grid grid-cols-2 gap-x-[8mm] gap-y-[2mm]">
            {languages.slice(0, 6).map((item, index) => (
              <div key={item.id} className="min-w-0">
                <p className="truncate text-[8.5pt] text-slate-600">
                  {item.name}
                  {item.level ? ` — ${item.level}` : ""}
                </p>
                <div className="mt-[1mm] h-[2mm] w-full" style={{ backgroundColor: "var(--resume-accent-soft)" }}>
                  <div
                    className="h-full [print-color-adjust:exact]"
                    style={{
                      width: `${levelToRatio(item.level, index) * 100}%`,
                      backgroundColor: "var(--resume-accent)",
                      opacity: 0.85,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer contact bar */}
      {footerItems.length > 0 && (
        <div
          className="mt-auto flex flex-wrap items-center justify-between gap-x-[6mm] gap-y-[2mm] px-[11mm] py-[4mm] text-[8.5pt] text-white [print-color-adjust:exact]"
          style={{ backgroundColor: "var(--resume-accent)" }}
        >
          {footerItems.map(({ icon: Icon, value }, i) => (
            <span key={i} className="flex min-w-0 items-center gap-2">
              <span className="grid h-[4.5mm] w-[4.5mm] shrink-0 place-items-center rounded-full bg-white/25">
                <Icon className="h-2.5 w-2.5" />
              </span>
              <span className="truncate">{value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
