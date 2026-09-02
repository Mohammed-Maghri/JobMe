import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { COOKIE_PREFIX } from "@/lib/auth-shared";

/**
 * Sends signed-in visitors straight to the tracker instead of the marketing
 * page.
 *
 * This runs in middleware rather than in `app/page.tsx` for one reason: a
 * session check inside the page would opt `/` out of static prerendering for
 * *everyone*, and the landing page is the one route that most benefits from
 * being static. Here the redirect happens before rendering, and the page stays
 * static for the signed-out visitors who actually see it.
 *
 * The check is cookie *presence* only — no database call, which is what keeps
 * it cheap enough to run on every request. That makes it a routing hint, not
 * authorization: `/applications` still calls `getCurrentUser()` and every
 * server action still re-checks the session. A forged cookie gets you a
 * redirect to a page that immediately bounces you back, and nothing more.
 */

/**
 * Parameters that mean "do not redirect me".
 *
 *  - `auth` / `next`  — the visitor was just bounced here by a protected page.
 *    Redirecting them onward would put them in a loop between the two routes
 *    whenever the cookie is present but no longer valid.
 *  - `browse`         — a deliberate visit to the landing page, used by the
 *    footer's "Find jobs" and "How it works" links. Those target sections that
 *    exist only on `/`, and a `#hash` never reaches the server, so the opt-out
 *    has to be explicit in the query string.
 */
const OPT_OUT_PARAMS = ["auth", "next", "browse"] as const;

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  /*
    The prefix has to be passed explicitly. `getSessionCookie` otherwise looks
    for Better Auth's default `better-auth.session_token`, finds nothing, and
    silently never redirects — which is exactly how this first went wrong.
    It checks `__Secure-<name>` before the bare name, so HTTPS needs nothing
    extra.
  */
  const hasSessionCookie = Boolean(
    getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX }),
  );

  if (pathname === "/applications") {
    /*
      Turn the obvious signed-out case away before any rendering happens. Left
      to the page, `redirect()` fires mid-stream and Next has to deliver it as
      a 200 with a client-side instruction; here it is a clean 307 and the
      dashboard shell is never rendered at all.

      This is an optimisation, not the gate. `/applications` still calls
      `getCurrentUser()`, which is what actually validates the session.
    */
    if (hasSessionCookie) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    url.searchParams.set("auth", "signin");
    url.searchParams.set("next", "/applications");
    return NextResponse.redirect(url);
  }

  // Landing page.
  if (OPT_OUT_PARAMS.some((param) => searchParams.has(param))) {
    return NextResponse.next();
  }
  if (!hasSessionCookie) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/applications";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  /*
    Only these two routes. The marketing pages, the auth API and static assets
    are left alone, so this cannot interfere with sign-in or with `/privacy`,
    `/terms` and `/contact`.

    No loop is possible: `/applications` without a cookie sends the visitor to
    `/?auth=signin`, and the `auth` opt-out above stops that from being sent
    back again.
  */
  matcher: ["/", "/applications"],
};
