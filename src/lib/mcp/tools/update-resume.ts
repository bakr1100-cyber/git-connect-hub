import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_resume",
  title: "Update resume",
  description: "Update sections of an existing resume owned by the signed-in user. Only the provided fields are changed.",
  inputSchema: {
    id: z.string().uuid().describe("Resume id."),
    personal_details: z.record(z.string(), z.unknown()).optional(),
    education: z.array(z.record(z.string(), z.unknown())).optional(),
    work_experience: z.array(z.record(z.string(), z.unknown())).optional(),
    skills: z.array(z.unknown()).optional(),
    languages: z.array(z.unknown()).optional(),
    cover_letter: z.string().optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
  },
  outputSchema: { resume: z.unknown() },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id, ...patch }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const fields = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    if (Object.keys(fields).length === 0) {
      return { content: [{ type: "text", text: "No fields to update" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.from("resumes").update(fields).eq("id", id).select().maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Resume not found" }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { resume: data } };
  },
});
