import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, Languages, Wand2, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { optimizeText, translateText } from "@/lib/resume-ai.functions";
import { toast } from "sonner";
import { aiErrorKey } from "@/lib/ai-errors";
import { hasAiSession } from "@/lib/ai-auth";
import { trackAiAction } from "@/lib/ai-cost";
import { useI18n } from "@/lib/i18n";
import { SUPPORTED_LOCALES, localeFlags, localeNames, type Locale } from "@/lib/i18n/locales";

interface AIAssistButtonProps {
  text: string;
  language: Locale;
  context?: string;
  onResult: (text: string) => void;
  disabled?: boolean;
}

export function AIAssistButton({ text, language, context, onResult, disabled }: AIAssistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { t } = useI18n();
  const optimize = useServerFn(optimizeText);
  const translate = useServerFn(translateText);

  const handleOptimize = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      if (!(await hasAiSession())) throw new Error("AI_AUTH_REQUIRED");
      const result = await optimize({ data: { text, language, context } });
      trackAiAction("optimize");
      setSuggestion(result.text);
      toast.success(t("ai.optimized"));
    } catch (error) {
      toast.error(t(aiErrorKey(error, "ai.optimizeFailed")));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (targetLanguage: Locale) => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      if (!(await hasAiSession())) throw new Error("AI_AUTH_REQUIRED");
      const result = await translate({ data: { text, targetLanguage } });
      trackAiAction("translate");
      setSuggestion(result.text);
      toast.success(t("ai.translated"));
    } catch (error) {
      toast.error(t(aiErrorKey(error, "ai.translateFailed")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 bottom-2 h-8 w-8"
          disabled={disabled || isLoading || !text.trim()}
          type="button"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleOptimize}>
          <Wand2 className="mr-2 h-4 w-4" />
          {t("ai.optimize")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">
          <Languages className="mr-1 inline h-3 w-3" />
          {t("ai.translate")}
        </div>
        {SUPPORTED_LOCALES.map((code) => (
          <DropdownMenuItem key={code} onClick={() => handleTranslate(code)}>
            <span className="mr-2">{localeFlags[code]}</span>
            {localeNames[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
      </DropdownMenu>
      {suggestion && (
        <div className="absolute right-0 bottom-10 z-30 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-brand/30 bg-background p-3 shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">KI-Vorschlag</p>
          <p className="max-h-32 overflow-y-auto whitespace-pre-wrap text-sm text-foreground">{suggestion}</p>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setSuggestion(null)}>{t("form.delete")}</Button>
            <Button type="button" size="sm" onClick={() => { onResult(suggestion); setSuggestion(null); }}>{t("import.button")}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
