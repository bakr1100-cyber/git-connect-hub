import {
  formatLetterDate,
  subjectLine,
  type CoverLetterDocument,
} from "@/components/cover/CoverLetterPreview";
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
<p class="subject">${escape(subjectLine(doc))}</p>
<p class="block">${escape(doc.body)}</p>
</body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  triggerDownload(blob, `${fileBase(doc)}.doc`);
}

function letterHtml(doc: CoverLetterDocument) {
  const dir = isRtl(doc.language) ? "rtl" : "ltr";
  return `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8" /><style>
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #ffffff; }
body { width: 210mm; min-height: 297mm; padding: 20mm; font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #2b2b2b; direction: ${dir}; }
.name { font-size: 15pt; font-weight: bold; color: #111111; margin: 0; }
.meta { font-size: 9.5pt; color: #6b6b6b; margin: 4px 0 0; padding-bottom: 14px; border-bottom: 1px solid #d4d4d4; }
.block { margin-top: 32px; white-space: pre-line; color: #3d3d3d; font-size: 10.5pt; }
.date { margin-top: 32px; font-size: 9.5pt; color: #6b6b6b; }
.subject { margin-top: 28px; font-weight: bold; color: #111111; }
.body { margin-top: 20px; white-space: pre-line; }
</style></head><body>
<p class="name">${escape(doc.applicant.fullName)}</p>
<p class="meta">${escape([doc.applicant.location, doc.applicant.email, doc.applicant.phone].filter(Boolean).join(" \u00b7 "))}</p>
<div class="block">${escape([doc.company, doc.recipient, doc.companyAddress].filter(Boolean).join("\n"))}</div>
<p class="date">${escape(formatLetterDate(doc))}</p>
<p class="subject">${escape(subjectLine(doc))}</p>
<div class="body">${escape(doc.body)}</div>
</body></html>`;
}

/**
 * Renders the letter inside an isolated iframe so the app's CSS variables
 * (oklch colors) never reach the PDF renderer.
 */
export async function downloadCoverLetterPdf(doc: CoverLetterDocument) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;";
  document.body.appendChild(frame);
  try {
    const frameDoc = frame.contentDocument;
    if (!frameDoc) throw new Error("preview missing");
    frameDoc.open();
    frameDoc.write(letterHtml(doc));
    frameDoc.close();
    await new Promise((resolve) => setTimeout(resolve, 200));
    const canvas = await html2canvas(frameDoc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: frameDoc.body.scrollWidth,
      windowHeight: frameDoc.body.scrollHeight,
    });
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.98),
      "JPEG",
      0,
      0,
      pageWidth,
      Math.min(imageHeight, pageHeight)
    );
    pdf.save(`${fileBase(doc)}.pdf`);
  } finally {
    frame.remove();
  }
}


/**
 * Erzeugt das PDF (Download, damit es angehängt werden kann) und öffnet
 * anschließend das E-Mail-Programm mit Betreff und Anschreiben-Text.
 */
export async function emailCoverLetter(doc: CoverLetterDocument, to = "") {
  await downloadCoverLetterPdf(doc);
  const body = [
    subjectLine(doc),
    "",
    doc.body,
    "",
    [doc.applicant.fullName, doc.applicant.email, doc.applicant.phone].filter(Boolean).join(" · "),
  ].join("\n");
  const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subjectLine(doc)
  )}&body=${encodeURIComponent(body)}`;
  window.location.href = href;
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
