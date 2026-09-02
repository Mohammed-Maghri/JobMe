import { describe, expect, it } from "vitest";
import {
  buildApplicationOrderBy,
  buildApplicationWhere,
} from "@/lib/applications/query-builder";
import { applicationFiltersSchema } from "@/lib/applications/schemas";

const filters = (
  overrides: Partial<{
    q: string;
    status: string;
    source: string;
    employmentType: string;
  }> = {},
) =>
  applicationFiltersSchema.parse({
    q: overrides.q,
    status: overrides.status,
    source: overrides.source,
    employmentType: overrides.employmentType,
  });

/**
 * Ownership is enforced by making `userId` a required argument of the only
 * function that builds a query. These tests pin that down: there is no code
 * path that produces a `where` clause without an owner.
 */
describe("ownership scoping", () => {
  it("always scopes to the given user", () => {
    const where = buildApplicationWhere("user-a", filters());
    expect(where.userId).toBe("user-a");
  });

  it("keeps the owner even when every filter is applied", () => {
    const where = buildApplicationWhere("user-a", {
      q: "engineer",
      status: ["APPLIED"],
      source: ["APPLYPILOT"],
      employmentType: ["APPRENTICESHIP"],
    });
    expect(where.userId).toBe("user-a");
    expect(where.status).toEqual({ in: ["APPLIED"] });
    expect(where.source).toEqual({ in: ["APPLYPILOT"] });
    expect(where.employmentType).toEqual({ in: ["APPRENTICESHIP"] });
  });

  it("refuses to build a query without a user", () => {
    expect(() => buildApplicationWhere("", filters())).toThrow(/authenticated/i);
  });

  it("cannot have its owner overridden through the search term", () => {
    const where = buildApplicationWhere("user-a", {
      q: '{"userId":"user-b"}',
      status: [],
      source: [],
      employmentType: [],
    });
    expect(where.userId).toBe("user-a");
    // The term only ever reaches the OR branch as a plain substring match.
    expect(where.OR).toHaveLength(2);
  });
});

describe("filtering and sorting", () => {
  it("filters on contract type, which is why it is a closed set", () => {
    const where = buildApplicationWhere(
      "user-a",
      filters({ employmentType: "apprenticeship,internship" }),
    );
    expect(where.employmentType).toEqual({
      in: ["APPRENTICESHIP", "INTERNSHIP"],
    });
  });

  it("omits empty filters instead of matching nothing", () => {
    const where = buildApplicationWhere("user-a", filters());
    expect(where.status).toBeUndefined();
    expect(where.source).toBeUndefined();
    expect(where.employmentType).toBeUndefined();
    expect(where.OR).toBeUndefined();
  });

  it("searches company and job title case-insensitively", () => {
    const where = buildApplicationWhere("user-a", filters({ q: "Qonto" }));
    expect(where.OR).toEqual([
      { companyName: { contains: "Qonto", mode: "insensitive" } },
      { jobTitle: { contains: "Qonto", mode: "insensitive" } },
    ]);
  });

  it("ignores a whitespace-only search", () => {
    expect(buildApplicationWhere("user-a", filters({ q: "    " })).OR).toBeUndefined();
  });

  it("maps each sort option to a deterministic order", () => {
    expect(buildApplicationOrderBy("newest")).toEqual([{ createdAt: "desc" }]);
    expect(buildApplicationOrderBy("oldest")).toEqual([{ createdAt: "asc" }]);
    expect(buildApplicationOrderBy("company")).toEqual([
      { companyName: "asc" },
      { jobTitle: "asc" },
    ]);
    expect(buildApplicationOrderBy("followUp")[0]).toEqual({
      followUpAt: { sort: "asc", nulls: "last" },
    });
  });

  it("falls back to newest for an unknown sort", () => {
    expect(buildApplicationOrderBy("whatever")).toEqual([{ createdAt: "desc" }]);
  });
});
