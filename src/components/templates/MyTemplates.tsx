import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Check, ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { templateCopy } from "./templateCopy";
import { cn } from "@/lib/utils";
import {
  ALLOWED_TEMPLATE_TYPES,
  MAX_TEMPLATE_BYTES,
  deleteUserTemplate,
  getSelectedTemplateId,
  listUserTemplates,
  setSelectedTemplateId,
  uploadUserTemplate,
  type UserTemplateWithUrl,
} from "@/lib/user-templates";

export function MyTemplates() {
  const { locale, dir } = useI18n();
  const c = templateCopy(locale);
  const { user, loading } = useAuth();

  const [items, setItems] = useState<UserTemplateWithUrl[]>([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setItems(await listUserTemplates());
    } catch {
      toast.error(c.failed);
    }
  }, [c.failed]);

  useEffect(() => {
    setSelected(getSelectedTemplateId());
    if (user) void refresh();
  }, [user, refresh]);

  const submit = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error(c.errName);
      return;
    }
    if (!file) {
      toast.error(c.errFile);
      return;
    }
    if (!ALLOWED_TEMPLATE_TYPES.includes(file.type)) {
      toast.error(c.errType);
      return;
    }
    if (file.size > MAX_TEMPLATE_BYTES) {
      toast.error(c.errSize);
      return;
    }

    setBusy(true);
    try {
      await uploadUserTemplate({ name: name.trim(), note, file, userId: user.id });
      setName("");
      setNote("");
      setFile(null);
      await refresh();
      toast.success(c.saved);
    } catch {
      toast.error(c.failed);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: UserTemplateWithUrl) => {
    try {
      await deleteUserTemplate(item);
      if (selected === item.id) {
        setSelectedTemplateId(null);
        setSelected(null);
      }
      await refresh();
      toast.success(c.deleted);
    } catch {
      toast.error(c.failed);
    }
  };

  const select = (id: string) => {
    const next = selected === id ? null : id;
    setSelectedTemplateId(next);
    setSelected(next);
  };

  return (
    <div dir={dir} className="mx-auto w-full max-w-5xl px-4 py-10 lg:px-6">
      <Link to="/editor" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {c.backEditor}
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{c.title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{c.subtitle}</p>

      {!user && !loading ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">{c.loginTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{c.loginText}</p>
          <Button asChild className="mt-4 bg-brand text-primary-foreground hover:bg-brand-dark">
            <Link to="/auth">{c.login}</Link>
          </Button>
        </div>
      ) : (
        <>
          <section className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-name">{c.name}</Label>
                <Input id="tpl-name" value={name} placeholder={c.namePlaceholder} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-file">{c.file}</Label>
                <Input
                  id="tpl-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-note">{c.note}</Label>
              <Textarea id="tpl-note" value={note} placeholder={c.notePlaceholder} rows={2} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button onClick={submit} disabled={busy} className="bg-cta font-semibold text-cta-foreground hover:bg-cta/90">
              <Upload className="mr-1.5 h-4 w-4" />
              {busy ? c.uploading : c.upload}
            </Button>
          </section>

          {items.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {c.empty}
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const isActive = item.id === selected;
                return (
                  <article
                    key={item.id}
                    className={cn(
                      "overflow-hidden rounded-xl border-2 bg-card",
                      isActive ? "border-brand shadow-md" : "border-border"
                    )}
                  >
                    <div className="relative flex h-[220px] items-center justify-center bg-muted/40">
                      {item.mime_type === "application/pdf" || !item.url ? (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileText className="h-10 w-10" />
                          <span className="text-xs">{c.pdf}</span>
                        </div>
                      ) : (
                        <img src={item.url} alt={item.name} loading="lazy" className="h-full w-full object-contain" />
                      )}
                      {isActive && (
                        <Badge className="absolute left-2 top-2 bg-brand text-primary-foreground hover:bg-brand">
                          <Check className="mr-1 h-3 w-3" />
                          {c.selected}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 border-t border-border p-3">
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button size="sm" variant={isActive ? "secondary" : "default"} onClick={() => select(item.id)}>
                          {isActive ? c.selected : c.select}
                        </Button>
                        {item.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={item.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                              {c.open}
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => remove(item)} aria-label={c.remove}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
