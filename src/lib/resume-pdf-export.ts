import type { ResumeData } from "@/lib/resume-types";

/** Renders the on-screen A4 preview into a single-page PDF blob. */
export async function generateResumePdfBlob(): Promise<Blob | null> {
  const element = document.getElementById("resume-preview-container");
  if (!element) return null;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    // 3x keeps the applicant photo and small print sharp at A4 print size (~300 dpi).
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: element.offsetWidth,
    height: element.offsetHeight,
    onclone: (clonedDocument) => {
      const clonedPage = clonedDocument.getElementById("resume-preview-container");
      if (!clonedPage) return;
      clonedPage.style.transform = "none";
      clonedPage.style.boxShadow = "none";
    },
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  pdf.addImage(
    canvas.toDataURL("image/jpeg", 0.98),
    "JPEG",
    0,
    0,
    pdf.internal.pageSize.getWidth(),
    pdf.internal.pageSize.getHeight()
  );
  return pdf.output("blob");
}

export function resumeFileName(data: ResumeData) {
  return `${data.personalDetails.fullName || "Lebenslauf"}.pdf`;
}

export function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
