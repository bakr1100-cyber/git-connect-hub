import { supabase } from "@/integrations/supabase/client";
import { defaultResumeData, type ResumeData } from "@/lib/resume-types";

interface ResumeRow {
  id: string;
  personal_details: unknown;
  education: unknown;
  work_experience: unknown;
  skills: unknown;
  languages: unknown;
  settings: unknown;
  cover_letter: string | null;
  updated_at: string;
}

function toResumeData(row: ResumeRow): ResumeData {
  const settings = (row.settings as ResumeData["settings"]) ?? defaultResumeData.settings;
  return {
    ...defaultResumeData,
    personalDetails: { ...defaultResumeData.personalDetails, ...(row.personal_details as object) },
    education: (row.education as ResumeData["education"]) ?? [],
    workExperience: (row.work_experience as ResumeData["workExperience"]) ?? [],
    skills: (row.skills as ResumeData["skills"]) ?? [],
    languages: (row.languages as ResumeData["languages"]) ?? [],
    settings: { ...defaultResumeData.settings, ...settings },
    coverLetter: row.cover_letter ?? "",
    extraSections: ((settings as { extraSections?: ResumeData["extraSections"] })?.extraSections) ?? [],
  };
}

/** Loads the most recently updated resume of the signed-in user. */
export async function loadRemoteResume(): Promise<{ id: string; data: ResumeData; updatedAt: string } | null> {
  const { data: rows, error } = await supabase
    .from("resumes")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error || !rows || rows.length === 0) return null;
  const row = rows[0] as unknown as ResumeRow;
  return { id: row.id, data: toResumeData(row), updatedAt: row.updated_at };
}

/** Creates or updates the user's resume row. Returns the row id. */
export async function saveRemoteResume(userId: string, data: ResumeData, id?: string): Promise<string | null> {
  const payload = {
    user_id: userId,
    personal_details: data.personalDetails as unknown as never,
    education: data.education as unknown as never,
    work_experience: data.workExperience as unknown as never,
    skills: data.skills as unknown as never,
    languages: data.languages as unknown as never,
    settings: { ...data.settings, extraSections: data.extraSections ?? [] } as unknown as never,
    cover_letter: data.coverLetter ?? null,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase.from("resumes").update(payload).eq("id", id);
    if (error) return null;
    return id;
  }

  const { data: inserted, error } = await supabase.from("resumes").insert(payload).select("id").single();
  if (error || !inserted) return null;
  return (inserted as { id: string }).id;
}

export function isEmptyResume(data: ResumeData): boolean {
  return (
    !data.personalDetails.fullName &&
    !data.personalDetails.email &&
    data.education.length === 0 &&
    data.workExperience.length === 0 &&
    data.skills.length === 0
  );
}
