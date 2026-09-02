import { describe, expect, it } from "vitest";
import { canAutoAdvance, isClosedStatus } from "@/lib/applications/status";
import { BOARD_STATUSES } from "@/lib/applications/constants";

/**
 * The forward-only rule for *automated* status changes. A person can move a
 * card anywhere; this governs what the Gmail importer may do unattended.
 */
describe("automatic status transitions", () => {
  it("advances along the pipeline", () => {
    expect(canAutoAdvance("SAVED", "APPLIED")).toBe(true);
    expect(canAutoAdvance("APPLIED", "SCREENING")).toBe(true);
    expect(canAutoAdvance("SCREENING", "INTERVIEW")).toBe(true);
    expect(canAutoAdvance("INTERVIEW", "OFFER")).toBe(true);
  });

  it("allows skipping a stage when the email jumps ahead", () => {
    expect(canAutoAdvance("APPLIED", "OFFER")).toBe(true);
  });

  it("never moves an application backwards", () => {
    expect(canAutoAdvance("INTERVIEW", "APPLIED")).toBe(false);
    expect(canAutoAdvance("OFFER", "SCREENING")).toBe(false);
    expect(canAutoAdvance("APPLIED", "SAVED")).toBe(false);
  });

  it("treats a no-op as no move", () => {
    for (const status of BOARD_STATUSES) {
      expect(canAutoAdvance(status, status)).toBe(false);
    }
  });

  it("can always reach a closed outcome", () => {
    expect(canAutoAdvance("APPLIED", "REJECTED")).toBe(true);
    expect(canAutoAdvance("INTERVIEW", "REJECTED")).toBe(true);
    expect(canAutoAdvance("SAVED", "WITHDRAWN")).toBe(true);
  });

  it("never climbs back out of a closed outcome", () => {
    expect(canAutoAdvance("REJECTED", "INTERVIEW")).toBe(false);
    expect(canAutoAdvance("WITHDRAWN", "APPLIED")).toBe(false);
    expect(canAutoAdvance("REJECTED", "OFFER")).toBe(false);
  });

  it("identifies closed outcomes", () => {
    expect(isClosedStatus("REJECTED")).toBe(true);
    expect(isClosedStatus("WITHDRAWN")).toBe(true);
    expect(isClosedStatus("APPLIED")).toBe(false);
  });
});
