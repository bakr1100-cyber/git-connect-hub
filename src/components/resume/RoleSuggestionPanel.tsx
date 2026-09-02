import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { suggestExperience } from "@/lib/resume-ai.functions";
import { hasAiSession } from "@/lib/ai-auth";
import { rememberAuthReturnPath } from "@/lib/auth-return";

interface Props {
  position: string;
  company: string;
  language: "de" | "en" | "fr" | "es" | "it" | "nl" | "ar";
  onApply: (text: string) => void;
}

export function RoleSuggestionPanel({ position, company, language, onApply }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const suggest = useServerFn(suggestExperience);

  useEffect(() => {
    let cancelled = false;
    if (position.trim().length < 2) { setSuggestions([]); setError(null); return () => { cancelled = true; }; }
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        if (!(await hasAiSession())) { setAuthRequired(true); return; }
        setAuthRequired(false);
        const result = await suggest({ data: { position, company, language } });
        if (!cancelled) { setSuggestions(result.suggestions); setSelected([]); }
      } catch {
        if (!cancelled) setError("KI-Vorschläge konnten nicht geladen werden. Bitte versuche es erneut.");
      }
      finally { if (!cancelled) setLoading(false); }
    }, 650);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [position, company, language, retryVersion, suggest]);

  const toggle = (index: number) =>
    setSelected((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));

  if (!position.trim() || (!loading && !authRequired && !error && suggestions.length === 0)) return null;

  return (
    <div className="mb-3 rounded-xl border border-brand/25 bg-brand/5 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sparkles className="h-4 w-4 text-brand" />
        {loading ? <><Loader2 className="h-4 w-4 animate-spin text-brand" /> KI-Vorschläge werden erstellt …</> : authRequired ? <><Sparkles className="h-4 w-4 text-brand" /> KI-Vorschläge für {position}</> : <><Sparkles className="h-4 w-4 text-brand" /> KI-Vorschläge für {position}{company ? ` · ${company}` : ""}</>}
      </div>
      {authRequired ? <p className="mb-2 text-sm text-muted-foreground">Melde dich an, damit die KI passende Aufgaben und Erfolge für diesen Beruf erstellt. <Link to="/auth" onClick={() => rememberAuthReturnPath()} className="font-semibold text-brand underline-offset-2 hover:underline">Jetzt anmelden</Link></p> : error ? <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-destructive">{error}</p><Button type="button" size="sm" variant="outline" onClick={() => setRetryVersion((value) => value + 1)}>Erneut versuchen</Button></div> : <p className="mb-2 text-xs text-muted-foreground">Wähle passende Punkte aus. Danach formuliert die KI daraus deinen finalen Text.</p>}
      <div className="space-y-1.5">
        {suggestions.map((suggestion, index) => {
          const active = selected.includes(index);
          return (
            <button
              key={suggestion}
              type="button"
              onClick={() => toggle(index)}
              className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                active ? "border-brand bg-brand/10 text-foreground" : "border-transparent bg-background hover:border-brand/40"
              }`}
            >
              <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? "border-brand bg-brand text-brand-foreground" : "border-muted-foreground/50"}`}>
                {active && <Check className="h-3 w-3" />}
              </span>
              <span>{suggestion}</span>
            </button>
          );
        })}
      </div>
      <Button type="button" size="sm" className="mt-3" disabled={!selected.length} onClick={() => onApply(selected.map((index) => `• ${suggestions[index]}`).join("\n"))}>
        Auswahl in Beschreibung übernehmen
      </Button>
    </div>
  );
}
