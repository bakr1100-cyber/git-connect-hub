import type { TranslationKey } from "./i18n/de";

/**
 * Maps a failed AI server-function call to a user-facing translation key.
 * Quota/auth failures get a specific message, everything else the fallback.
 */
export function aiErrorKey(error: unknown, fallback: TranslationKey): TranslationKey {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (message.includes("AI_RATE_LIMIT")) return "ai.limit.tooFast";
  if (message.includes("AI_DAILY_LIMIT")) return "ai.limit.daily";
  if (
    message.includes("AI_AUTH_REQUIRED") ||
    message.includes("Unauthorized") ||
    message.includes("401")
  ) {
    return "ai.limit.auth";
  }
  return fallback;
}
