/** Remembers an action the user tried before signing in so it can resume after login. */
export const PENDING_ACTION_KEY = "resume-pending-action-v1";
export type PendingAction = "pdf" | "email";

export function rememberPendingAction(action: PendingAction) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_ACTION_KEY, action);
}

export function readPendingAction(): PendingAction | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(PENDING_ACTION_KEY);
  return value === "pdf" || value === "email" ? value : null;
}

export function clearPendingAction() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_ACTION_KEY);
}
