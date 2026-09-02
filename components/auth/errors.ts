/**
 * Maps Better Auth error codes to copy we are happy to show a stranger.
 *
 * Two rules drive the wording:
 *  - Sign-in failures never say whether the address exists. `USER_NOT_FOUND`
 *    and a wrong password collapse into the same sentence.
 *  - Sign-up is the one place we do confirm an address is taken, because the
 *    user is asking to claim it and needs to know to log in instead.
 */
const SIGN_IN_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password do not match an account.",
  USER_NOT_FOUND: "That email and password do not match an account.",
  INVALID_PASSWORD: "That email and password do not match an account.",
  CREDENTIAL_ACCOUNT_NOT_FOUND:
    "This account was created with Google. Use “Continue with Google” to sign in.",
  EMAIL_NOT_VERIFIED: "Verify your email address before signing in.",
  SESSION_EXPIRED: "Your session expired. Sign in again.",
};

const SIGN_UP_MESSAGES: Record<string, string> = {
  USER_ALREADY_EXISTS:
    "An account with this email already exists. Log in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "An account with this email already exists. Log in instead.",
  PASSWORD_TOO_SHORT: "That password is too short.",
  PASSWORD_TOO_LONG: "That password is too long.",
  INVALID_EMAIL: "Enter a valid email address.",
};

const SHARED_MESSAGES: Record<string, string> = {
  PROVIDER_NOT_FOUND:
    "Google sign-in is not configured on this server yet.",
  INVALID_ORIGIN: "This request was blocked for security reasons. Reload and try again.",
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED:
    "This request was blocked for security reasons. Reload and try again.",
  VALIDATION_ERROR: "Check the details above and try again.",
};

export function describeAuthError(
  mode: "signin" | "signup" | "reset",
  code: string | undefined,
  status?: number,
): string {
  if (code) {
    const table = mode === "signup" ? SIGN_UP_MESSAGES : SIGN_IN_MESSAGES;
    const message = table[code] ?? SHARED_MESSAGES[code];
    if (message) return message;
  }
  if (status === 429) {
    return "Too many attempts. Wait a moment and try again.";
  }
  return "Something went wrong. Try again.";
}

/**
 * A provider sign-in that came back without a session.
 *
 * Better Auth sends the browser to `errorCallbackURL` for anything that goes
 * wrong at the provider — a cancelled consent screen, a rejected account, a
 * misconfigured client. The cause is not in the URL, so the copy stays
 * accurate rather than guessing which one it was.
 */
export function describeProviderError(provider: string): string {
  const name = provider === "google" ? "Google" : provider;
  return `${name} sign-in did not complete, so you are not signed in. Try again, or use your email and password.`;
}
