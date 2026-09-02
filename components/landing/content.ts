import {
  Bell,
  BookmarkPlus,
  CalendarCheck,
  ClipboardList,
  Compass,
  FilePlus2,
  Handshake,
  LayoutGrid,
  PieChart,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tone } from "./tones";

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export type NavLink = { label: string; href: string; id?: NavId };

/** Identifies the active entry without parsing the URL on the client. */
export type NavId = "applications";

/** Shown to signed-out visitors: an in-page anchor on the landing page. */
export const NAV_LINKS: readonly NavLink[] = [
  { label: "Applications", href: "#applications" },
] as const;

/**
 * Shown once signed in. A real route rather than an anchor, so the nav works
 * from any page.
 */
export const AUTHED_NAV_LINKS: readonly NavLink[] = [
  { label: "Applications", href: "/applications", id: "applications" },
] as const;

/* ------------------------------------------------------------------ */
/* Hero benefits                                                       */
/* ------------------------------------------------------------------ */

export type Benefit = {
  id: string;
  icon: LucideIcon;
  tone: Tone;
  lines: readonly [string, string];
  /** Small notification pulse on the follow-up reminder only. */
  pulse?: boolean;
};

export const BENEFITS: readonly Benefit[] = [
  {
    id: "track",
    icon: ClipboardList,
    tone: "plum",
    lines: ["Every application", "in one place"],
  },
  {
    id: "follow-up",
    icon: Bell,
    tone: "terracotta",
    lines: ["Stay on track", "and follow up"],
    pulse: true,
  },
] as const;

/* ------------------------------------------------------------------ */
/* Feature cards                                                       */
/* ------------------------------------------------------------------ */

export type Feature = {
  id: string;
  icon: LucideIcon;
  tone: Tone;
  title: string;
  description: string;
  linkLabel: string;
  href: string;
};

export const FEATURES: readonly Feature[] = [
  {
    id: "one-board",
    icon: LayoutGrid,
    tone: "plum",
    title: "One board for everything",
    description:
      "Every role you are chasing on a single board, from saved through to offer, with a count on each stage.",
    linkLabel: "View applications",
    href: "#applications",
  },
  {
    id: "follow-ups",
    icon: Bell,
    tone: "terracotta",
    title: "Never miss a follow-up",
    description:
      "Set a follow-up or interview date and it shows on the card, with anything overdue called out.",
    linkLabel: "View applications",
    href: "#applications",
  },
  {
    id: "progress",
    icon: PieChart,
    tone: "sage",
    title: "See where you stand",
    description:
      "Totals, interviews, offers and your response rate, counted from your own applications.",
    linkLabel: "View applications",
    href: "#applications",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Application pipeline                                                */
/* ------------------------------------------------------------------ */

export type PipelineStage = {
  id: string;
  label: string;
  count: number;
  icon: LucideIcon;
  tone: Tone;
  /** Plain-language status so meaning never depends on colour alone. */
  hint: string;
};

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  {
    id: "saved",
    label: "Saved",
    count: 8,
    icon: BookmarkPlus,
    tone: "mustard",
    hint: "Not sent yet",
  },
  {
    id: "applied",
    label: "Applied",
    count: 12,
    icon: FilePlus2,
    tone: "terracotta",
    hint: "Awaiting reply",
  },
  {
    id: "screening",
    label: "Screening",
    count: 5,
    icon: Users,
    tone: "plum",
    hint: "Recruiter call",
  },
  {
    id: "interview",
    label: "Interview",
    count: 3,
    icon: CalendarCheck,
    tone: "sage",
    hint: "Scheduled",
  },
  {
    id: "offer",
    label: "Offer",
    count: 1,
    icon: Handshake,
    tone: "sage",
    hint: "Under review",
  },
] as const;

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

export type Step = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: Tone;
};

export const STEPS: readonly Step[] = [
  {
    id: "add",
    title: "Add an application",
    description:
      "Company, role, contract type and where you found it. Two fields are required; the rest can wait.",
    icon: FilePlus2,
    tone: "plum",
  },
  {
    id: "move",
    title: "Move it along",
    description:
      "Drag it between stages, or pick a status from the card. Every change is recorded.",
    icon: Compass,
    tone: "terracotta",
  },
  {
    id: "remind",
    title: "Set a follow-up",
    description:
      "Add the date you plan to chase it, or an interview date, and the card will remind you.",
    icon: Bell,
    tone: "mustard",
  },
  {
    id: "review",
    title: "See how it is going",
    description:
      "Filter by stage, source or contract type, and read your response rate off the top of the board.",
    icon: PieChart,
    tone: "sage",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Job feed preview                                                    */
/* ------------------------------------------------------------------ */

export type JobFilter = { id: string; label: string };

export const JOB_FILTERS: readonly JobFilter[] = [
  { id: "alternance", label: "Alternance" },
  { id: "internship", label: "Internship" },
  { id: "junior", label: "Junior" },
  { id: "paris", label: "Paris" },
  { id: "remote", label: "Remote" },
  { id: "software-engineering", label: "Software engineering" },
] as const;

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  contract: string;
  postedLabel: string;
  /** ISO date backing the human-readable posted label. */
  postedAt: string;
  filters: readonly string[];
};

export const JOBS: readonly Job[] = [
  {
    id: "lumen-frontend",
    title: "Frontend Engineer",
    company: "Lumen Atelier",
    location: "Paris, France",
    contract: "Alternance · 12 months",
    postedLabel: "Posted 2 days ago",
    postedAt: "2026-08-30",
    filters: ["alternance", "paris", "software-engineering", "junior"],
  },
  {
    id: "maree-backend",
    title: "Backend Engineering Intern",
    company: "Marée Systems",
    location: "Remote · Europe",
    contract: "Internship · 6 months",
    postedLabel: "Posted 1 day ago",
    postedAt: "2026-08-31",
    filters: ["internship", "remote", "software-engineering"],
  },
  {
    id: "northwind-analyst",
    title: "Junior Product Analyst",
    company: "Northwind Grid",
    location: "Paris, France",
    contract: "CDI · Full-time",
    postedLabel: "Posted 4 days ago",
    postedAt: "2026-08-28",
    filters: ["junior", "paris"],
  },
] as const;

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export type FooterColumn = {
  heading: string;
  links: readonly NavLink[];
};

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Find jobs", href: "/?browse=1#find-jobs" },
      { label: "Applications", href: "/applications" },
      { label: "How it works", href: "/?browse=1#how-it-works" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;
