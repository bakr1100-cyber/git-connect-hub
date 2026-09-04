import { supabase } from "@/integrations/supabase/client";
import type { ResumeData } from "@/lib/resume-types";

export interface ApplicantProfile {
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  nationality: string;
  email: string;
  phone: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  linkedin: string;
  website: string;
  photo_url: string | null;
  summary: string;
  target_position: string;
  salary_expectation: string;
  earliest_start_date: string | null;
  drivers_license: string;
  willing_to_relocate: boolean;
  work_permit: string;
  preferred_language: string;
}

export const emptyProfile: ApplicantProfile = {
  first_name: "",
  last_name: "",
  date_of_birth: null,
  nationality: "",
  email: "",
  phone: "",
  street: "",
  postal_code: "",
  city: "",
  country: "",
  linkedin: "",
  website: "",
  photo_url: null,
  summary: "",
  target_position: "",
  salary_expectation: "",
  earliest_start_date: null,
  drivers_license: "",
  willing_to_relocate: false,
  work_permit: "",
  preferred_language: "de",
};

export async function loadApplicantProfile(): Promise<ApplicantProfile | null> {
  const { data, error } = await supabase
    .from("applicant_profiles")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...emptyProfile, ...(data as unknown as ApplicantProfile) };
}

export async function saveApplicantProfile(
  userId: string,
  profile: ApplicantProfile,
): Promise<void> {
  const payload = {
    ...profile,
    user_id: userId,
    date_of_birth: profile.date_of_birth || null,
    earliest_start_date: profile.earliest_start_date || null,
  };
  const { error } = await supabase
    .from("applicant_profiles")
    .upsert(payload as never, { onConflict: "user_id" });
  if (error) throw error;
}

/** Profildaten in den Lebenslauf-Editor übernehmen. */
export function applyProfileToResume(profile: ApplicantProfile, prev: ResumeData): ResumeData {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  const location = [profile.postal_code, profile.city].filter(Boolean).join(" ").trim();
  return {
    ...prev,
    personalDetails: {
      ...prev.personalDetails,
      fullName: fullName || prev.personalDetails.fullName,
      dateOfBirth: profile.date_of_birth ?? prev.personalDetails.dateOfBirth,
      email: profile.email || prev.personalDetails.email,
      phone: profile.phone || prev.personalDetails.phone,
      location: [location, profile.country].filter(Boolean).join(", ") || prev.personalDetails.location,
      linkedin: profile.linkedin || prev.personalDetails.linkedin,
      website: profile.website || prev.personalDetails.website,
      summary: profile.summary || prev.personalDetails.summary,
      photo: profile.photo_url ?? prev.personalDetails.photo,
    },
    settings: {
      ...prev.settings,
      targetPosition: profile.target_position || prev.settings.targetPosition,
    },
  };
}

/** Daten aus dem Editor zurück ins Profil schreiben. */
export function profileFromResume(profile: ApplicantProfile, data: ResumeData): ApplicantProfile {
  const parts = data.personalDetails.fullName.trim().split(" ");
  return {
    ...profile,
    first_name: parts[0] ?? profile.first_name,
    last_name: parts.slice(1).join(" ") || profile.last_name,
    date_of_birth: data.personalDetails.dateOfBirth || profile.date_of_birth,
    email: data.personalDetails.email || profile.email,
    phone: data.personalDetails.phone || profile.phone,
    city: data.personalDetails.location || profile.city,
    linkedin: data.personalDetails.linkedin || profile.linkedin,
    website: data.personalDetails.website || profile.website,
    summary: data.personalDetails.summary || profile.summary,
    photo_url: data.personalDetails.photo ?? profile.photo_url,
    target_position: data.settings.targetPosition || profile.target_position,
    preferred_language: data.settings.language,
  };
}
