import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * Every Better Auth endpoint — sign-up, sign-in, sign-out, the Google OAuth
 * redirect and its callback — is served from this one catch-all route.
 *
 * The Google redirect URI registered in Google Cloud Console must therefore be
 * `<BETTER_AUTH_URL>/api/auth/callback/google`.
 */
export const { GET, POST } = toNextJsHandler(auth.handler);

/** Sessions are per-request; nothing here may be cached. */
export const dynamic = "force-dynamic";
