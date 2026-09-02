import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CoverLetterInput,
  OptimizeInput,
  ParseResumeInput,
  TranscribeInput,
  TranslateInput,
  ExperienceSuggestionsInput,
  ComposeExperienceInput,
} from "./resume-ai.schemas";

export const optimizeText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => OptimizeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { guardAi } = await import("./resume-ai.server");
    const quota = await guardAi(context.supabase, "optimize");
    const { runOptimize } = await import("./resume-ai.server");
    return { ...(await runOptimize(data)), quota };
  });

export const translateText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { guardAi, runTranslate } = await import("./resume-ai.server");
    const quota = await guardAi(context.supabase, "translate");
    return { ...(await runTranslate(data)), quota };
  });

export const generateCoverLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CoverLetterInput.parse(input))
  .handler(async ({ data, context }) => {
    const { guardAi, runCoverLetter } = await import("./resume-ai.server");
    const quota = await guardAi(context.supabase, "coverLetter");
    return { ...(await runCoverLetter(data)), quota };
  });

export const transcribeAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TranscribeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { guardAi, runTranscribe } = await import("./resume-ai.server");
    const quota = await guardAi(context.supabase, "transcribe");
    return { ...(await runTranscribe(data)), quota };
  });

export const parseResumeText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ParseResumeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { guardAi, runParseResume } = await import("./resume-ai.server");
    const quota = await guardAi(context.supabase, "parseResume");
    return { ...(await runParseResume(data)), quota };
  });

export const suggestExperience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ExperienceSuggestionsInput.parse(input))
  .handler(async ({ data, context }) => {
    const { guardAi, runExperienceSuggestions } = await import("./resume-ai.server");
    const quota = await guardAi(context.supabase, "optimize");
    return { ...(await runExperienceSuggestions(data)), quota };
  });

export const composeExperienceDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ComposeExperienceInput.parse(input))
  .handler(async ({ data, context }) => {
    const { guardAi, runComposeExperience } = await import("./resume-ai.server");
    const quota = await guardAi(context.supabase, "optimize");
    return { ...(await runComposeExperience(data)), quota };
  });

export const getAiUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { readAiUsage } = await import("./resume-ai.server");
    return readAiUsage(context.supabase, context.userId);
  });
