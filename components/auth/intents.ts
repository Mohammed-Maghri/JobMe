/**
 * A protected action the user asked for before they were signed in.
 *
 * Intents are deliberately small and serialisable: an email sign-in replays one
 * from React state, while Google sign-in has to survive a full round trip to
 * Google and back, so the same value is parked in `sessionStorage`. It carries
 * no credentials — only "this person wanted to save job X".
 */
export type AuthIntent =
  | { type: "save-job"; jobId: string }
  /** Where to send the user once they are authenticated. */
  | { type: "navigate"; href: string };

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
    if (typeof parsed !== "object" || parsed === null) return null;
    const intent = parsed as AuthIntent;
    if (intent.type === "save-job" && typeof intent.jobId === "string") return intent;
    // Only same-origin paths are ever followed, so a tampered value cannot be
    // turned into an open redirect.
    if (
      intent.type === "navigate" &&
      typeof intent.href === "string" &&
      intent.href.startsWith("/") &&
      !intent.href.startsWith("//")
    ) {
      return intent;
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
