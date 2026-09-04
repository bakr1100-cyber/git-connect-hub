import { Link } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { rememberAuthReturnPath } from "@/lib/auth-return";

/**
 * Sign-in / sign-out control shown in every page header.
 * Being visible everywhere is intentional: an account is what unlocks the paid features.
 */
export function AuthButton({ variant = "default" }: { variant?: "default" | "onDark" }) {
  const { isAuthenticated, loading, signOut } = useAuth();
  const { t } = useI18n();

  if (loading) return null;

  if (isAuthenticated) {
    return (
      <Button
        size="sm"
        variant={variant === "onDark" ? "ghost" : "outline"}
        className={variant === "onDark" ? "text-white hover:bg-white/10 hover:text-white" : undefined}
        onClick={() => void signOut().then(() => toast.success(t("auth.signOut")))}
      >
        <LogOut className="mr-1.5 h-4 w-4" />
        {t("auth.signOut")}
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="sm"
      className={
        variant === "onDark"
          ? "bg-white/10 text-white hover:bg-white/20"
          : "bg-brand text-primary-foreground hover:bg-brand/90"
      }
    >
      <Link to="/auth" onClick={() => rememberAuthReturnPath()}>
        <LogIn className="mr-1.5 h-4 w-4" />
        {t("nav.signIn")}
      </Link>
    </Button>
  );
}
