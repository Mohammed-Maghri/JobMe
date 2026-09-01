/**
 * A protected action the user asked for before they were signed in.
 *
 * Intents are deliberately small and serialisable: an email sign-in replays one
 * from React state, while Google sign-in has to survive a full round trip to
 * Google and back, so the same value is parked in `sessionStorage`. It carries
 * no credentials — only "this person wanted to save job X".
 */
export type AuthIntent = { type: "save-job"; jobId: string };

const STORAGE_KEY = "applypilot:pending-intent";

export function persistIntent(intent: AuthIntent): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    /* Private mode or storage disabled — the intent is simply not replayed. */
  }
}

export function takePersistedIntent(): AuthIntent | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(STORAGE_KEY);
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as AuthIntent).type === "save-job" &&
      typeof (parsed as AuthIntent).jobId === "string"
    ) {
      return parsed as AuthIntent;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPersistedIntent(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
}
