import "server-only";

/**
 * Server-only environment access. Reading through these helpers means a missing
 * variable fails loudly at boot with a useful message instead of surfacing as a
 * confusing runtime error inside Better Auth or Prisma.
 *
 * Nothing in this file may be imported from a Client Component — `server-only`
 * turns that into a build error, which is what keeps `BETTER_AUTH_SECRET` and
 * `GOOGLE_CLIENT_SECRET` out of the browser bundle.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const serverEnv = {
  databaseUrl: required("DATABASE_URL"),
  betterAuthSecret: required("BETTER_AUTH_SECRET"),
  betterAuthUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  googleClientId: optional("GOOGLE_CLIENT_ID"),
  googleClientSecret: optional("GOOGLE_CLIENT_SECRET"),
};

/** Google is optional so the app still boots before OAuth credentials exist. */
export const isGoogleConfigured =
  Boolean(serverEnv.googleClientId) && Boolean(serverEnv.googleClientSecret);
