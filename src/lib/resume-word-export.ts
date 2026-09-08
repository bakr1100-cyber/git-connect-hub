import type { ResumeData } from "@/lib/resume-types";
import { translate, type TranslationKey } from "@/lib/i18n";
import { dateLocales, isRtl } from "@/lib/i18n/locales";

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

function formatDate(dateStr: string, lang: ResumeData["settings"]["language"]) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(dateLocales[lang], { month: "short", year: "numeric" });
}

/** Editable Word document (.doc) generated from the resume data, in the document language. */
export function downloadResumeWord(data: ResumeData) {
  const { personalDetails: p, workExperience, education, skills, languages, settings, extraSections } = data;
  const lang = settings.language;
  const dir = isRtl(lang) ? "rtl" : "ltr";
  const tr = (key: TranslationKey) => translate(lang, key);

  const contact = [p.location, p.email, p.phone, p.linkedin, p.website].filter(Boolean).join(" · ");

  const section = (title: string, body: string) =>
    body
      ? `<h2>${escape(title)}</h2>${body}`
      : "";

  const experienceHtml = workExperience
    .map(
      (item) => `
      <div class="item">
        <p class="item-head"><span class="item-title">${escape(item.position)}</span>
        <span class="item-date">${escape(formatDate(item.startDate, lang))} – ${escape(
          item.endDate ? formatDate(item.endDate, lang) : tr("resume.present")
        )}</span></p>
        <p class="item-sub">${escape([item.company, item.location].filter(Boolean).join(", "))}</p>
        ${item.description ? `<p class="item-desc">${escape(item.description)}</p>` : ""}
      </div>`
    )
    .join("");

  const educationHtml = education
    .map(
      (item) => `
      <div class="item">
        <p class="item-head"><span class="item-title">${escape(item.degree)}</span>
        <span class="item-date">${escape(formatDate(item.startDate, lang))} – ${escape(
          item.endDate ? formatDate(item.endDate, lang) : tr("resume.present")
        )}</span></p>
        <p class="item-sub">${escape([item.institution, item.location].filter(Boolean).join(", "))}</p>
        ${item.description ? `<p class="item-desc">${escape(item.description)}</p>` : ""}
      </div>`
    )
    .join("");

  const skillsHtml = skills.length
    ? `<p class="item-desc">${escape(skills.map((s) => (s.level ? `${s.name} (${s.level})` : s.name)).join(" · "))}</p>`
    : "";

  const languagesHtml = languages.length
    ? `<p class="item-desc">${escape(languages.map((l) => `${l.name} (${l.level})`).join(" · "))}</p>`
    : "";

  const extrasHtml = (extraSections ?? [])
    .filter((s) => s.title.trim() && s.content.trim())
    .map((s) => section(s.title, `<p class="item-desc">${escape(s.content)}</p>`))
    .join("");

  const html = `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8" />
<style>
@page { size: A4; margin: 20mm; }
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; direction: ${dir}; }
h1 { font-size: 20pt; margin: 0 0 2pt; color: #0f172a; }
.title { font-size: 12pt; color: #475569; margin: 0 0 4pt; }
.meta { font-size: 9.5pt; color: #64748b; border-bottom: 1.5pt solid #cbd5e1; padding-bottom: 10pt; margin-bottom: 14pt; }
h2 { font-size: 12pt; text-transform: uppercase; letter-spacing: 1pt; color: #0f172a; border-bottom: 1pt solid #e2e8f0; padding-bottom: 3pt; margin: 16pt 0 8pt; }
.item { margin-bottom: 10pt; }
.item-head { margin: 0; }
.item-title { font-weight: bold; color: #0f172a; }
.item-date { font-size: 9.5pt; color: #64748b; }
.item-sub { font-size: 10.5pt; color: #475569; margin: 1pt 0; }
.item-desc { font-size: 10.5pt; color: #334155; margin: 2pt 0 0; }
</style></head><body>
<h1>${escape(p.fullName)}</h1>
${settings.targetPosition ? `<p class="title">${escape(settings.targetPosition)}</p>` : ""}
<p class="meta">${escape(contact)}</p>
${p.summary ? section(tr("resume.profile"), `<p class="item-desc">${escape(p.summary)}</p>`) : ""}
${section(tr("resume.experience"), experienceHtml)}
${section(tr("resume.education"), educationHtml)}
${section(tr("resume.skills"), skillsHtml)}
${section(tr("resume.languages"), languagesHtml)}
${extrasHtml}
</body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${p.fullName || "Lebenslauf"}.doc`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
