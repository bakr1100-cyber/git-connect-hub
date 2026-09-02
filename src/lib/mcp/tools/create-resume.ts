import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_resume",
  title: "Create resume",
  description: "Create a new resume for the signed-in user from personal details and optional sections.",
  inputSchema: {
    personal_details: z.record(z.string(), z.unknown()).describe("Personal details object, e.g. { fullName, email, phone, city }."),
    education: z.array(z.record(z.string(), z.unknown())).optional().describe("Education entries."),
    work_experience: z.array(z.record(z.string(), z.unknown())).optional().describe("Work experience entries."),
    skills: z.array(z.unknown()).optional().describe("Skills."),
    languages: z.array(z.unknown()).optional().describe("Languages."),
    cover_letter: z.string().optional().describe("Cover letter text."),
    settings: z.record(z.string(), z.unknown()).optional().describe('Settings, e.g. { "language": "de", "template": "modern" }.'),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("resumes")
      .insert({ ...input, user_id: ctx.getUserId() })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { resume: data } };
  },
});
