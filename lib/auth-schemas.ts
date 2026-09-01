import { z } from "zod";

/**
 * Shared credential rules.
 *
 * This module is deliberately free of `server-only` and of any Node import: the
 * exact same schema runs in the modal (so the user gets an inline error before
 * a request leaves the browser) and on the server (so a crafted request cannot
 * bypass it). `PASSWORD_MIN_LENGTH` is also handed to Better Auth in
 * `lib/auth.ts`, which enforces it independently inside the sign-up endpoint.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const email = z
  .email({ message: "Enter a valid email address." })
  .min(3)
  .max(254)
  .transform((value) => value.trim().toLowerCase());

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, {
    message: `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
  })
  .max(PASSWORD_MAX_LENGTH, {
    message: `Use at most ${PASSWORD_MAX_LENGTH} characters.`,
  });

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { message: "Enter your password." }),
});

export const signUpSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string().min(1, { message: "Confirm your password." }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const requestPasswordResetSchema = z.object({ email });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

/** Field name -> first error message, ready to bind to inputs. */
export type FieldErrors = Partial<Record<string, string>>;

export function collectFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
