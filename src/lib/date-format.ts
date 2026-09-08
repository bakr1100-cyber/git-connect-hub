// Deterministic date formatting helpers that render the same on server and client,
// avoiding hydration mismatches caused by toLocaleDateString locale differences.

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatMonthYear(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

export function formatMonthYearShort(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  return `${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDayMonthYear(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

export function formatYear(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  return String(date.getFullYear());
}
