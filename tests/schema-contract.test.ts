import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync("prisma/schema.prisma", "utf8");

function modelBlock(name: string): string {
  const start = schema.indexOf(`model ${name} {`);
  expect(start, `model ${name} should exist`).toBeGreaterThan(-1);
  return schema.slice(start, schema.indexOf("\n}", start));
}

/**
 * Contract type has to be an enum, not a string. Free text cannot be filtered
 * reliably — "CDI", "cdi" and "Permanent" would all be distinct values — and
 * filtering on it is the whole reason it exists.
 */
describe("employment type is a closed set", () => {
  it("is stored as an enum column", () => {
    expect(modelBlock("Application")).toMatch(/employmentType\s+EmploymentType\?/);
  });

  it("declares the enum with the expected members", () => {
    const start = schema.indexOf("enum EmploymentType {");
    expect(start).toBeGreaterThan(-1);
    const block = schema.slice(start, schema.indexOf("\n}", start));
    for (const member of [
      "FULL_TIME", "FIXED_TERM", "APPRENTICESHIP",
      "INTERNSHIP", "FREELANCE", "PART_TIME",
    ]) {
      expect(block).toContain(member);
    }
  });

  it("is indexed so filtering does not scan the table", () => {
    expect(modelBlock("Application")).toMatch(
      /@@index\(\[userId, employmentType\]\)/,
    );
  });
});

/** The Gmail feature was removed; nothing may reference it. */
describe("gmail is fully removed", () => {
  it("has no Gmail models or enums left in the schema", () => {
    for (const name of [
      "GmailConnection", "EmailImport", "EmailImportState",
      "DetectionConfidence", "sourceEmailId",
    ]) {
      expect(schema).not.toContain(name);
    }
  });

  it("no longer offers GMAIL as an application source", () => {
    const start = schema.indexOf("enum ApplicationSource {");
    const block = schema.slice(start, schema.indexOf("\n}", start));
    expect(block).not.toContain("GMAIL");
    expect(block).toContain("MANUAL");
  });
});

describe("required indexes", () => {
  const application = modelBlock("Application");

  it.each([
    ["userId", /@@index\(\[userId\]\)/],
    ["userId + status", /@@index\(\[userId, status\]\)/],
    ["userId + appliedAt", /@@index\(\[userId, appliedAt\]\)/],
    ["userId + employmentType", /@@index\(\[userId, employmentType\]\)/],
  ])("indexes %s", (_label, pattern) => {
    expect(application).toMatch(pattern);
  });

  it("cascades applications when a user is deleted", () => {
    expect(application).toMatch(/onDelete: Cascade/);
  });
});
