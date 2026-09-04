import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import type { ResumeData } from "@/lib/resume-types";
import { downloadResumeWord } from "@/lib/resume-word-export";

interface WordExportButtonProps {
  data: ResumeData;
}

export function WordExportButton({ data }: WordExportButtonProps) {
  const { t } = useI18n();
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = () => {
    setIsExporting(true);
    try {
      downloadResumeWord(data);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-1.5 h-4 w-4" />
      )}
      {t("editor.downloadWord")}
    </Button>
  );
}
