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
import { authClient, useSession } from "@/lib/auth-client";
import AuthModal from "./AuthModal";
import {
  clearPersistedIntent,
  persistIntent,
  takePersistedIntent,
  type AuthIntent,
} from "./intents";

export type AuthMode = "signin" | "signup";
export type SessionUser = (typeof authClient.$Infer.Session)["user"];

type OpenOptions = {
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
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [readyIntent, setReadyIntent] = useState<AuthIntent | null>(null);

  /** Mirrors the persisted intent for the in-page (non-redirect) flows. */
  const pendingIntent = useRef<AuthIntent | null>(null);

  const openAuth = useCallback(
    (next: AuthMode = "signin", options?: OpenOptions) => {
      pendingIntent.current = options?.intent ?? null;
      // Persisted up front so the Google round trip survives a full page load.
      if (options?.intent) persistIntent(options.intent);
      else clearPersistedIntent();
      setMode(next);
      setIsOpen(true);
    },
    [],
  );

  const closeAuth = useCallback(() => {
    pendingIntent.current = null;
    clearPersistedIntent();
    setIsOpen(false);
  }, []);

  const consumeIntent = useCallback(() => setReadyIntent(null), []);

  /** Called by the modal after an in-page email sign-in or sign-up. */
  const handleAuthenticated = useCallback(async () => {
    const intent = pendingIntent.current;
    pendingIntent.current = null;
    clearPersistedIntent();
    setIsOpen(false);
    await refetch();
    if (intent) setReadyIntent(intent);
  }, [refetch]);

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
        onClose={closeAuth}
        onAuthenticated={handleAuthenticated}
      />
    </AuthContext.Provider>
  );
}
