"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/session";
import { JOBS } from "@/components/landing/content";

const jobIdSchema = z
  .string()
  .min(1)
  .max(64)
  .refine((id) => JOBS.some((job) => job.id === id), {
    message: "Unknown job.",
  });

export type SavedJobsResult =
  | { ok: true; savedJobIds: string[] }
  | { ok: false; reason: "unauthenticated" | "invalid" };

/**
 * Read the caller's shortlist.
 *
 * The user id comes from the server-side session, never from the client, so a
 * caller cannot ask for somebody else's saved jobs by passing an id.
 */
export async function listSavedJobs(): Promise<SavedJobsResult> {
  try {
    const user = await requireUser();
    const rows = await prisma.savedJob.findMany({
      where: { userId: user.id },
      select: { jobId: true },
    });
    return { ok: true, savedJobIds: rows.map((row) => row.jobId) };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, reason: "unauthenticated" };
    }
    throw error;
  }
}

/**
 * Add or remove a job from the caller's shortlist.
 *
 * This is the server half of the "protected action" flow: the button is hidden
 * behind the auth modal in the UI, but the check that actually matters is the
 * `requireUser()` call here, which runs even if the action is invoked directly.
 */
export async function toggleSavedJob(jobId: string): Promise<SavedJobsResult> {
  try {
    const user = await requireUser();

    const parsed = jobIdSchema.safeParse(jobId);
    if (!parsed.success) return { ok: false, reason: "invalid" };

    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: user.id, jobId: parsed.data } },
      select: { id: true },
    });

    if (existing) {
      await prisma.savedJob.delete({ where: { id: existing.id } });
    } else {
      await prisma.savedJob.create({
        data: { userId: user.id, jobId: parsed.data },
      });
    }

    revalidatePath("/");
    return listSavedJobs();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, reason: "unauthenticated" };
    }
    throw error;
  }
}
