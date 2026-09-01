"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser client.
 *
 * `baseURL` is intentionally omitted: the API is served from this same origin
 * at `/api/auth`, which is Better Auth's default. Nothing secret reaches this
 * module — the session lives in an httpOnly, signed cookie issued by the
 * server, so there is no token for this file (or for `localStorage`) to hold.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
