import type { ResumeData } from "@/lib/resume-types";

export function ExtraSectionsBlock({ data }: { data: ResumeData }) {
  const sections = (data.extraSections ?? []).filter((s) => s.title.trim() || s.content.trim());
  if (sections.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {sections.map((section) => (
        <section key={section.id}>
          <h2 className="mb-2 text-[12pt] font-bold uppercase tracking-wider text-slate-900">{section.title}</h2>
          <p className="whitespace-pre-wrap text-[10pt] text-slate-700">{section.content}</p>
        </section>
      ))}
    </div>
  );
}
