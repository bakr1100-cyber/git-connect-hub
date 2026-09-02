import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listResumesTool from "./tools/list-resumes";
import getResumeTool from "./tools/get-resume";
import createResumeTool from "./tools/create-resume";
import updateResumeTool from "./tools/update-resume";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "git-connect-hub",
  title: "Git Connect Hub",
  version: "0.1.0",
  instructions:
    "Tools for the myCVonline.com resume builder. Use `list_resumes` and `get_resume` to read the signed-in user's resumes, `create_resume` to add one, and `update_resume` to change sections.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listResumesTool, getResumeTool, createResumeTool, updateResumeTool],
});
