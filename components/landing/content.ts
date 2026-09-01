import {
  Bell,
  BookmarkPlus,
  CalendarCheck,
  ClipboardList,
  Compass,
  FileCheck2,
  FilePlus2,
  Handshake,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tone } from "./tones";

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export type NavLink = { label: string; href: string };

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Find jobs", href: "#find-jobs" },
  { label: "Applications", href: "#applications" },
  { label: "How it works", href: "#how-it-works" },
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
    id: "fresh",
    icon: Search,
    tone: "terracotta",
    lines: ["New jobs", "added daily"],
  },
  {
    id: "match",
    icon: Sparkles,
    tone: "mustard",
    lines: ["Matches based", "on your profile"],
  },
  {
    id: "track",
    icon: Bell,
    tone: "plum",
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
    id: "fresh-opportunities",
    icon: Search,
    tone: "terracotta",
    title: "Fresh opportunities",
    description:
      "Discover newly published jobs, internships and alternance opportunities selected around your goals.",
    linkLabel: "Browse jobs",
    href: "#find-jobs",
  },
  {
    id: "smart-matching",
    icon: Target,
    tone: "sage",
    title: "Smart matching",
    description:
      "Understand why an opportunity fits your skills, experience and preferences before applying.",
    linkLabel: "See your matches",
    href: "#find-jobs",
  },
  {
    id: "stay-organised",
    icon: ClipboardList,
    tone: "plum",
    title: "Stay organised",
    description:
      "Track every application, interview and follow-up from one clear workspace.",
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
    id: "preferences",
    title: "Tell us what you want",
    description:
      "Choose your roles, location, technologies and preferred contract types.",
    icon: SlidersHorizontal,
    tone: "plum",
  },
  {
    id: "discover",
    title: "Receive fresh opportunities",
    description:
      "See newly published positions matching your search every day.",
    icon: Compass,
    tone: "terracotta",
  },
  {
    id: "prepare",
    title: "Prepare your application",
    description:
      "Save the role, review your match and organise the documents you need.",
    icon: FileCheck2,
    tone: "mustard",
  },
  {
    id: "track",
    title: "Track every step",
    description:
      "Manage follow-ups, interviews and offers from one workspace.",
    icon: ClipboardList,
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
  match: number;
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
    match: 94,
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
    match: 88,
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
    match: 79,
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
      { label: "Find jobs", href: "#find-jobs" },
      { label: "Applications", href: "#applications" },
      { label: "How it works", href: "#how-it-works" },
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
