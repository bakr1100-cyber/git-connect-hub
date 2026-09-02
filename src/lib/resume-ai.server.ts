import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import type { CoverLetterPayload } from "./resume-ai.schemas";
import { localeLanguageNames, type Locale } from "./i18n/locales";
import {
  AI_QUOTA_BYPASS_DURING_BUILD,
  consumeAiQuota,
  developmentAiQuota,
  type AiAction,
} from "./ai-quota.server";

const MODEL = "google/gemini-3.7-flash";

function gateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY fehlt");
  return createLovableAiGatewayProvider(key);
}

function languageName(locale: Locale) {
  return localeLanguageNames[locale] ?? "German";
}

export async function runOptimize(data: {
  text: string;
  language: Locale;
  context?: string | undefined;
}) {
  const target = languageName(data.language);
  const result = await generateText({
    model: gateway()(MODEL),
    system:
      "You are an experienced career coach who rewrites CV entries so they are professional, concise and ATS-friendly. " +
      "Use strong action verbs and keep it to 2-4 bullet points. Return only the rewritten text. " +
      "FACTUAL INTEGRITY IS MANDATORY: preserve every person name, employer, location, date, year range, number, qualification and technology exactly. " +
      "Never infer, correct, shorten or invent facts. If a date is written as 2008-2012, the output must contain exactly 2008-2012. " +
      "If a fact is unclear, keep the original wording instead of guessing.",
    prompt: `Context: ${data.context || "Work experience"}\n\nOriginal text (facts must remain unchanged):\n${data.text}\n\nWrite the result in ${target}.\n\nRewrite only the wording professionally; do not change any facts, dates or numbers.`,
  });
  return { text: result.text };
}

export async function runTranslate(data: { text: string; targetLanguage: Locale }) {
  const target = languageName(data.targetLanguage);
  const result = await generateText({
    model: gateway()(MODEL),
    system:
      "You translate CV and cover-letter content professionally. Keep formatting and bullet points, adapt professional terminology to the target language. Return only the translation.",
    prompt: `Translate the following text into ${target}. Preserve every name, employer, location, date, year range, number, qualification and technology exactly; do not translate or alter factual values. Keep the original formatting and bullet points. Return only the translation.\n\n${data.text}`,
  });
  return { text: result.text };
}

export async function runCoverLetter(data: CoverLetterPayload) {
  const target = languageName(data.resume.settings.language as Locale);
  const experience = data.resume.workExperience
    .map((w) => `- ${w.position} at ${w.company}: ${w.description}`)
    .join("\n");
  const education = data.resume.education
    .map((e) => `- ${e.degree} at ${e.institution}`)
    .join("\n");

  const prompt = `Write a professional cover letter entirely in ${target} for the position "${
    data.resume.settings.targetPosition || "the advertised position"
  }" at ${data.company}.\n\nCandidate: ${data.resume.personalDetails.fullName}\nEmail: ${
    data.resume.personalDetails.email
  }\nPhone: ${data.resume.personalDetails.phone}\nLocation: ${
    data.resume.personalDetails.location
  }\n\nExperience:\n${experience}\n\nEducation:\n${education}${
    data.jobDescription ? `\n\nJob description:\n${data.jobDescription}` : ""
  }\n\nUse a modern, confident tone, follow the conventions of business letters in ${target}, and keep it to one page. Return only the letter text.`;

  const result = await generateText({
    model: gateway()(MODEL),
    system:
      "You are an experienced application coach. You write cover letters that are personalised, persuasive and tailored to the employer. Avoid clichés and highlight relevant experience.",
    prompt,
  });
  return { text: result.text };
}

export async function runTranscribe(data: { audioBase64: string; mimeType: string }) {
  const result = await generateText({
    model: gateway()(MODEL),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Transcribe the following audio recording verbatim. The language may be German, French, English, Spanish, Italian, Dutch or Moroccan Arabic (Darija). Return only the transcribed text.",
          },
          { type: "file", data: data.audioBase64, mediaType: data.mimeType },
        ],
      },
    ],
  });
  return { text: result.text };
}

export async function runParseResume(data: { text: string; language: Locale }) {
  const target = languageName(data.language);
  const result = await generateText({
    model: gateway()(MODEL),
    system:
      "You extract structured CV data from raw text. Answer with valid JSON only, no markdown fences, no commentary.",
    prompt: `Extract the CV below into this exact JSON shape:
{"personalDetails":{"fullName":"","dateOfBirth":"","email":"","phone":"","location":"","linkedin":"","website":"","summary":""},
"workExperience":[{"position":"","company":"","location":"","startDate":"YYYY-MM","endDate":"YYYY-MM or empty when current","description":""}],
"education":[{"degree":"","institution":"","location":"","startDate":"YYYY-MM","endDate":"","description":""}],
"skills":[{"name":""}],
"languages":[{"name":"","level":"native|fluent|advanced|intermediate|beginner"}]}

Keep the wording in ${target}. Use empty strings for unknown values. Never invent facts.

CV text:
${data.text}`,
  });

  const raw = result.text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    JSON.parse(raw);
  } catch {
    throw new Error("Resume parsing failed");
  }
  return { json: raw };
}

export async function runExperienceSuggestions(data: {
  position: string;
  company?: string | undefined;
  language: Locale;
}) {
  const target = languageName(data.language);
  const result = await generateText({
    model: gateway()(MODEL),
    system:
      "You are a career coach helping a CV writer. Generate realistic, role-specific bullet point ideas. " +
      'Return valid JSON only in the shape {"suggestions":["..."]}. Return exactly 6 concise suggestions in the requested language. ' +
      "Do not invent the candidate's employers, dates, metrics or achievements; phrase ideas so the user can confirm and adapt them.",
    prompt: `Role: ${data.position}\nCompany (optional context): ${data.company || "not provided"}\nLanguage: ${target}\n\nGenerate six distinct CV bullet-point ideas covering typical responsibilities, tools or outcomes for this role.`,
  });
  const raw = result.text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    const parsed = JSON.parse(raw) as { suggestions?: unknown };
    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length < 1)
      throw new Error("invalid suggestions");
    return {
      suggestions: parsed.suggestions
        .filter((item): item is string => typeof item === "string")
        .slice(0, 6),
    };
  } catch {
    throw new Error("Experience suggestions failed");
  }
}

export async function runComposeExperience(data: {
  position: string;
  company?: string | undefined;
  location?: string | undefined;
  sourceText: string;
  selectedSuggestions: string[];
  language: Locale;
}) {
  const target = languageName(data.language);
  const evidence = [
    data.position,
    data.company,
    data.location,
    data.sourceText,
    ...data.selectedSuggestions,
  ]
    .filter(Boolean)
    .join("\n");
  const knownNumbers = new Set(evidence.match(/\p{N}+(?:[.,]\p{N}+)?%?/gu) ?? []);
  const containsNewNumber = (text: string) =>
    (text.match(/\p{N}+(?:[.,]\p{N}+)?%?/gu) ?? []).some((token) => !knownNumbers.has(token));

  const createDescription = async (strictRetry = false) => {
    const result = await generateText({
      model: gateway()(MODEL),
      system:
        "You are an experienced CV writer. Turn only the candidate's confirmed notes into concise, ATS-friendly bullet points. " +
        "Use strong action verbs, avoid repetition, and return only 3-5 bullet points. Never invent dates, employers, locations, tools, numbers, metrics or achievements. " +
        "Suggestions were explicitly selected by the user and may be incorporated, but no factual detail may be added beyond the supplied evidence." +
        (strictRetry
          ? " A previous answer failed fact validation. Do not introduce any number or factual named entity that is absent from the evidence."
          : ""),
      prompt: `Target language: ${target}\nRole: ${data.position}\nCompany: ${data.company || "not provided"}\nLocation: ${data.location || "not provided"}\n\nCandidate's editable notes:\n${data.sourceText}\n\nConfirmed suggestion ideas:\n${data.selectedSuggestions.join("\n") || "none"}\n\nCreate one coherent final CV description. Preserve all supplied facts exactly.`,
    });
    return result.text.trim();
  };

  let text = await createDescription();
  if (containsNewNumber(text)) text = await createDescription(true);
  if (containsNewNumber(text)) throw new Error("AI_FACT_VALIDATION_FAILED");
  return { text };
}

// --- quota / abuse protection -------------------------------------------------

export async function guardAi(supabase: Parameters<typeof consumeAiQuota>[0], action: AiAction) {
  return consumeAiQuota(supabase, action);
}

export async function readAiUsage(supabase: Parameters<typeof consumeAiQuota>[0], userId: string) {
  if (AI_QUOTA_BYPASS_DURING_BUILD) return developmentAiQuota();

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: usage }, { data: entitlement }] = await Promise.all([
    supabase
      .from("ai_usage")
      .select("calls, cost_units")
      .eq("user_id", userId)
      .eq("usage_date", today)
      .maybeSingle(),
    supabase.from("user_entitlements").select("tier").eq("user_id", userId).maybeSingle(),
  ]);
  const tier = (entitlement?.tier as string | undefined) ?? "free";
  const limit = tier === "premium" ? 60 : tier === "standard" ? 20 : 3;
  const used = (usage?.calls as number | undefined) ?? 0;
  return { tier, used, limit, remaining: Math.max(limit - used, 0) };
}
