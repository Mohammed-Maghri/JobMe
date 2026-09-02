import { describe, expect, it } from "vitest";
import {
  applicationInputSchema,
  applicationFiltersSchema,
  collectFieldErrors,
} from "@/lib/applications/schemas";

/**
 * The schema that guards `createApplication` / `updateApplication`. Because the
 * browser runs the same object, anything asserted here is also what the user
 * sees inline.
 */
describe("application input validation", () => {
  const valid = { companyName: "Qonto", jobTitle: "Product Engineer" };

  it("accepts the minimum required pair", () => {
    const result = applicationInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("SAVED");
      expect(result.data.jobUrl).toBeNull();
    }
  });

  it("rejects a missing company name", () => {
    const result = applicationInputSchema.safeParse({ ...valid, companyName: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(collectFieldErrors(result.error).companyName).toMatch(/required/i);
    }
  });

  it("rejects a missing job title", () => {
    const result = applicationInputSchema.safeParse({ ...valid, jobTitle: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(collectFieldErrors(result.error).jobTitle).toMatch(/required/i);
    }
  });

  it("trims whitespace around text fields", () => {
    const result = applicationInputSchema.parse({
      companyName: "  Doctolib  ",
      jobTitle: "  Backend Engineer  ",
      location: "  Paris  ",
    });
    expect(result.companyName).toBe("Doctolib");
    expect(result.jobTitle).toBe("Backend Engineer");
    expect(result.location).toBe("Paris");
  });

  it("turns blank optional fields into null rather than empty strings", () => {
    const result = applicationInputSchema.parse({
      ...valid,
      location: "",
      notes: "   ",
      contactEmail: "",
      appliedAt: "",
    });
    expect(result.location).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.contactEmail).toBeNull();
    expect(result.appliedAt).toBeNull();
  });

  it("rejects a URL without a scheme and accepts one with https", () => {
    expect(
      applicationInputSchema.safeParse({ ...valid, jobUrl: "qonto.com/jobs" }).success,
    ).toBe(false);
    expect(
      applicationInputSchema.safeParse({ ...valid, jobUrl: "https://qonto.com/jobs" })
        .success,
    ).toBe(true);
  });

  it("rejects a javascript: URL", () => {
    expect(
      applicationInputSchema.safeParse({ ...valid, jobUrl: "javascript:alert(1)" })
        .success,
    ).toBe(false);
  });

  it("rejects a malformed contact email", () => {
    const result = applicationInputSchema.safeParse({ ...valid, contactEmail: "nope" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(
      applicationInputSchema.safeParse({ ...valid, status: "PROMOTED" }).success,
    ).toBe(false);
  });

  it("rejects free-text contract types and accepts the enum", () => {
    // The old free-text column is gone; only known values are allowed.
    expect(
      applicationInputSchema.safeParse({ ...valid, employmentType: "CDI" }).success,
    ).toBe(false);
    expect(
      applicationInputSchema.parse({ ...valid, employmentType: "FULL_TIME" })
        .employmentType,
    ).toBe("FULL_TIME");
    expect(
      applicationInputSchema.parse({ ...valid, employmentType: "" }).employmentType,
    ).toBeNull();
  });

  it("rejects an unknown work mode but allows an empty one", () => {
    expect(
      applicationInputSchema.safeParse({ ...valid, workMode: "TELEPATHIC" }).success,
    ).toBe(false);
    expect(applicationInputSchema.parse({ ...valid, workMode: "" }).workMode).toBeNull();
  });

  it("parses dates into Date objects and rejects nonsense", () => {
    const parsed = applicationInputSchema.parse({ ...valid, appliedAt: "2026-08-01" });
    expect(parsed.appliedAt).toBeInstanceOf(Date);
    expect(
      applicationInputSchema.safeParse({ ...valid, appliedAt: "not-a-date" }).success,
    ).toBe(false);
  });

  it("caps note length", () => {
    const result = applicationInputSchema.safeParse({
      ...valid,
      notes: "x".repeat(4001),
    });
    expect(result.success).toBe(false);
  });
});

describe("filter parsing", () => {
  it("falls back to safe defaults for junk input", () => {
    const filters = applicationFiltersSchema.parse({
      view: "spreadsheet",
      q: undefined,
      status: "NONSENSE",
      source: undefined,
      sort: "sideways",
    });
    expect(filters.view).toBe("board");
    expect(filters.sort).toBe("newest");
    expect(filters.status).toEqual([]);
    expect(filters.source).toEqual([]);
  });

  it("accepts comma-separated and repeated parameters", () => {
    const filters = applicationFiltersSchema.parse({
      view: "list",
      q: "  qonto  ",
      status: "applied,interview",
      source: ["applypilot", "manual"],
      sort: "company",
    });
    expect(filters.view).toBe("list");
    expect(filters.q).toBe("qonto");
    expect(filters.status).toEqual(["APPLIED", "INTERVIEW"]);
    expect(filters.source).toEqual(["APPLYPILOT", "MANUAL"]);
    expect(filters.sort).toBe("company");
  });

  it("drops unrecognised values but keeps valid neighbours", () => {
    const filters = applicationFiltersSchema.parse({
      status: "applied,teleported,offer",
    });
    expect(filters.status).toEqual(["APPLIED", "OFFER"]);
  });

  it("parses the contract-type filter", () => {
    const filters = applicationFiltersSchema.parse({
      employmentType: "apprenticeship,nonsense,internship",
    });
    expect(filters.employmentType).toEqual(["APPRENTICESHIP", "INTERNSHIP"]);
  });
});
