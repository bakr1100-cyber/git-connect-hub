import { PACKAGES, type Receipt } from "@/lib/entitlements";

const SITE = "myCVonline.com";

function formatAmount(receipt: Receipt) {
  return `${(receipt.amountCents / 100).toFixed(2).replace(".", ",")} €`;
}

/** Erzeugt eine druckbare Rechnung als HTML-Datei und lädt sie herunter. */
export function downloadInvoice(receipt: Receipt) {
  const info = PACKAGES[receipt.tier];
  const name = receipt.tier === "premium" ? "Premium" : "Standard";
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>Rechnung ${receipt.id}</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#1e293b;max-width:700px;margin:40px auto;padding:0 24px}
h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:24px}
td,th{border-bottom:1px solid #e2e8f0;padding:10px;text-align:left;font-size:14px}
.total{font-size:18px;font-weight:bold}
.muted{color:#64748b;font-size:12px;margin-top:32px}
</style></head><body>
<h1>Rechnung ${receipt.id}</h1>
<p>${SITE}</p>
<table>
<tr><th>Position</th><th>Zeitraum</th><th>Betrag</th></tr>
<tr><td>Bewerbungspaket ${name}</td><td>${info.days} Tage · gültig bis ${new Date(receipt.expiresAt).toLocaleDateString("de-DE")}</td><td>${formatAmount(receipt)}</td></tr>
<tr><td colspan="2" class="total">Gesamt</td><td class="total">${formatAmount(receipt)}</td></tr>
</table>
<p class="muted">Rechnungsdatum: ${new Date(receipt.purchasedAt).toLocaleString("de-DE")}<br>
Kleinunternehmerregelung: Es wird keine Umsatzsteuer ausgewiesen.</p>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Rechnung-${receipt.id}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatReceiptAmount(receipt: Receipt) {
  return formatAmount(receipt);
}
