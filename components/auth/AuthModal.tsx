"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Loader2, Lock, Mail, X } from "lucide-react";
import PixelPlane from "@/components/landing/PixelPlane";
import PixelSparkle from "@/components/landing/PixelSparkle";
import { EASE_OUT } from "@/components/landing/motion";
import { signIn, signUp } from "@/lib/auth-client";
import {
  collectFieldErrors,
  signInSchema,
  signUpSchema,
  type FieldErrors,
} from "@/lib/auth-schemas";
import { describeAuthError } from "./errors";
import { postAuthDestination, providerErrorDestination } from "./redirect";
import type { AuthIntent } from "./intents";
import GoogleMark from "./GoogleMark";
import type { AuthMode } from "./AuthProvider";

type View = AuthMode | "reset";

type AuthModalProps = {
  open: boolean;
  mode: AuthMode;
  googleEnabled: boolean;
  /** Shown immediately on open — e.g. a provider round trip that failed. */
  initialError?: string | null;
  /** What the visitor was trying to do; decides where they land afterwards. */
  intent?: AuthIntent | null;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onAuthenticated: () => void | Promise<void>;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

const subscribeToNothing = () => () => {};

export default function AuthModal({
  open,
  mode,
  googleEnabled,
  initialError = null,
  intent = null,
  onModeChange,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const prefersReducedMotion = useReducedMotion();
  /**
   * `false` during SSR and the hydration pass, `true` afterwards — the portal
   * needs a real `document.body`, and this reports it without a state update.
   */
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  /** Guards the backdrop while a request is in flight. */
  const [busy, setBusy] = useState(false);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:items-center sm:p-6"
          role="presentation"
        >
          <motion.div
            aria-hidden="true"
            onClick={() => {
              // Never drop an in-flight request on a stray click.
              if (!busy) onClose();
            }}
            className="fixed inset-0 bg-espresso/55"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <AuthDialog
            mode={mode}
            googleEnabled={googleEnabled}
            initialError={initialError}
            intent={intent}
            onBusyChange={setBusy}
            onModeChange={onModeChange}
            onClose={onClose}
            onAuthenticated={onAuthenticated}
          />
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */

type AuthDialogProps = {
  mode: AuthMode;
  googleEnabled: boolean;
  initialError: string | null;
  intent: AuthIntent | null;
  onBusyChange: (busy: boolean) => void;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onAuthenticated: () => void | Promise<void>;
};

/**
 * The dialog is mounted fresh on every open, so its form state starts clean
 * without any reset effects.
 */
function AuthDialog({
  mode,
  googleEnabled,
  initialError,
  intent,
  onBusyChange,
  onModeChange,
  onClose,
  onAuthenticated,
}: AuthDialogProps) {
  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();

  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const [view, setView] = useState<View>(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  // Seeded from `initialError` so a failed provider round trip explains
  // itself the moment the modal reopens.
  const [formError, setFormError] = useState<string | null>(initialError);
  const [pending, setPending] = useState<null | "email" | "google">(null);

  const isBusy = pending !== null;

  /* Mirror the busy flag up so the backdrop can refuse to close. */
  useEffect(() => {
    onBusyChange(isBusy);
    return () => onBusyChange(false);
  }, [isBusy, onBusyChange]);

  /**
   * Lock the page behind the modal. The scrollbar width is added back as
   * padding so the underlying layout does not jump sideways when it is hidden.
   */
  useEffect(() => {
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, []);

  /* Move focus in on open, and give it back to the trigger on close. */
  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => emailRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(id);
      restoreFocusTo.current?.focus?.();
      restoreFocusTo.current = null;
    };
  }, []);

  /* Escape to dismiss, plus a focus trap over Tab / Shift+Tab. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // A request is in flight; dismissing now would strand it.
        if (isBusy) return;
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isBusy, onClose]);

  const switchView = useCallback(
    (next: View) => {
      setFieldErrors({});
      setFormError(null);
      setConfirmPassword("");
      setView(next);
      if (next !== "reset") onModeChange(next);
    },
    [onModeChange],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    setFieldErrors({});
    setFormError(null);

    if (view === "reset") {
      // Deliberately not a success path — see the note rendered in this view.
      // There is no email provider connected yet.
      return;
    }

    const schema = view === "signup" ? signUpSchema : signInSchema;
    const parsed = schema.safeParse(
      view === "signup"
        ? { email, password, confirmPassword }
        : { email, password },
    );

    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error));
      return;
    }

    setPending("email");
    try {
      const result =
        view === "signup"
          ? await signUp.email({
              email: parsed.data.email,
              password: parsed.data.password,
              // Better Auth requires a name; the local part is a sane start
              // and the user can change it later.
              name: parsed.data.email.split("@")[0],
            })
          : await signIn.email({
              email: parsed.data.email,
              password: parsed.data.password,
            });

      if (result.error) {
        setFormError(
          describeAuthError(view, result.error.code, result.error.status),
        );
        setPending(null);
        return;
      }
      await onAuthenticated();
    } catch {
      setFormError("Could not reach the server. Check your connection.");
      setPending(null);
    }
  }

  async function handleGoogle() {
    if (isBusy) return;
    setFormError(null);
    setPending("google");
    try {
      // Better Auth owns the whole OAuth exchange. `callbackURL` is where it
      // sends the browser once Google has redirected back to
      // /api/auth/callback/google. It is resolved through
      // `postAuthDestination()` so the return trip can never land on an auth
      // route or carry `auth=` back and re-open this modal.
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: postAuthDestination(intent),
        errorCallbackURL: providerErrorDestination("google", intent),
      });
      if (error) {
        setFormError(
          describeAuthError(
            view === "signup" ? "signup" : "signin",
            error.code,
            error.status,
          ),
        );
        setPending(null);
      }
      // On success the browser navigates away; leave the spinner running.
    } catch {
      setFormError("Could not start Google sign-in. Try again.");
      setPending(null);
    }
  }

  const copy = useMemo(() => {
    if (view === "reset") {
      return {
        title: "Reset your password",
        description:
          "Tell us the address on your account and we will send a reset link.",
        submit: "Send reset link",
      };
    }
    if (view === "signup") {
      return {
        title: "Create your account",
        description:
          "Set your preferences once, then let the right roles come to you.",
        submit: "Create account",
      };
    }
    return {
      title: "Welcome back",
      description:
        "Pick up your search and your applications where you left them.",
      submit: "Log in",
    };
  }, [view]);

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="relative my-auto w-full max-w-[26.5rem] rounded-[12px] border-2 border-line bg-surface shadow-pixel-lg"
      initial={
        prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.985 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.99 }
      }
      transition={{ duration: 0.22, ease: EASE_OUT }}
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isBusy}
        aria-label="Close sign-in dialog"
        className="pixel-notch-sm absolute top-3 right-3 inline-flex size-11 items-center justify-center border-2 border-line bg-stone text-espresso transition-colors hover:border-plum/50 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <X size={18} strokeWidth={2.2} aria-hidden="true" />
      </button>

      <div className="p-5 pt-6 sm:p-7 sm:pt-7">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <PixelPlane size={28} />
          <span className="font-display text-[1.25rem] font-bold tracking-[-0.03em] text-espresso">
            ApplyPilot
          </span>
          <PixelSparkle size={10} className="mb-3 opacity-70" />
        </div>

        <h2
          id={titleId}
          className="mt-5 font-display text-[1.5rem] leading-tight font-bold tracking-[-0.03em] text-espresso"
        >
          {copy.title}
        </h2>
        <p
          id={descriptionId}
          className="mt-2 text-[0.9375rem] leading-[1.55] text-espresso/70"
        >
          {copy.description}
        </p>

        {view !== "reset" && googleEnabled && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isBusy}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[6px] border-2 border-line bg-stone px-4 font-display text-[0.9375rem] font-bold text-espresso shadow-pixel-xs transition-colors hover:border-plum/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending === "google" ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <GoogleMark size={17} />
              )}
              {pending === "google"
                ? "Redirecting to Google…"
                : "Continue with Google"}
            </button>

            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-[2px] flex-1 bg-line" />
              <span className="font-display text-[0.75rem] font-bold tracking-[0.14em] text-espresso/45 uppercase">
                or
              </span>
              <span className="h-[2px] flex-1 bg-line" />
            </div>
          </>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className={view !== "reset" && googleEnabled ? "" : "mt-6"}
        >
          <Field
            ref={emailRef}
            id="auth-email"
            label="Email"
            type="email"
            icon={<Mail size={15} strokeWidth={2.1} aria-hidden="true" />}
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            error={fieldErrors.email}
            disabled={isBusy}
          />

          {view !== "reset" && (
            <Field
              id="auth-password"
              label="Password"
              type="password"
              icon={<Lock size={15} strokeWidth={2.1} aria-hidden="true" />}
              autoComplete={
                view === "signup" ? "new-password" : "current-password"
              }
              placeholder={
                view === "signup" ? "At least 8 characters" : "••••••••"
              }
              value={password}
              onChange={setPassword}
              error={fieldErrors.password}
              disabled={isBusy}
              className="mt-4"
            />
          )}

          {view === "signup" && (
            <Field
              id="auth-confirm-password"
              label="Confirm password"
              type="password"
              icon={<Lock size={15} strokeWidth={2.1} aria-hidden="true" />}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={fieldErrors.confirmPassword}
              disabled={isBusy}
              className="mt-4"
            />
          )}

          {view === "signin" && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => switchView("reset")}
                disabled={isBusy}
                className="inline-flex min-h-11 items-center rounded-[4px] text-[0.875rem] font-semibold text-plum underline underline-offset-4 disabled:opacity-60"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Server / network errors. `role="alert"` announces them the
                    moment they appear; the region is only rendered when there
                    is something to say, so nothing reserves empty space. */}
          {formError && (
            <p
              id={errorId}
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-[6px] border-2 border-terracotta/45 bg-terracotta/10 px-3 py-2.5 text-[0.875rem] leading-[1.45] text-espresso"
            >
              <AlertCircle
                size={16}
                strokeWidth={2.2}
                className="mt-[1px] shrink-0 text-terracotta"
                aria-hidden="true"
              />
              {formError}
            </p>
          )}

          {view === "reset" ? (
            <div
              role="status"
              className="mt-5 rounded-[6px] border-2 border-mustard/55 bg-mustard/14 px-3.5 py-3 text-[0.875rem] leading-[1.5] text-espresso"
            >
              <strong className="font-display font-bold">
                Email delivery is not connected yet.
              </strong>{" "}
              Password reset is built into Better Auth on the server, but no
              transactional email provider is wired up, so no message would
              actually arrive. Rather than show you a fake confirmation, we have
              disabled this step until the provider is configured.
            </div>
          ) : (
            <button
              type="submit"
              disabled={isBusy}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[6px] border-2 border-[#a44f31] bg-terracotta px-4 font-display text-[1rem] font-bold text-surface shadow-pixel-sm transition-colors hover:bg-[#bf5c3b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending === "email" && (
                <Loader2
                  size={17}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              {pending === "email"
                ? view === "signup"
                  ? "Creating account…"
                  : "Logging in…"
                : copy.submit}
            </button>
          )}
        </form>

        {/* Mode toggle */}
        <p className="mt-5 text-center text-[0.875rem] text-espresso/70">
          {view === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchView("signin")}
                disabled={isBusy}
                className="font-display font-bold text-plum underline underline-offset-4 disabled:opacity-60"
              >
                Log in
              </button>
            </>
          ) : view === "signin" ? (
            <>
              New to ApplyPilot?{" "}
              <button
                type="button"
                onClick={() => switchView("signup")}
                disabled={isBusy}
                className="font-display font-bold text-plum underline underline-offset-4 disabled:opacity-60"
              >
                Create account
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => switchView("signin")}
              className="font-display font-bold text-plum underline underline-offset-4"
            >
              Back to log in
            </button>
          )}
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

type FieldProps = {
  id: string;
  label: string;
  type: "email" | "password";
  icon: React.ReactNode;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
};

/**
 * The error message is rendered under the input and wired up with
 * `aria-describedby` + `aria-invalid`, so a screen reader announces the reason
 * along with the field rather than leaving a red border to speak for itself.
 */
function Field({
  id,
  label,
  type,
  icon,
  autoComplete,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  className = "",
  ref,
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block font-display text-[0.8125rem] font-bold tracking-[0.04em] text-espresso/75"
      >
        {label}
      </label>
      <div
        className={`mt-1.5 flex items-center gap-2 rounded-[6px] border-2 bg-stone px-3 transition-colors focus-within:border-plum ${
          error ? "border-terracotta" : "border-line"
        }`}
      >
        <span className="shrink-0 text-espresso/45">{icon}</span>
        <input
          ref={ref}
          id={id}
          name={id}
          type={type}
          inputMode={type === "email" ? "email" : undefined}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-h-11 w-full bg-transparent text-[0.9375rem] text-espresso outline-none placeholder:text-espresso/35 disabled:opacity-60"
        />
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-[0.8125rem] font-medium text-terracotta"
        >
          {error}
        </p>
      )}
    </div>
  );
}
