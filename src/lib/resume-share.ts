import { defaultResumeData, type ResumeData } from "@/lib/resume-types";
import { getAccent, resolveAccentId } from "@/lib/resume-accents";

/** Encodes resume data into a URL-safe base64 string (no server storage). */
export function encodeResumeShare(data: ResumeData): string {
  const json = JSON.stringify(withResolvedPalette(data));
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decodes a share payload back into resume data. Returns null when invalid. */
export function decodeResumeShare(payload: string): ResumeData | null {
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<ResumeData>;
    if (!parsed || typeof parsed !== "object" || !parsed.personalDetails) return null;
    return {
      ...defaultResumeData,
      ...parsed,
      personalDetails: { ...defaultResumeData.personalDetails, ...parsed.personalDetails },
      education: parsed.education ?? [],
      workExperience: parsed.workExperience ?? [],
      skills: parsed.skills ?? [],
      languages: parsed.languages ?? [],
      settings: { ...defaultResumeData.settings, ...(parsed.settings ?? {}) },
      extraSections: parsed.extraSections ?? [],
    };
  } catch {
    return null;
  }
}

/** Applies the effective palette (e.g. Tokyo's coral default) to the settings. */
export function withResolvedPalette(data: ResumeData): ResumeData {
  const accent = resolveAccentId(data.settings.template, data.settings.accent);
  return { ...data, settings: { ...data.settings, accent } };
}

/** Builds the absolute read-only share URL for the given resume, palette included. */
export function buildShareUrl(data: ResumeData, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  const resolved = withResolvedPalette(data);
  const params = new URLSearchParams({
    d: encodeResumeShare(resolved),
    p: getAccent(resolved.settings.accent).id,
  });
  return `${base}/share#${params.toString()}`;
}

/** Reads an explicit palette override (`#...&p=coral`) from a location hash. */
export function readSharePalette(hash: string): string | null {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(clean).get("p");
}

/** Reads the share payload from a location hash such as `#d=...`. */
export function readSharePayload(hash: string): string | null {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);
  return params.get("d");
}
