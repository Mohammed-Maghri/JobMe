export const APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number];

/** The five stages that get a Kanban column. */
export const BOARD_STATUSES = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
] as const satisfies readonly ApplicationStatusValue[];

/**
 * Rejected and Withdrawn are closed outcomes. They stay reachable from filters
 * and the list view instead of taking up a column on the board.
 */
export const CLOSED_STATUSES = [
  "REJECTED",
  "WITHDRAWN",
] as const satisfies readonly ApplicationStatusValue[];

export const STATUS_LABELS: Record<ApplicationStatusValue, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

/**
 * One distinct colour per stage, so the board can be read at a glance.
 *
 * Every status also carries its name in text — colour is never the only
 * signal, which keeps the board usable for colour-blind readers and in
 * grayscale.
 */
export type StatusColor = {
  /** Text colour for the label. */
  text: string;
  /** Border for badges and chips. */
  border: string;
  /** Faint background wash. */
  tint: string;
  /** Solid fill, for dots and active chips. */
  fill: string;
  /** Left edge of a board card. */
  accent: string;
};

export const STATUS_COLORS: Record<ApplicationStatusValue, StatusColor> = {
  SAVED: {
    text: "text-mustard",
    border: "border-mustard/55",
    tint: "bg-mustard/14",
    fill: "bg-mustard",
    accent: "border-l-mustard",
  },
  APPLIED: {
    text: "text-denim",
    border: "border-denim/50",
    tint: "bg-denim/12",
    fill: "bg-denim",
    accent: "border-l-denim",
  },
  SCREENING: {
    text: "text-plum",
    border: "border-plum/50",
    tint: "bg-plum/12",
    fill: "bg-plum",
    accent: "border-l-plum",
  },
  INTERVIEW: {
    text: "text-terracotta",
    border: "border-terracotta/50",
    tint: "bg-terracotta/12",
    fill: "bg-terracotta",
    accent: "border-l-terracotta",
  },
  OFFER: {
    text: "text-fern",
    border: "border-fern/55",
    tint: "bg-fern/14",
    fill: "bg-fern",
    accent: "border-l-fern",
  },
  REJECTED: {
    text: "text-brick",
    border: "border-brick/50",
    tint: "bg-brick/10",
    fill: "bg-brick",
    accent: "border-l-brick",
  },
  WITHDRAWN: {
    text: "text-ash",
    border: "border-ash/50",
    tint: "bg-ash/12",
    fill: "bg-ash",
    accent: "border-l-ash",
  },
};

/**
 * Progress order used to decide whether an automated suggestion would move an
 * application backwards. Closed outcomes sit outside the ladder — they can be
 * reached from anywhere, but nothing automatic climbs back out of them.
 */
export const STATUS_RANK: Record<ApplicationStatusValue, number> = {
  SAVED: 0,
  APPLIED: 1,
  SCREENING: 2,
  INTERVIEW: 3,
  OFFER: 4,
  REJECTED: -1,
  WITHDRAWN: -1,
};

export const WORK_MODES = ["ONSITE", "HYBRID", "REMOTE"] as const;
export type WorkModeValue = (typeof WORK_MODES)[number];

export const WORK_MODE_LABELS: Record<WorkModeValue, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

export const APPLICATION_SOURCES = ["MANUAL", "APPLYPILOT"] as const;
export type ApplicationSourceValue = (typeof APPLICATION_SOURCES)[number];

export const SOURCE_LABELS: Record<ApplicationSourceValue, string> = {
  MANUAL: "Manual",
  APPLYPILOT: "ApplyPilot",
};

/**
 * Contract types, picked from a list rather than typed free-hand — the whole
 * point is being able to filter on them, and free text cannot be filtered
 * reliably ("CDI", "cdi", "C.D.I.", "Permanent" would all be separate values).
 *
 * Labels carry the French term alongside the English one, since the market
 * this is built for uses both.
 */
export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "FIXED_TERM",
  "APPRENTICESHIP",
  "INTERNSHIP",
  "FREELANCE",
  "PART_TIME",
] as const;

export type EmploymentTypeValue = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentTypeValue, string> = {
  FULL_TIME: "Full-time (CDI)",
  FIXED_TERM: "Fixed-term (CDD)",
  APPRENTICESHIP: "Apprenticeship (Alternance)",
  INTERNSHIP: "Internship (Stage)",
  FREELANCE: "Freelance",
  PART_TIME: "Part-time",
};

/** Compact form for badges, where the parenthetical would not fit. */
export const EMPLOYMENT_TYPE_SHORT: Record<EmploymentTypeValue, string> = {
  FULL_TIME: "CDI",
  FIXED_TERM: "CDD",
  APPRENTICESHIP: "Alternance",
  INTERNSHIP: "Stage",
  FREELANCE: "Freelance",
  PART_TIME: "Part-time",
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "company", label: "Company A–Z" },
  { value: "followUp", label: "Follow-up date" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export const VIEWS = ["board", "list"] as const;
export type ViewValue = (typeof VIEWS)[number];
