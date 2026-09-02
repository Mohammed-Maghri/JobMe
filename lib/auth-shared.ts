/**
 * Values shared between the Better Auth server config and middleware.
 *
 * This file must stay free of `server-only` and of any Node-only import:
 * middleware runs on the Edge runtime, and it needs the cookie prefix to find
 * the session cookie. Keeping the constant here is what stops the two from
 * drifting — a changed prefix silently broke the middleware redirect once.
 */
export const COOKIE_PREFIX = "applypilot";
