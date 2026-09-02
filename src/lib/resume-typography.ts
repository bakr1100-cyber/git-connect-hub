export interface FontStylePreset {
  id: string;
  /** CSS font-family stack applied to the whole document. */
  stack: string;
}

export const fontStylePresets: FontStylePreset[] = [
  { id: "modern", stack: '"Inter", "Helvetica Neue", Arial, sans-serif' },
  { id: "elegant", stack: 'Georgia, "Times New Roman", serif' },
  { id: "classic", stack: '"Times New Roman", Times, serif' },
  { id: "technical", stack: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace' },
];

export const fontScales = [0.9, 1, 1.1] as const;

export function getFontStack(id?: string) {
  return (fontStylePresets.find((preset) => preset.id === id) ?? fontStylePresets[0]!).stack;
}

export function clampSpacing(value: number) {
  return Math.min(2, Math.max(1, Math.round(value * 10) / 10));
}
