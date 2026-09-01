import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth, type Session, type SessionUser } from "./auth";

/**
 * Server-side session read.
 *
 * `cache()` de-duplicates the lookup within a single request, so a layout, a
 * page and a server action can each ask for the session without three round
 * trips to PostgreSQL.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  return auth.api.getSession({ headers: await headers() });
});

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/** Thrown by `requireUser` so callers can map it to a 401 or a modal prompt. */
export class UnauthorizedError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "UnauthorizedError";
  }
}

/**
 * The authorization gate for server work. Any mutation or private read must
 * call this — hiding a button in the UI is not authorization, because the
 * server action behind it is still reachable directly.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export type { Session, SessionUser };
