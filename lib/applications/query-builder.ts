import type { ApplicationFilters } from "./schemas";
import type {
  ApplicationSourceValue,
  ApplicationStatusValue,
  EmploymentTypeValue,
  SortValue,
} from "./constants";

/**
 * Pure translation of dashboard filters into Prisma `where` / `orderBy`.
 *
 * It is a separate, dependency-free module for one reason: `userId` is a
 * required argument, so there is no code path that can build a query without an
 * owner. That property is unit-tested.
 */

export type ApplicationWhere = {
  userId: string;
  status?: { in: ApplicationStatusValue[] };
  source?: { in: ApplicationSourceValue[] };
  employmentType?: { in: EmploymentTypeValue[] };
  OR?: Array<
    | { companyName: { contains: string; mode: "insensitive" } }
    | { jobTitle: { contains: string; mode: "insensitive" } }
  >;
};

export function buildApplicationWhere(
  userId: string,
  filters: Pick<
    ApplicationFilters,
    "q" | "status" | "source" | "employmentType"
  >,
): ApplicationWhere {
  if (!userId) {
    throw new Error("buildApplicationWhere requires an authenticated userId.");
  }

  const where: ApplicationWhere = { userId };

  if (filters.status.length > 0) where.status = { in: [...filters.status] };
  if (filters.source.length > 0) where.source = { in: [...filters.source] };
  if (filters.employmentType.length > 0) {
    where.employmentType = { in: [...filters.employmentType] };
  }

  const term = filters.q.trim();
  if (term.length > 0) {
    where.OR = [
      { companyName: { contains: term, mode: "insensitive" } },
      { jobTitle: { contains: term, mode: "insensitive" } },
    ];
  }

  return where;
}

export type ApplicationOrderBy = Array<Record<string, unknown>>;

export function buildApplicationOrderBy(sort: SortValue | string): ApplicationOrderBy {
  switch (sort) {
    case "oldest":
      return [{ createdAt: "asc" }];
    case "company":
      return [{ companyName: "asc" }, { jobTitle: "asc" }];
    case "followUp":
      // Rows without a follow-up date sink to the bottom rather than leading.
      return [{ followUpAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}
