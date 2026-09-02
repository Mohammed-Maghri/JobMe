"use server";

import { z } from "zod";
import { requireUser, UnauthorizedError } from "@/lib/session";
import { getApplicationEvents } from "@/lib/applications/queries";
import type { ApplicationEventRecord } from "@/lib/applications/queries";

/**
 * Status history for one application, loaded when the details drawer opens.
 *
 * Split out from the mutation module so the drawer can fetch on demand instead
 * of every row shipping its history with the initial page.
 */
export async function getApplicationTimeline(
  input: unknown,
): Promise<
  | { ok: true; data: ApplicationEventRecord[] }
  | { ok: false; reason: "unauthenticated" | "invalid" }
> {
  let userId: string;
  try {
    userId = (await requireUser()).id;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, reason: "unauthenticated" };
    }
    throw error;
  }

  const parsed = z.object({ id: z.string().min(1).max(64) }).safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };

  // Scoped by userId inside the query, so an id from another account is empty.
  return { ok: true, data: await getApplicationEvents(userId, parsed.data.id) };
}
