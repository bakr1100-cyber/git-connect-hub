import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ResumeData } from "@/lib/resume-types";
import { downloadApplicationPackagePdf } from "@/lib/package-export";

interface PackageDownloadButtonProps {
  data: ResumeData;
}

/** Downloads resume + cover letter as one ready-to-send PDF package. */
export function PackageDownloadButton({ data }: PackageDownloadButtonProps) {
  const [busy, setBusy] = useState(false);
  const runningRef = useRef(false);

  const handleClick = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setBusy(true);
    try {
      const result = await downloadApplicationPackagePdf(data);
      if (!result.resume && !result.coverLetter) {
        toast.error("Es konnte noch nichts erzeugt werden – bitte zuerst den Lebenslauf ausfüllen.");
      } else if (result.coverLetter) {
        toast.success("Paket-PDF erstellt: Lebenslauf + Anschreiben.");
      } else {
        toast.success("Paket-PDF erstellt: Lebenslauf (Anschreiben noch nicht geschrieben).");
      }
    } catch {
      toast.error("Der Download hat nicht geklappt. Bitte noch einmal versuchen.");
    } finally {
      runningRef.current = false;
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={busy}>
      {busy ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-1.5 h-4 w-4" />
      )}
      Komplettes Paket als PDF
    </Button>
  );
}
