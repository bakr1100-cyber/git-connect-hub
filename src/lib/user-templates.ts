import { supabase } from "@/integrations/supabase/client";

export const USER_TEMPLATE_BUCKET = "user-templates";
export const SELECTED_TEMPLATE_KEY = "custom-template-ref-v1";
export const ALLOWED_TEMPLATE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const MAX_TEMPLATE_BYTES = 10 * 1024 * 1024;

export interface UserTemplate {
  id: string;
  name: string;
  note: string | null;
  storage_path: string;
  mime_type: string;
  created_at: string;
}

export interface UserTemplateWithUrl extends UserTemplate {
  url: string | null;
}

async function signUrl(path: string) {
  const { data } = await supabase.storage.from(USER_TEMPLATE_BUCKET).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export async function listUserTemplates(): Promise<UserTemplateWithUrl[]> {
  const { data, error } = await supabase
    .from("user_templates")
    .select("id,name,note,storage_path,mime_type,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as UserTemplate[];
  return Promise.all(rows.map(async (row) => ({ ...row, url: await signUrl(row.storage_path) })));
}

export async function uploadUserTemplate(input: { name: string; note?: string; file: File; userId: string }) {
  const ext = input.file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${input.userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(USER_TEMPLATE_BUCKET)
    .upload(path, input.file, { contentType: input.file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("user_templates").insert({
    user_id: input.userId,
    name: input.name,
    note: input.note?.trim() ? input.note.trim() : null,
    storage_path: path,
    mime_type: input.file.type,
  });
  if (error) {
    await supabase.storage.from(USER_TEMPLATE_BUCKET).remove([path]);
    throw error;
  }
}

export async function deleteUserTemplate(template: UserTemplate) {
  const { error } = await supabase.from("user_templates").delete().eq("id", template.id);
  if (error) throw error;
  await supabase.storage.from(USER_TEMPLATE_BUCKET).remove([template.storage_path]);
}

export function getSelectedTemplateId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_TEMPLATE_KEY);
}

export function setSelectedTemplateId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(SELECTED_TEMPLATE_KEY, id);
  else window.localStorage.removeItem(SELECTED_TEMPLATE_KEY);
}
