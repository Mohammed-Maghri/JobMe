import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { isGoogleConfigured, serverEnv } from "./env";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./auth-schemas";
import { COOKIE_PREFIX } from "./auth-shared";

/**
 * Better Auth server instance — the single source of truth for sessions.
 *
 * Everything security-relevant lives here rather than in application code:
 * password hashing (scrypt), session tokens, cookie signing and the OAuth
 * exchange are all owned by Better Auth. Nothing in this project hashes a
 * password, mints a token or writes an auth cookie by hand.
 */
export const auth = betterAuth({
  appName: "ApplyPilot",
  secret: serverEnv.betterAuthSecret,
  baseURL: serverEnv.betterAuthUrl,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    /**
     * MVP: local sign-in works without a verified address. Flip this to `true`
     * once `emailVerification.sendVerificationEmail` below is wired to a real
     * email service — no other change is required.
     */
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
  },

  emailVerification: {
    sendOnSignUp: false,
    /**
     * PENDING EMAIL DELIVERY.
     *
     * Better Auth calls this with a ready-to-use verification URL. There is no
     * transactional email provider connected yet, so the link is logged in
     * development and the call fails loudly in production rather than
     * pretending the message was sent.
     */
    sendVerificationEmail: async ({ user, url }) => {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "Email delivery is not configured. Connect an email provider in lib/auth.ts before enabling email verification in production.",
        );
      }
      console.warn(
        `[auth] Email delivery pending. Verification link for ${user.email}: ${url}`,
      );
    },
  },

  socialProviders: isGoogleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},

  account: {
    accountLinking: {
      /**
       * Let a user who signed up with email later sign in with Google on the
       * same verified address, instead of ending up with two accounts.
       */
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh a session at most once a day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  advanced: {
    /**
     * `Secure` cookies over HTTPS. Left to Better Auth's default (derived from
     * the base URL) in development so localhost still works over plain HTTP.
     */
    useSecureCookies: serverEnv.betterAuthUrl.startsWith("https://"),
    cookiePrefix: COOKIE_PREFIX,
  },

  trustedOrigins: [serverEnv.betterAuthUrl],

  /**
   * `nextCookies` must stay last: it flushes Better Auth's Set-Cookie headers
   * through the Next.js cookie API so sessions created inside Server Actions
   * are persisted.
   */
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
