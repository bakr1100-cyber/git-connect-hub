export interface AccentPreset {
  id: string;
  /** Solid accent colour (used for headers, bullets, badges). */
  color: string;
  /** Very light tint of the accent (used for sidebars). */
  soft: string;
  /** Stronger pastel tint used for watercolour washes (Tokyo template). */
  wash: string;
}

export const accentPresets: AccentPreset[] = [
  { id: "slate", color: "#0f172a", soft: "#f1f5f9", wash: "#c7d2dd" },
  { id: "petrol", color: "#0f766e", soft: "#eef8f6", wash: "#9fd8ce" },
  { id: "navy", color: "#1e3a8a", soft: "#eef2fd", wash: "#b3c4f2" },
  { id: "burgundy", color: "#7f1d3a", soft: "#fdf0f4", wash: "#eab3c4" },
  { id: "forest", color: "#166534", soft: "#eff8f0", wash: "#a9d8b2" },
  { id: "violet", color: "#5b21b6", soft: "#f4f0fe", wash: "#c9b6f5" },
  { id: "coral", color: "#c2504a", soft: "#fbd9d1", wash: "#f3b3a4" },
];

export const defaultAccentId = "slate";

export function getAccent(id?: string): AccentPreset {
  return accentPresets.find((preset) => preset.id === id) ?? accentPresets[0]!;
}

/**
 * Resolves the accent that is actually rendered for a template.
 * Tokyo lives from its watercolour washes and falls back to coral.
 */
export function resolveAccentId(template?: string, accent?: string): string {
  if (template === "tokyo" && (!accent || accent === "slate")) return "coral";
  return accent ?? defaultAccentId;
}
