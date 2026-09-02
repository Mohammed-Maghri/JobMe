import type { AuthIntent } from "./intents";

/**
 * Where a visitor lands once they are authenticated.
 *
 * Signing in has to *move* you. Staying on the marketing landing page reads as
 * "nothing happened", so the default destination is the tracker — the app's
 * home for someone with an account.
 *
 * Provider sign-in leaves and re-enters the app, so this URL is chosen before
 * the browser redirects. Two rules keep it safe:
 *
 *  1. It is never an auth route. Coming back to `/signin` would bounce through
 *     the modal again and look like the sign-in never happened.
 *  2. The auth query parameters are stripped, since arriving with `auth=signin`
 *     re-triggers the modal.
 */

export const HOME = "/";

/** The signed-in home. */
export const AUTHED_HOME = "/applications";

/** Routes that only exist to open the modal — never a landing place. */
const AUTH_ROUTES = new Set(["/signin", "/signup"]);

/** Parameters that would re-open the modal or re-run a redirect on arrival. */
const AUTH_PARAMS = ["auth", "next", "auth_error"] as const;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname);
}

/** The current location with the auth parameters removed. */
function currentLocation(): string {
  if (typeof window === "undefined") return HOME;
  const url = new URL(window.location.href);
  for (const param of AUTH_PARAMS) url.searchParams.delete(param);
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
}

/**
 * Resolves the destination for a completed sign-in.
 *
 * An intent wins, because the visitor already told us what they were doing:
 *  - `navigate` — a protected page turned them away; send them back to it.
 *  - `save-job`  — the job feed is on the page they are standing on, and the
 *                  save replays into that component, so moving would strand it.
 *
 * With no intent there is nothing to preserve, so they go to the tracker.
 */
export function postAuthDestination(intent?: AuthIntent | null): string {
  if (intent?.type === "navigate") return intent.href;
  if (intent?.type === "save-job") {
    const here = currentLocation();
    // An auth route has no job feed to save into; fall back to the landing page.
    return isAuthRoute(here.split("?")[0]) ? HOME : here;
  }
  return AUTHED_HOME;
}

/** Same destination, flagged so the page can explain a failed provider login. */
export function providerErrorDestination(
  provider: string,
  intent?: AuthIntent | null,
): string {
  // A failed hand-off leaves no session, so the error has to surface somewhere
  // the modal can reopen — never on a page that would just turn them away.
  const base =
    intent?.type === "save-job" ? postAuthDestination(intent) : HOME;
  const [path, existing] = base.split("?");
  const params = new URLSearchParams(existing ?? "");
  params.set("auth_error", provider);
  return `${path}?${params}`;
}
