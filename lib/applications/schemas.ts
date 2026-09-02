import { z } from "zod";
import {
  APPLICATION_SOURCES,
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  SORT_OPTIONS,
  VIEWS,
  WORK_MODES,
} from "./constants";

/**
 * One schema set, used by the form in the browser and again inside every server
 * action. The client copy gives instant inline errors; the server copy is the
 * one that actually decides what reaches PostgreSQL.
 */

const trimmed = (max: number) =>
  z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().max(max));

const optionalText = (max: number) =>
  z
    .string()
    .max(max, { message: `Use at most ${max} characters.` })
    .transform((value) => value.trim())
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional()
    .transform((value) => value ?? null);

/** `<input type="date">` gives "" when cleared and "YYYY-MM-DD" otherwise. */
const optionalDate = z
  .string()
  .optional()
  .nullable()
  .transform((value) => (value == null || value.trim() === "" ? null : value))
  .refine((value) => value === null || !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date.",
  })
  .transform((value) => (value === null ? null : new Date(value)));

const optionalUrl = z
  .string()
  .optional()
  .nullable()
  .transform((value) => (value == null || value.trim() === "" ? null : value.trim()))
  .refine(
    (value) => {
      if (value === null) return true;
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Enter a full URL starting with http:// or https://" },
  );

const optionalEmail = z
  .string()
  .optional()
  .nullable()
  .transform((value) => (value == null || value.trim() === "" ? null : value.trim()))
  .refine(
    (value) => value === null || z.email().safeParse(value).success,
    { message: "Enter a valid email address." },
  );

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .optional()
    .nullable()
    .transform((value) => (value == null || value === "" ? null : value))
    .refine((value) => value === null || values.includes(value), {
      message: "Choose one of the available options.",
    })
    .transform((value) => value as T[number] | null);

export const applicationInputSchema = z.object({
  companyName: trimmed(120).pipe(
    z.string().min(1, { message: "Company name is required." }),
  ),
  jobTitle: trimmed(160).pipe(
    z.string().min(1, { message: "Job title is required." }),
  ),
  jobUrl: optionalUrl,
  location: optionalText(120),
  workMode: optionalEnum(WORK_MODES),
  employmentType: optionalEnum(EMPLOYMENT_TYPES),
  status: z.enum(APPLICATION_STATUSES).default("SAVED"),
  appliedAt: optionalDate,
  interviewAt: optionalDate,
  followUpAt: optionalDate,
  contactName: optionalText(120),
  contactEmail: optionalEmail,
  notes: optionalText(4000),
});

export type ApplicationInput = z.input<typeof applicationInputSchema>;
export type ApplicationParsed = z.output<typeof applicationInputSchema>;

export const updateApplicationSchema = z.object({
  id: z.string().min(1).max(64),
  data: applicationInputSchema,
});

export const changeStatusSchema = z.object({
  id: z.string().min(1).max(64),
  status: z.enum(APPLICATION_STATUSES),
});

export const deleteApplicationSchema = z.object({
  id: z.string().min(1).max(64),
});

/**
 * A repeatable, comma-separatable query parameter restricted to a known set.
 * Unrecognised entries are dropped rather than failing the whole request, so a
 * stale bookmark still loads.
 */
function multiValue<T extends readonly string[]>(allowed: T) {
  return z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      const raw = value === undefined ? [] : Array.isArray(value) ? value : [value];
      return raw
        .flatMap((entry) => entry.split(","))
        .map((entry) => entry.trim().toUpperCase())
        .filter((entry): entry is T[number] =>
          (allowed as readonly string[]).includes(entry),
        );
    });
}

/** Query-string shape for the dashboard. Anything unrecognised falls back. */
export const applicationFiltersSchema = z.object({
  view: z.enum(VIEWS).catch("board"),
  q: z.string().max(120).catch("").transform((v) => v.trim()),
  status: multiValue(APPLICATION_STATUSES),
  source: multiValue(APPLICATION_SOURCES),
  employmentType: multiValue(EMPLOYMENT_TYPES),
  sort: z.enum(SORT_OPTIONS.map((option) => option.value) as [string, ...string[]])
    .catch("newest"),
});

export type ApplicationFilters = z.output<typeof applicationFiltersSchema>;

/** Field name -> first message, ready to bind to inputs. */
export type FieldErrors = Partial<Record<string, string>>;

export function collectFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}
