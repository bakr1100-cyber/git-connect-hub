import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Quote } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/hooks/useAuth";

interface AuthPanelProps {
  redirectPath?: string;
  onAuthenticated?: () => void;
}

export function AuthPanel({ redirectPath = "/editor", onAuthenticated }: AuthPanelProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await signInWithGoogle(redirectPath);
    if (error) {
      toast.error(error.message);
      setBusy(false);
    }
  };

  const handleEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error(t("auth.invalid"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await signUpWithEmail(email.trim(), password, redirectPath);
        if (error) throw error;
        if (data.session) {
          toast.success(t("auth.success"));
          onAuthenticated?.();
        } else {
          toast.success(t("auth.checkEmail"));
        }
      } else {
        const { error } = await signInWithEmail(email.trim(), password);
        if (error) throw error;
        toast.success(t("auth.success"));
        onAuthenticated?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-0 md:grid-cols-2">
      <div className="space-y-4 p-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold leading-tight tracking-tight text-foreground">
            {mode === "signup" ? t("auth.gateTitle") : t("auth.signInTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("auth.gateDesc")}</p>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("auth.google")}
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t("auth.or")}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3" onSubmit={handleEmail}>
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">{t("auth.email")}</Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="auth-password">{t("auth.password")}</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-brand font-semibold text-primary-foreground hover:bg-brand-dark"
            disabled={busy}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "signup" ? t("auth.register") : t("auth.signIn")}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {mode === "signup" ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
          <button
            type="button"
            className="font-semibold text-brand hover:underline"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? t("auth.signIn") : t("auth.register")}
          </button>
        </p>
      </div>

      <div className="hidden flex-col justify-center gap-4 bg-brand-soft p-6 md:flex">
        <Quote className="h-8 w-8 text-brand" />
        <p className="text-sm leading-relaxed text-foreground">{t("auth.testimonial")}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t("auth.testimonialAuthor")}
        </p>
      </div>
    </div>
  );
}
