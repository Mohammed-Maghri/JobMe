"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  Clock3,
  FileSignature,
  Loader2,
  MapPin,
} from "lucide-react";
import type { Job } from "./content";

type JobCardProps = {
  job: Job;
  saved: boolean;
  /** A save/unsave request for this job is in flight. */
  saving?: boolean;
  onToggleSave: (id: string) => void;
};

export default function JobCard({
  job,
  saved,
  saving = false,
  onToggleSave,
}: JobCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const SaveIcon = saved ? BookmarkCheck : Bookmark;

  return (
    <article className="rounded-[10px] border-2 border-line bg-surface p-4 shadow-pixel-xs transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-pixel sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <h3 className="font-display text-[1.0625rem] leading-tight font-bold text-espresso sm:text-[1.125rem]">
            {job.title}
          </h3>

          <ul className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem] text-espresso/70">
            <li className="flex items-center gap-1.5">
              <Building2 size={14} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only">Company: </span>
              {job.company}
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only">Location: </span>
              {job.location}
            </li>
            <li className="flex items-center gap-1.5">
              <FileSignature size={14} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only">Contract: </span>
              {job.contract}
            </li>
            <li className="flex items-center gap-1.5">
              <Clock3 size={14} strokeWidth={2} aria-hidden="true" />
              <time dateTime={job.postedAt}>{job.postedLabel}</time>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 border-t-2 border-line/60 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 lg:shrink-0 lg:border-t-0 lg:pt-0">

          <div className="flex flex-wrap items-center gap-2.5">
            <motion.button
              type="button"
              onClick={() => onToggleSave(job.id)}
              aria-pressed={saved}
              aria-busy={saving || undefined}
              disabled={saving}
              aria-label={`${saved ? "Remove" : "Save"} ${job.title} at ${job.company}`}
              whileTap={prefersReducedMotion || saving ? undefined : { scale: 0.97 }}
              className={[
                "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[6px] border-2 px-4 font-display text-[0.9375rem] font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none",
                saved
                  ? "border-sage/60 bg-sage/15 text-sage"
                  : "border-line bg-stone text-espresso/80 hover:border-plum/45 hover:text-plum",
              ].join(" ")}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <SaveIcon size={16} strokeWidth={2.2} aria-hidden="true" />
              )}
              {saved ? "Saved" : "Save"}
            </motion.button>

            <Link
              href="/signup"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[6px] border-2 border-[#a44f31] bg-terracotta px-4 font-display text-[0.9375rem] font-bold whitespace-nowrap text-surface shadow-pixel-xs transition-[transform,background-color] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-[#bf5c3b] sm:flex-none"
            >
              View job
              <ArrowUpRight size={16} strokeWidth={2.4} aria-hidden="true" />
              <span className="sr-only"> — {job.title}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
