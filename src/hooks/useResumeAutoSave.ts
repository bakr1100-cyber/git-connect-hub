import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isEmptyResume, loadRemoteResume, saveRemoteResume } from "@/lib/resume-cloud";
import type { ResumeData } from "@/lib/resume-types";

export type SaveState = "idle" | "saving" | "saved" | "offline" | "error";

interface Options {
  data: ResumeData;
  /** Only start saving once the local draft has been hydrated. */
  ready: boolean;
  /** Called when a saved cloud draft is restored after login. */
  onRestore: (data: ResumeData) => void;
}

export function useResumeAutoSave({ data, ready, onRestore }: Options) {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<SaveState>("idle");
  const [restored, setRestored] = useState(false);
  /** Saved cloud version that differs from the local draft — the user decides. */
  const [conflict, setConflict] = useState<ResumeData | null>(null);
  const resumeId = useRef<string | undefined>(undefined);
  const hasRestored = useRef(false);
  const lastPayload = useRef<string>("");

  // Restore the cloud draft right after login.
  useEffect(() => {
    if (!isAuthenticated || !ready || hasRestored.current) return;
    hasRestored.current = true;
    void loadRemoteResume().then((remote) => {
      if (!remote) return;
      resumeId.current = remote.id;
      if (isEmptyResume(remote.data)) return;
      if (isEmptyResume(data)) {
        onRestore(remote.data);
        setRestored(true);
        return;
      }
      // Both sides hold content: never overwrite silently, ask instead.
      if (JSON.stringify(remote.data) !== JSON.stringify(data)) setConflict(remote.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, ready]);

  const keepRemote = useCallback(() => {
    if (!conflict) return;
    onRestore(conflict);
    setConflict(null);
    setRestored(true);
  }, [conflict, onRestore]);

  const keepLocal = useCallback(() => setConflict(null), []);

  // Debounced auto-save.
  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated || !user) {
      setState("offline");
      return;
    }
    // Hold saving back while the user decides which version wins.
    if (conflict) return;
    const payload = JSON.stringify(data);
    if (payload === lastPayload.current) return;

    const timer = setTimeout(async () => {
      setState("saving");
      const id = await saveRemoteResume(user.id, data, resumeId.current);
      if (id) {
        resumeId.current = id;
        lastPayload.current = payload;
        setState("saved");
      } else {
        setState("error");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [data, ready, isAuthenticated, user, conflict]);

  return {
    state,
    restored,
    dismissRestored: () => setRestored(false),
    conflict,
    keepRemote,
    keepLocal,
  };
}
