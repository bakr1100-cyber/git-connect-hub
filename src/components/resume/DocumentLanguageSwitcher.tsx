import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileType2, Check } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { SUPPORTED_LOCALES, localeFlags, localeNames, type Locale } from "@/lib/i18n/locales";

export function DocumentLanguageSwitcher({
  value,
  onChange,
  className,
}: {
  value: Locale;
  onChange: (next: Locale) => void;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={t("docLang.label")}
          className={className}
        >
          <FileType2 className="h-4 w-4 text-brand" />
          <span className="ml-1.5 hidden md:inline">
            {t("docLang.short")}: {localeNames[value]}
          </span>
          <span className="ml-1.5 md:hidden">{value.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("docLang.label")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => {
              if (code === value) return;
              onChange(code);
              toast.success(t("docLang.changed").replace("{language}", localeNames[code]), {
                description: t("docLang.changedHint"),
              });
            }}
            className={code === value ? "font-semibold" : undefined}
          >
            <span className="mr-2">{localeFlags[code]}</span>
            {localeNames[code]}
            {code === value && <Check className="ml-auto h-3.5 w-3.5 text-brand" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-xs leading-relaxed text-muted-foreground">
          {t("docLang.hint")}
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
