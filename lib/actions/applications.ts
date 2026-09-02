"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/session";
import {
  applicationInputSchema,
  changeStatusSchema,
  collectFieldErrors,
  deleteApplicationSchema,
  updateApplicationSchema,
  type FieldErrors,
} from "@/lib/applications/schemas";
import type { ApplicationStatusValue } from "@/lib/applications/constants";

/**
 * Every mutation for the tracker.
 *
 * Two invariants hold in all of them:
 *   1. The user id comes from `requireUser()` — the browser never supplies one,
 *      so a forged payload cannot address somebody else's data.
 *   2. Writes use `updateMany` / `deleteMany` with `{ id, userId }`. If the row
 *      belongs to another account the statement matches zero rows and returns
 *      "not found"; it cannot leak that the id exists.
 */

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; reason: "unauthenticated" }
  | { ok: false; reason: "not-found" }
  | { ok: false; reason: "invalid"; fieldErrors: FieldErrors; message?: string }
  | { ok: false; reason: "error"; message: string };

const UNAUTHENTICATED = { ok: false, reason: "unauthenticated" } as const;
const NOT_FOUND = { ok: false, reason: "not-found" } as const;

function refresh() {
  revalidatePath("/applications");
}

export async function createApplication(
  input: unknown,
): Promise<ActionResult<{ id: string; status: ApplicationStatusValue }>> {
  let userId: string;
  try {
    userId = (await requireUser()).id;
  } catch (error) {
    if (error instanceof UnauthorizedError) return UNAUTHENTICATED;
    throw error;
  }

  const parsed = applicationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  // Marking something as applied without a date is the common case; default it
  // to now so the board and the "applied this week" tile stay meaningful.
  const appliedAt =
    data.appliedAt ?? (data.status !== "SAVED" ? new Date() : null);

  const created = await prisma.application.create({
    data: {
      userId,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      jobUrl: data.jobUrl,
      location: data.location,
      workMode: data.workMode,
      employmentType: data.employmentType,
      status: data.status,
      source: "MANUAL",
      appliedAt,
      interviewAt: data.interviewAt,
      followUpAt: data.followUpAt,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      notes: data.notes,
      events: {
        create: { userId, fromStatus: null, toStatus: data.status, actor: "user" },
      },
    },
    select: { id: true, status: true },
  });

  refresh();
  return {
    ok: true,
    data: { id: created.id, status: created.status as ApplicationStatusValue },
  };
}

export async function updateApplication(input: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = (await requireUser()).id;
  } catch (error) {
    if (error instanceof UnauthorizedError) return UNAUTHENTICATED;
    throw error;
  }

  const parsed = updateApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  const { id, data } = parsed.data;

  const existing = await prisma.application.findFirst({
    where: { id, userId },
    select: { status: true },
  });
  if (!existing) return NOT_FOUND;

  await prisma.application.update({
    where: { id },
    data: {
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      jobUrl: data.jobUrl,
      location: data.location,
      workMode: data.workMode,
      employmentType: data.employmentType,
      status: data.status,
      appliedAt: data.appliedAt,
      interviewAt: data.interviewAt,
      followUpAt: data.followUpAt,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      notes: data.notes,
      ...(existing.status !== data.status
        ? {
            events: {
              create: {
                userId,
                fromStatus: existing.status,
                toStatus: data.status,
                actor: "user",
              },
            },
          }
        : {}),
    },
  });

  refresh();
  return { ok: true };
}

/**
 * Board drag-and-drop and the status dropdown both land here.
 *
 * A person may move an application in any direction — the forward-only rule
 * exists for automated Gmail suggestions, not for deliberate edits — but the
 * move is always recorded in the event log.
 */
export async function changeApplicationStatus(
  input: unknown,
): Promise<ActionResult<{ id: string; status: ApplicationStatusValue }>> {
  let userId: string;
  try {
    userId = (await requireUser()).id;
  } catch (error) {
    if (error instanceof UnauthorizedError) return UNAUTHENTICATED;
    throw error;
  }

  const parsed = changeStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  const { id, status } = parsed.data;

  const existing = await prisma.application.findFirst({
    where: { id, userId },
    select: { status: true, appliedAt: true },
  });
  if (!existing) return NOT_FOUND;

  if (existing.status === status) {
    return { ok: true, data: { id, status } };
  }

  await prisma.application.update({
    where: { id },
    data: {
      status,
      // Leaving "Saved" for the first time stamps the applied date.
      ...(existing.appliedAt === null && status !== "SAVED"
        ? { appliedAt: new Date() }
        : {}),
      events: {
        create: {
          userId,
          fromStatus: existing.status,
          toStatus: status,
          actor: "user",
        },
      },
    },
  });

  refresh();
  return { ok: true, data: { id, status } };
}

export async function deleteApplication(input: unknown): Promise<ActionResult> {
  let userId: string;
  try {
    userId = (await requireUser()).id;
  } catch (error) {
    if (error instanceof UnauthorizedError) return UNAUTHENTICATED;
    throw error;
  }

  const parsed = deleteApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  // Scoped delete: another user's id simply matches nothing.
  const result = await prisma.application.deleteMany({
    where: { id: parsed.data.id, userId },
  });
  if (result.count === 0) return NOT_FOUND;

  refresh();
  return { ok: true };
}
