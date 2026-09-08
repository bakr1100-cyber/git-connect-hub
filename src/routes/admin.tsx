import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageTopBar } from "@/components/layout/PageTopBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import {
  adminDeletePackage,
  adminListPackages,
  adminListPurchases,
  adminListUsers,
  adminResetAiUsage,
  adminSavePackage,
  adminSetEntitlement,
  adminStats,
  adminUpdatePurchase,
  amIAdmin,
  type AdminPackage,
  type AdminPurchase,
  type AdminStats,
  type AdminUser,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin-Panel: Pakete, Belege & Nutzer — myCVonline.com" },
      {
        name: "description",
        content:
          "Interne Verwaltung von Paketpreisen, Rechnungsdaten, Nutzerfreischaltungen und KI-Kontingenten.",
      },
      { property: "og:title", content: "Admin-Panel — myCVonline.com" },
      { property: "og:description", content: "Pakete, Belege, Nutzer und Statistiken verwalten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPanel,
});

function money(cents: number, currency = "EUR") {
  return `${(cents / 100).toFixed(2).replace(".", ",")} ${currency === "EUR" ? "€" : currency}`;
}

function dateStr(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
}

const EMPTY_PACKAGE: AdminPackage = {
  tier: "",
  name: "",
  amountCents: 990,
  currency: "EUR",
  days: 30,
  priceId: "",
  sortOrder: 99,
  isActive: true,
  isPopular: false,
};

function AdminPanel() {
  const { user, loading } = useAuth();
  const checkAdmin = useServerFn(amIAdmin);

  const isAdmin = useQuery({
    queryKey: ["am-i-admin"],
    queryFn: () => checkAdmin() as Promise<boolean>,
    enabled: !!user,
  });

  if (loading || (user && isAdmin.isLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <PageTopBar />
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Lade …
        </div>
      </div>
    );
  }

  if (!user || isAdmin.data !== true) {
    return (
      <div className="min-h-screen bg-background">
        <PageTopBar />
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-2xl font-bold">Kein Zugriff</h1>
          <p className="mt-2 text-muted-foreground">
            Dieser Bereich ist nur für Administratoren. Bitte melde dich mit deinem Admin-Konto an.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageTopBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin-Panel</h1>
        <p className="mt-1 text-muted-foreground">
          Pakete, Belege, Nutzer und Kontingente verwalten.
        </p>

        <Tabs defaultValue="stats" className="mt-6">
          <TabsList>
            <TabsTrigger value="stats">Statistiken</TabsTrigger>
            <TabsTrigger value="packages">Pakete</TabsTrigger>
            <TabsTrigger value="purchases">Belege</TabsTrigger>
            <TabsTrigger value="users">Nutzer</TabsTrigger>
          </TabsList>
          <TabsContent value="stats" className="mt-6">
            <StatsTab />
          </TabsContent>
          <TabsContent value="packages" className="mt-6">
            <PackagesTab />
          </TabsContent>
          <TabsContent value="purchases" className="mt-6">
            <PurchasesTab />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ stats */

function StatsTab() {
  const load = useServerFn(adminStats);
  const q = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => load() as Promise<AdminStats>,
    refetchInterval: 60_000,
  });
  const s = q.data;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Umsatz (bezahlt)" value={s ? money(s.revenueCents) : "…"} />
        <Metric label="Bezahlte Käufe" value={s ? String(s.purchaseCount) : "…"} />
        <Metric label="Aktive Freischaltungen" value={s ? String(s.activeUsers) : "…"} />
        <Metric label="Registrierte Nutzer" value={s ? String(s.totalUsers) : "…"} />
      </div>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paket</TableHead>
              <TableHead>Käufe</TableHead>
              <TableHead>Umsatz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(s?.perTier ?? []).map((t) => (
              <TableRow key={t.tier}>
                <TableCell className="font-medium">{t.tier}</TableCell>
                <TableCell>{t.count}</TableCell>
                <TableCell>{money(t.revenueCents)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

/* --------------------------------------------------------------- packages */

function PackagesTab() {
  const qc = useQueryClient();
  const load = useServerFn(adminListPackages);
  const save = useServerFn(adminSavePackage);
  const remove = useServerFn(adminDeletePackage);
  const [draft, setDraft] = useState<AdminPackage>(EMPTY_PACKAGE);

  const q = useQuery({
    queryKey: ["admin-packages"],
    queryFn: () => load() as Promise<AdminPackage[]>,
  });

  const saveRow = async (row: AdminPackage) => {
    try {
      await save({ data: row });
      toast.success(`Paket „${row.name}" gespeichert`);
      void qc.invalidateQueries({ queryKey: ["admin-packages"] });
      setDraft(EMPTY_PACKAGE);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    }
  };

  return (
    <div className="space-y-6">
      {(q.data ?? []).map((p) => (
        <PackageForm key={p.tier} value={p} onSave={saveRow} onDelete={async () => {
          await remove({ data: { tier: p.tier } });
          toast.success("Paket gelöscht");
          void qc.invalidateQueries({ queryKey: ["admin-packages"] });
        }} />
      ))}
      <div className="rounded-lg border border-dashed border-border p-4">
        <p className="mb-3 text-sm font-semibold">Neues Paket anlegen</p>
        <PackageForm value={draft} onSave={saveRow} isNew />
      </div>
    </div>
  );
}

function PackageForm({
  value,
  onSave,
  onDelete,
  isNew,
}: {
  value: AdminPackage;
  onSave: (p: AdminPackage) => Promise<void>;
  onDelete?: () => Promise<void>;
  isNew?: boolean;
}) {
  const [row, setRow] = useState<AdminPackage>(value);
  const set = <K extends keyof AdminPackage>(k: K, v: AdminPackage[K]) =>
    setRow((r) => ({ ...r, [k]: v }));

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Kennung">
          <Input value={row.tier} disabled={!isNew} onChange={(e) => set("tier", e.target.value)} />
        </Field>
        <Field label="Name">
          <Input value={row.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Preis (Cent)">
          <Input
            type="number"
            value={row.amountCents}
            onChange={(e) => set("amountCents", Number(e.target.value))}
          />
        </Field>
        <Field label="Laufzeit (Tage)">
          <Input type="number" value={row.days} onChange={(e) => set("days", Number(e.target.value))} />
        </Field>
        <Field label="Preis-ID">
          <Input value={row.priceId} onChange={(e) => set("priceId", e.target.value)} />
        </Field>
        <Field label="Reihenfolge">
          <Input
            type="number"
            value={row.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
        </Field>
        <Field label="Aktiv">
          <Switch checked={row.isActive} onCheckedChange={(v) => set("isActive", v)} />
        </Field>
        <Field label="Beliebteste Wahl">
          <Switch checked={row.isPopular} onCheckedChange={(v) => set("isPopular", v)} />
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" onClick={() => void onSave(row)}>
          <Save className="mr-1.5 h-4 w-4" /> {isNew ? "Anlegen" : "Speichern"}
        </Button>
        <span className="text-sm text-muted-foreground">{money(row.amountCents, row.currency)}</span>
        {onDelete && (
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => void onDelete()}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

/* -------------------------------------------------------------- purchases */

function PurchasesTab() {
  const qc = useQueryClient();
  const load = useServerFn(adminListPurchases);
  const update = useServerFn(adminUpdatePurchase);
  const q = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: () => load() as Promise<AdminPurchase[]>,
  });

  const patch = async (id: string, data: Record<string, unknown>) => {
    try {
      await update({ data: { id, ...data } as never });
      toast.success("Beleg aktualisiert");
      void qc.invalidateQueries({ queryKey: ["admin-purchases"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehlgeschlagen");
    }
  };

  return (
    <div className="space-y-3">
      <Button size="sm" variant="outline" onClick={() => void q.refetch()}>
        <RefreshCw className="mr-1.5 h-4 w-4" /> Aktualisieren
      </Button>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beleg</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Betrag</TableHead>
              <TableHead>Gültig bis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(q.data ?? []).map((p) => (
              <PurchaseRow key={p.id} purchase={p} onPatch={patch} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PurchaseRow({
  purchase,
  onPatch,
}: {
  purchase: AdminPurchase;
  onPatch: (id: string, data: Record<string, unknown>) => Promise<void>;
}) {
  const [invoiceNo, setInvoiceNo] = useState(purchase.invoiceNo);
  const [amount, setAmount] = useState(purchase.amountCents);
  const [expires, setExpires] = useState(purchase.expiresAt.slice(0, 10));

  return (
    <TableRow>
      <TableCell>
        <Input className="w-44" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
      </TableCell>
      <TableCell className="text-sm">{purchase.email ?? purchase.userId.slice(0, 8)}</TableCell>
      <TableCell>{purchase.tier}</TableCell>
      <TableCell>
        <Input
          className="w-24"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </TableCell>
      <TableCell>
        <Input
          className="w-36"
          type="date"
          value={expires}
          onChange={(e) => setExpires(e.target.value)}
        />
      </TableCell>
      <TableCell>
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          value={purchase.status}
          onChange={(e) => void onPatch(purchase.id, { status: e.target.value })}
        >
          <option value="pending">Offen</option>
          <option value="active">Bezahlt</option>
          <option value="failed">Fehlgeschlagen</option>
        </select>
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            void onPatch(purchase.id, { invoiceNo, amountCents: amount, expiresAt: expires })
          }
        >
          <Save className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

/* ------------------------------------------------------------------ users */

function UsersTab() {
  const qc = useQueryClient();
  const load = useServerFn(adminListUsers);
  const setEnt = useServerFn(adminSetEntitlement);
  const reset = useServerFn(adminResetAiUsage);
  const q = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => load() as Promise<AdminUser[]>,
  });
  const [filter, setFilter] = useState("");

  const rows = (q.data ?? []).filter((u) =>
    (u.email ?? "").toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <Input
        className="max-w-sm"
        placeholder="Nach E-Mail suchen …"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-Mail</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Gültig bis</TableHead>
              <TableHead>KI heute</TableHead>
              <TableHead>Zuweisen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.userId}>
                <TableCell className="text-sm">{u.email ?? u.userId.slice(0, 8)}</TableCell>
                <TableCell>
                  <Badge variant={u.tier === "free" ? "secondary" : "default"}>{u.tier}</Badge>
                </TableCell>
                <TableCell className="text-sm">{dateStr(u.expiresAt)}</TableCell>
                <TableCell className="text-sm">
                  {u.aiCalls} / {u.aiLimit}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await reset({ data: { userId: u.userId } });
                      toast.success("KI-Kontingent zurückgesetzt");
                      void qc.invalidateQueries({ queryKey: ["admin-users"] });
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
                <TableCell>
                  <select
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={u.tier ?? "free"}
                    onChange={async (e) => {
                      await setEnt({ data: { userId: u.userId, tier: e.target.value } });
                      toast.success("Paket zugewiesen");
                      void qc.invalidateQueries({ queryKey: ["admin-users"] });
                    }}
                  >
                    <option value="free">free</option>
                    <option value="standard">standard (30 T.)</option>
                    <option value="premium">premium (30 T.)</option>
                    <option value="unlimited6">unlimited6 (30 T.)</option>
                    <option value="unlimited12">unlimited12 (30 T.)</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
