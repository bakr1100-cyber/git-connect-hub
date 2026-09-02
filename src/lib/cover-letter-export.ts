import { formatLetterDate, type CoverLetterDocument } from "@/components/cover/CoverLetterPreview";
import { isRtl } from "@/lib/i18n/locales";

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

function fileBase(doc: CoverLetterDocument) {
  return [doc.applicant.fullName || "Anschreiben", doc.company].filter(Boolean).join(" - ");
}

/** Editable Word document (.doc) so the applicant can change wording before the final PDF. */
export function downloadCoverLetterWord(doc: CoverLetterDocument) {
  const dir = isRtl(doc.language) ? "rtl" : "ltr";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
<style>
@page { size: A4; margin: 20mm; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #222; direction: ${dir}; }
.name { font-size: 15pt; font-weight: bold; }
.meta { font-size: 9.5pt; color: #666; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
.block { margin-top: 28px; }
.subject { font-weight: bold; margin-top: 28px; }
</style></head><body>
<p class="name">${escape(doc.applicant.fullName)}</p>
<p class="meta">${escape([doc.applicant.location, doc.applicant.email, doc.applicant.phone].filter(Boolean).join(" · "))}</p>
<p class="block">${escape([doc.company, doc.recipient, doc.companyAddress].filter(Boolean).join("\n"))}</p>
<p class="block">${escape(formatLetterDate(doc))}</p>
<p class="subject">${escape(doc.position)}</p>
<p class="block">${escape(doc.body)}</p>
</body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  triggerDownload(blob, `${fileBase(doc)}.doc`);
}

export async function downloadCoverLetterPdf(doc: CoverLetterDocument) {
  const html2pdf = (await import("html2pdf.js")).default;
  const element = document.getElementById("cover-letter-preview-container");
  if (!element) throw new Error("preview missing");
  await html2pdf()
    .set({
      margin: 0,
      filename: `${fileBase(doc)}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    })
    .from(element)
    .save();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
