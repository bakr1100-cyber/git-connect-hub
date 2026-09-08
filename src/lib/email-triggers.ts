import type { User } from "@supabase/supabase-js";
import { sendUnfinishedDocumentReminder, sendWelcomeEmail } from "@/lib/email.functions";
import type { ResumeData } from "@/lib/resume-types";

const WELCOME_FLAG_PREFIX = "welcome-email-v1-";
const REMINDER_KEY = "unfinished-doc-reminder-v1";
const DRAFT_KEY = "resume-draft-v1";
const REMINDER_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

/** Sendet die Willkommens-Mail einmalig nach der ersten Anmeldung eines neuen Kontos. */
export async function maybeSendWelcomeEmail(user: User): Promise<void> {
  try {
    const flag = `${WELCOME_FLAG_PREFIX}${user.id}`;
    if (localStorage.getItem(flag)) return;
    const createdAt = new Date(user.created_at).getTime();
    if (Date.now() - createdAt > 24 * 60 * 60 * 1000) return;
    localStorage.setItem(flag, new Date().toISOString());
    await sendWelcomeEmail();
  } catch (error) {
    console.warn("[email] welcome trigger failed", error);
  }
}

/** Erinnert höchstens einmal pro Woche an einen begonnenen, aber unfertigen Lebenslauf. */
export async function maybeSendUnfinishedReminder(): Promise<void> {
  try {
    const last = localStorage.getItem(REMINDER_KEY);
    if (last && Date.now() - new Date(last).getTime() < REMINDER_INTERVAL_MS) return;

    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw) as ResumeData;
    const unfinished =
      !draft.personalDetails?.fullName?.trim() ||
      !draft.workExperience?.length ||
      !draft.skills?.length;
    if (!unfinished) return;

    localStorage.setItem(REMINDER_KEY, new Date().toISOString());
    await sendUnfinishedDocumentReminder();
  } catch (error) {
    console.warn("[email] reminder trigger failed", error);
  }
}
