"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import AuthModal from "./AuthModal";
import {
  clearPersistedIntent,
  persistIntent,
  takePersistedIntent,
  type AuthIntent,
} from "./intents";
import { postAuthDestination } from "./redirect";

export type AuthMode = "signin" | "signup";
export type SessionUser = (typeof authClient.$Infer.Session)["user"];

type OpenOptions = {
  /** Pre-filled form-level error, used when returning from a failed provider. */
  error?: string;
  /** A protected action to replay once the user is authenticated. */
  intent?: AuthIntent;
};

type AuthContextValue = {
  /**
   * Opens the modal. Used by Log in / Sign up / Get started and by any
   * protected action attempted while signed out.
   */
  openAuth: (mode?: AuthMode, options?: OpenOptions) => void;
  closeAuth: () => void;
  isOpen: boolean;
  mode: AuthMode;
  user: SessionUser | null;
  isSessionPending: boolean;
  googleEnabled: boolean;
  /**
   * The deferred action, once authentication has completed. Consumers watch
   * this, do the work, then call `consumeIntent()`.
   */
  readyIntent: AuthIntent | null;
  consumeIntent: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>.");
  return value;
}

export default function AuthProvider({
  children,
  googleEnabled,
}: {
  children: ReactNode;
  googleEnabled: boolean;
}) {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [readyIntent, setReadyIntent] = useState<AuthIntent | null>(null);
  const [initialError, setInitialError] = useState<string | null>(null);

  /**
   * The intent for the in-page (non-redirect) flows.
   *
   * State rather than a ref because the modal renders from it — the Google
   * hand-off needs it to build a callback URL before the browser leaves.
   */
  const [pendingIntent, setPendingIntent] = useState<AuthIntent | null>(null);

  const openAuth = useCallback(
    (next: AuthMode = "signin", options?: OpenOptions) => {
      setPendingIntent(options?.intent ?? null);
      // Persisted up front so the Google round trip survives a full page load.
      if (options?.intent) persistIntent(options.intent);
      else clearPersistedIntent();
      setInitialError(options?.error ?? null);
      setMode(next);
      setIsOpen(true);
    },
    [],
  );

  const closeAuth = useCallback(() => {
    setPendingIntent(null);
    clearPersistedIntent();
    setInitialError(null);
    setIsOpen(false);
  }, []);

  const consumeIntent = useCallback(() => setReadyIntent(null), []);

  /** Called by the modal after an in-page email sign-in or sign-up. */
  const handleAuthenticated = useCallback(async () => {
    const intent = pendingIntent;
    setPendingIntent(null);
    clearPersistedIntent();
    setInitialError(null);
    setIsOpen(false);

    /*
      A `save-job` intent replays into the feed on the page we are standing on,
      so that one stays put and its consumer handles it. Everything else moves
      — leaving somebody on the marketing page after a successful sign-in reads
      as though nothing happened.
    */
    if (intent?.type === "save-job") {
      // Staying here, so the client-side session has to be brought up to date.
      await refetch();
      setReadyIntent(intent);
      return;
    }

    if (intent) setReadyIntent(intent);

    /*
      Deliberately no `refetch()` before navigating. The destination is
      server-rendered from the session cookie and mounts a fresh `useSession`,
      so a refetch here is redundant — and it used to be actively harmful: the
      in-flight `get-session` request was aborted by the navigation, which
      Better Auth's client surfaced as an unhandled "unexpected response"
      rejection on every sign-in.
    */
    router.replace(postAuthDestination(intent));
  }, [pendingIntent, refetch, router]);

  /**
   * Google sends the browser to accounts.google.com and back, so on the return
   * trip the intent is recovered from storage rather than from the ref above.
   */
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || isPending) return;
    restored.current = true;

    if (!session?.user) {
      // Came back without a session (cancelled at Google, or an error):
      // drop the intent rather than replaying it on some later sign-in.
      clearPersistedIntent();
      return;
    }

    // Read the external store and replay after the returning page has painted,
    // so the user sees where they landed before the deferred action fires.
    const frame = window.requestAnimationFrame(() => {
      const stored = takePersistedIntent();
      if (stored) setReadyIntent(stored);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isPending, session?.user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      openAuth,
      closeAuth,
      isOpen,
      mode,
      user: session?.user ?? null,
      isSessionPending: isPending,
      googleEnabled,
      readyIntent,
      consumeIntent,
    }),
    [
      openAuth,
      closeAuth,
      isOpen,
      mode,
      session?.user,
      isPending,
      googleEnabled,
      readyIntent,
      consumeIntent,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={isOpen}
        mode={mode}
        googleEnabled={googleEnabled}
        onModeChange={setMode}
        initialError={initialError}
        intent={pendingIntent}
        onClose={closeAuth}
        onAuthenticated={handleAuthenticated}
      />
    </AuthContext.Provider>
  );
}
