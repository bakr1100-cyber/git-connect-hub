import { useCallback, useEffect, useState } from "react";

/**
 * Client-side estimate of AI cost per resume.
 * Counts the AI actions used for the current resume and converts them into
 * an approximate EUR amount, so the user sees the expected cost before
 * saving or downloading.
 */

export type AiCostAction = "optimize" | "translate" | "coverLetter" | "transcribe" | "parseResume";

/** Rough per-call price estimate in EUR (gateway usage, short resume texts). */
export const aiActionPrices: Record<AiCostAction, number> = {
  optimize: 0.004,
  translate: 0.004,
  coverLetter: 0.012,
  transcribe: 0.008,
  parseResume: 0.012,
};

const STORAGE_KEY = "ai-cost-log-v1";
const EVENT = "ai-cost-updated";

export type AiCostCounts = Record<AiCostAction, number>;

const emptyCounts = (): AiCostCounts => ({
  optimize: 0,
  translate: 0,
  coverLetter: 0,
  transcribe: 0,
  parseResume: 0,
});

function read(): AiCostCounts {
  if (typeof window === "undefined") return emptyCounts();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCounts();
    const parsed = JSON.parse(raw) as Partial<AiCostCounts>;
    const counts = emptyCounts();
    for (const key of Object.keys(counts) as AiCostAction[]) {
      const value = Number(parsed[key]);
      counts[key] = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    }
    return counts;
  } catch {
    return emptyCounts();
  }
}

function write(counts: AiCostCounts) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch {
    /* storage unavailable — estimate stays in-memory only */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Records one successful AI call for the current resume. */
export function trackAiAction(action: AiCostAction) {
  const counts = read();
  counts[action] += 1;
  write(counts);
}

/** Clears the tracked AI usage (e.g. when starting a new resume). */
export function resetAiCost() {
  write(emptyCounts());
}

export function totalAiCost(counts: AiCostCounts): number {
  return (Object.keys(counts) as AiCostAction[]).reduce(
    (sum, action) => sum + counts[action] * aiActionPrices[action],
    0,
  );
}

export function totalAiCalls(counts: AiCostCounts): number {
  return (Object.keys(counts) as AiCostAction[]).reduce((sum, action) => sum + counts[action], 0);
}

/** Reactive AI cost estimate for the current resume. */
export function useAiCostEstimate() {
  const [counts, setCounts] = useState<AiCostCounts>(emptyCounts);

  const refresh = useCallback(() => setCounts(read()), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  return {
    counts,
    calls: totalAiCalls(counts),
    total: totalAiCost(counts),
    reset: resetAiCost,
  };
}

export function formatEur(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
