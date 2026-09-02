export const AUTH_RETURN_KEY = "mycv-auth-return-v1";
export const WIZARD_STEP_KEY = "resume-wizard-step-v1";

export function currentSafeReturnPath() {
  if (typeof window === "undefined") return "/editor";
  const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return path.startsWith("/") && !path.startsWith("//") ? path : "/editor";
}

export function rememberAuthReturnPath(path = currentSafeReturnPath()) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_RETURN_KEY, path);
}

export function readAuthReturnPath() {
  if (typeof window === "undefined") return "/editor";
  const path = sessionStorage.getItem(AUTH_RETURN_KEY) ?? "/editor";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/editor";
}

export function finishAuthReturn() {
  if (typeof window === "undefined") return;
  const path = readAuthReturnPath();
  sessionStorage.removeItem(AUTH_RETURN_KEY);
  window.location.assign(path);
}
