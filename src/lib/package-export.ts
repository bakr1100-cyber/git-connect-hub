import type { ResumeData } from "@/lib/resume-types";
import type { CoverLetterDocument } from "@/components/cover/CoverLetterPreview";
import { renderCoverLetterImage } from "@/lib/cover-letter-export";
import { triggerBlobDownload } from "@/lib/resume-pdf-export";

const COVER_KEY = "cover-letter-draft-v1";

/** Reads the saved cover letter draft (if the user already wrote one). */
export function readCoverLetterDraft(resume: ResumeData): CoverLetterDocument | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COVER_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<CoverLetterDocument>;
    if (!draft.body || !draft.body.trim()) return null;
    return {
      style: resume.settings?.template === "amber" ? "amber" : "classic",
      applicant: draft.applicant ?? {
        fullName: resume.personalDetails?.fullName ?? "",
        email: resume.personalDetails?.email ?? "",
        phone: resume.personalDetails?.phone ?? "",
        location: resume.personalDetails?.location ?? "",
      },
      company: draft.company ?? "",
      recipient: draft.recipient ?? "",
      companyAddress: draft.companyAddress ?? "",
      position: draft.position ?? resume.settings?.targetPosition ?? "",
      body: draft.body,
      language: draft.language ?? (resume.settings?.language as CoverLetterDocument["language"]),
    } as CoverLetterDocument;
  } catch {
    return null;
  }
}

async function renderResumeImage(): Promise<string | null> {
  const element = document.getElementById("resume-preview-container");
  if (!element) return null;
  const { default: html2canvas } = await import("html2canvas-pro");
  const canvas = await html2canvas(element, {
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
  return canvas.toDataURL("image/jpeg", 0.98);
}

export interface PackageResult {
  resume: boolean;
  coverLetter: boolean;
}

/**
 * Builds one A4 PDF containing the rendered resume and — when available —
 * the cover letter as a second page.
 */
export async function downloadApplicationPackagePdf(data: ResumeData): Promise<PackageResult> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const result: PackageResult = { resume: false, coverLetter: false };

  const resumeImage = await renderResumeImage();
  if (resumeImage) {
    pdf.addImage(resumeImage, "JPEG", 0, 0, pageWidth, pageHeight);
    result.resume = true;
  }

  const letter = readCoverLetterDraft(data);
  if (letter) {
    const { dataUrl, ratio } = await renderCoverLetterImage(letter);
    if (result.resume) pdf.addPage();
    pdf.addImage(dataUrl, "JPEG", 0, 0, pageWidth, Math.min(pageWidth * ratio, pageHeight));
    result.coverLetter = true;
  }

  if (!result.resume && !result.coverLetter) return result;

  const name = data.personalDetails?.fullName?.trim() || "Bewerbung";
  triggerBlobDownload(pdf.output("blob"), `Bewerbungspaket_${name.replace(/\s+/g, "_")}.pdf`);
  return result;
}
