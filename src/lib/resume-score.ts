import type { ResumeData } from "@/lib/resume-types";
import type { TranslationKey } from "@/lib/i18n/de";

export interface ResumeScoreResult {
  score: number;
  tips: TranslationKey[];
}

/**
 * Local, deterministic completeness score used for the live resume feedback.
 * No AI call — instant feedback while typing.
 */
export function calculateResumeScore(data: ResumeData): ResumeScoreResult {
  const tips: TranslationKey[] = [];
  let score = 0;

  const p = data.personalDetails;

  // Basics (25)
  if (p.fullName.trim()) score += 10;
  const contactFields = [p.email, p.phone, p.location].filter((v) => v.trim()).length;
  score += contactFields * 5;
  if (contactFields < 3) tips.push("score.tip.contact");

  // Summary (15)
  const summary = (p.summary || "").trim();
  if (summary.length >= 200) score += 15;
  else if (summary.length >= 80) score += 9;
  if (summary.length < 200) tips.push("score.tip.summary");

  // Work experience (25)
  const withDescription = data.workExperience.filter((w) => w.description.trim().length >= 60).length;
  score += Math.min(data.workExperience.length, 2) * 6;
  score += Math.min(withDescription, 2) * 6.5;
  if (data.workExperience.length < 2 || withDescription < 2) tips.push("score.tip.experience");

  // Education (13)
  if (data.education.length >= 1) score += 8;
  if (data.education.length >= 2) score += 5;
  if (data.education.length === 0) tips.push("score.tip.education");

  // Skills (12)
  score += Math.min(data.skills.length, 5) * 2.4;
  if (data.skills.length < 5) tips.push("score.tip.skills");

  // Languages (7)
  score += Math.min(data.languages.length, 2) * 3.5;
  if (data.languages.length < 2) tips.push("score.tip.languages");

  // Photo (3)
  if (p.photo) score += 3;
  else tips.push("score.tip.photo");

  return { score: Math.max(0, Math.min(100, Math.round(score))), tips };
}
