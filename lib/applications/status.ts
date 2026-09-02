import {
  CLOSED_STATUSES,
  STATUS_RANK,
  type ApplicationStatusValue,
} from "./constants";

export function isClosedStatus(status: ApplicationStatusValue): boolean {
  return (CLOSED_STATUSES as readonly string[]).includes(status);
}

/**
 * Whether an *automated* suggestion is allowed to move an application from
 * `from` to `to`.
 *
 * The rule is one-directional on purpose: an inbox is not an ordered log, so a
 * late-delivered "thanks for applying" must never drag an interview back to
 * Applied. A person can still make any move by hand — this only gates what the
 * Gmail importer may do on its own.
 */
export function canAutoAdvance(
  from: ApplicationStatusValue,
  to: ApplicationStatusValue,
): boolean {
  if (from === to) return false;
  // Nothing automatic climbs out of a closed outcome.
  if (isClosedStatus(from)) return false;
  // Reaching a closed outcome is always allowed — a rejection is new information.
  if (isClosedStatus(to)) return true;
  return STATUS_RANK[to] > STATUS_RANK[from];
}
