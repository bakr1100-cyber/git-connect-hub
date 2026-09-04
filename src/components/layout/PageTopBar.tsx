import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/** Slim header for sub-pages so the sign-in control is reachable everywhere. */
export function PageTopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
          <FileText className="h-5 w-5 text-brand" />
          myCVonline.com
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
