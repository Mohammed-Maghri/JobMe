import "server-only";
import { prisma } from "@/lib/prisma";
import { buildApplicationOrderBy, buildApplicationWhere } from "./query-builder";
import type { ApplicationFilters } from "./schemas";
import type {
  ApplicationSourceValue,
  ApplicationStatusValue,
  EmploymentTypeValue,
  WorkModeValue,
} from "./constants";

/**
 * All reads for the dashboard. Every one takes `userId` as its first argument
 * and passes it to `buildApplicationWhere`, which refuses to build a query
 * without it — that is the ownership boundary.
 */

export type ApplicationRecord = {
  id: string;
  companyName: string;
  companyDomain: string | null;
  companyLogoUrl: string | null;
  jobTitle: string;
  jobUrl: string | null;
  location: string | null;
  workMode: WorkModeValue | null;
  employmentType: EmploymentTypeValue | null;
  status: ApplicationStatusValue;
  source: ApplicationSourceValue;
  contactName: string | null;
  contactEmail: string | null;
  appliedAt: string | null;
  interviewAt: string | null;
  followUpAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const iso = (value: Date | null) => (value ? value.toISOString() : null);

function toRecord(row: {
  id: string; companyName: string; companyDomain: string | null;
  companyLogoUrl: string | null; jobTitle: string; jobUrl: string | null;
  location: string | null; workMode: string | null; employmentType: string | null;
  status: string; source: string; contactName: string | null;
  contactEmail: string | null; appliedAt: Date | null; interviewAt: Date | null;
  followUpAt: Date | null; notes: string | null; createdAt: Date; updatedAt: Date;
}): ApplicationRecord {
  return {
    ...row,
    workMode: row.workMode as WorkModeValue | null,
    employmentType: row.employmentType as EmploymentTypeValue | null,
    status: row.status as ApplicationStatusValue,
    source: row.source as ApplicationSourceValue,
    appliedAt: iso(row.appliedAt),
    interviewAt: iso(row.interviewAt),
    followUpAt: iso(row.followUpAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listApplications(
  userId: string,
  filters: ApplicationFilters,
): Promise<ApplicationRecord[]> {
  const rows = await prisma.application.findMany({
    where: buildApplicationWhere(userId, filters),
    orderBy: buildApplicationOrderBy(filters.sort),
    take: 500,
  });
  return rows.map(toRecord);
}

export type ApplicationSummary = {
  total: number;
  appliedThisWeek: number;
  interviews: number;
  offers: number;
  /** Share of sent applications that got any reply. `null` when none sent. */
  responseRate: number | null;
  respondedCount: number;
  sentCount: number;
};

/**
 * Summary tiles, computed in the database rather than over a fetched page, so
 * the numbers stay right no matter how many rows exist.
 *
 * Response rate = applications that reached screening or beyond (including
 * rejections, which are still a reply) divided by everything actually sent.
 * With nothing sent yet it is `null`, and the UI shows a dash instead of 0%.
 */
export async function getApplicationSummary(
  userId: string,
): Promise<ApplicationSummary> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [byStatus, appliedThisWeek] = await Promise.all([
    prisma.application.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.application.count({
      where: { userId, appliedAt: { gte: weekAgo } },
    }),
  ]);

  const counts = new Map<string, number>(
    byStatus.map((row) => [row.status as string, row._count._all]),
  );
  const at = (status: string) => counts.get(status) ?? 0;

  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
  const sentCount =
    at("APPLIED") + at("SCREENING") + at("INTERVIEW") + at("OFFER") + at("REJECTED");
  const respondedCount =
    at("SCREENING") + at("INTERVIEW") + at("OFFER") + at("REJECTED");

  return {
    total,
    appliedThisWeek,
    interviews: at("INTERVIEW"),
    offers: at("OFFER"),
    responseRate: sentCount === 0 ? null : Math.round((respondedCount / sentCount) * 100),
    respondedCount,
    sentCount,
  };
}

export type ApplicationEventRecord = {
  id: string;
  fromStatus: ApplicationStatusValue | null;
  toStatus: ApplicationStatusValue;
  actor: string;
  note: string | null;
  createdAt: string;
};

export async function getApplicationEvents(
  userId: string,
  applicationId: string,
): Promise<ApplicationEventRecord[]> {
  const rows = await prisma.applicationEvent.findMany({
    // Scoped by userId as well as applicationId: an id guessed from elsewhere
    // still returns nothing.
    where: { userId, applicationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((row) => ({
    id: row.id,
    fromStatus: row.fromStatus as ApplicationStatusValue | null,
    toStatus: row.toStatus as ApplicationStatusValue,
    actor: row.actor,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  }));
}
