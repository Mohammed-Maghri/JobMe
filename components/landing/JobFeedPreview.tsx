"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Search, SlidersHorizontal } from "lucide-react";
import JobCard from "./JobCard";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import TypingText from "./TypingText";
import { JOB_FILTERS, JOBS } from "./content";
import { useAuth } from "@/components/auth/AuthProvider";
import { listSavedJobs, toggleSavedJob } from "@/lib/actions/saved-jobs";
import { CONTAINER } from "./layout";

/** Stable identity so the derived value below does not change every render. */
const EMPTY_SAVED_JOBS: string[] = [];

export default function JobFeedPreview() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const prefersReducedMotion = useReducedMotion();
  const { user, openAuth, readyIntent, consumeIntent } = useAuth();

  /**
   * Saving is a protected action. The button is always visible, but the write
   * happens in a server action that re-checks the session — hiding the control
   * would not be authorization on its own.
   */
  const persistSave = useCallback(async (jobId: string) => {
    setSavingJobId(jobId);
    try {
      const result = await toggleSavedJob(jobId);
      if (result.ok) {
        setSavedJobs(result.savedJobIds);
      } else if (result.reason === "unauthenticated") {
        // The session expired between render and click.
        setSavedJobs([]);
        openAuth("signin", { intent: { type: "save-job", jobId } });
      }
    } finally {
      setSavingJobId(null);
    }
  }, [openAuth]);

  /* Load the shortlist for whoever is signed in. */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    /*
      Signing in on this page immediately navigates to the tracker, which
      aborts this request mid-flight. An abort is not a failure, and without a
      `catch` the rejection surfaced as an unhandled error on every sign-in.
      A genuine failure is equally non-fatal: the shortlist just stays empty
      until the next load.
    */
    void listSavedJobs()
      .then((result) => {
        if (!cancelled && result.ok) setSavedJobs(result.savedJobIds);
      })
      .catch(() => {
        /* Cancelled by navigation, or unreachable. Nothing to show either way. */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  /**
   * Signed-out visitors never see saved state — derived rather than cleared, so
   * signing back in does not flash an empty list before the fetch lands.
   */
  const visibleSavedJobs = user ? savedJobs : EMPTY_SAVED_JOBS;

  /* Replay a save that was interrupted by the sign-in modal. */
  useEffect(() => {
    if (readyIntent?.type !== "save-job") return;
    const { jobId } = readyIntent;
    consumeIntent();
    startTransition(() => {
      void persistSave(jobId);
    });
  }, [readyIntent, consumeIntent, persistSave]);

  const toggleFilter = (id: string) =>
    setActiveFilters((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );

  const toggleSave = (id: string) => {
    if (!user) {
      // Remember what they were trying to do, then ask them to sign in.
      openAuth("signin", { intent: { type: "save-job", jobId: id } });
      return;
    }
    void persistSave(id);
  };

  /* A job has to satisfy every active filter, the way a real facet search would. */
  const visibleJobs = useMemo(
    () =>
      activeFilters.length === 0
        ? JOBS
        : JOBS.filter((job) =>
            activeFilters.every((filter) => job.filters.includes(filter)),
          ),
    [activeFilters],
  );

  return (
    <section
      id="find-jobs"
      aria-labelledby="find-jobs-heading"
      className="border-t-2 border-line/70 py-14 sm:py-16 lg:py-20"
    >
      <div className={CONTAINER}>
        <Reveal>
          <SectionHeading
            id="find-jobs-heading"
            eyebrow="Saving a role"
            title="Save a role and it lands on your board."
            description="A sample of roles, to show what saving does. Save one and it appears in the Saved column of your board, ready to move along."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-9 rounded-[10px] border-2 border-line bg-surface p-4 shadow-pixel-sm sm:p-6 lg:mt-11">
            {/* Search row */}
            <div className="flex items-center gap-3 rounded-[8px] border-2 border-line bg-stone px-3 py-2.5">
              <Search
                size={18}
                strokeWidth={2.1}
                className="shrink-0 text-espresso/55"
                aria-hidden="true"
              />
              <p className="min-w-0 flex-1 truncate text-[0.9375rem] text-espresso/80">
                <TypingText text="frontend engineer · alternance · Paris" />
              </p>
              <span className="hidden shrink-0 items-center gap-1.5 text-[0.75rem] font-semibold tracking-[0.06em] text-espresso/50 uppercase sm:flex">
                <SlidersHorizontal size={14} strokeWidth={2.1} aria-hidden="true" />
                Filters
              </span>
            </div>

            {/* Filter chips */}
            <fieldset className="mt-4">
              <legend className="sr-only">Filter opportunities</legend>
              <ul className="flex flex-wrap gap-2">
                {JOB_FILTERS.map((filter) => {
                  const active = activeFilters.includes(filter.id);
                  return (
                    <li key={filter.id}>
                      <motion.button
                        type="button"
                        onClick={() => toggleFilter(filter.id)}
                        aria-pressed={active}
                        whileTap={
                          prefersReducedMotion ? undefined : { scale: 0.96 }
                        }
                        className={[
                          "pixel-notch-sm inline-flex min-h-11 items-center gap-1.5 border-2 px-3.5 text-[0.875rem] font-semibold transition-colors duration-150",
                          active
                            ? "border-plum bg-plum text-surface"
                            : "border-line bg-stone text-espresso/75 hover:border-plum/45 hover:text-plum",
                        ].join(" ")}
                      >
                        {active && (
                          <Check size={14} strokeWidth={3} aria-hidden="true" />
                        )}
                        {filter.label}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </fieldset>

            {/* Result count */}
            <div
              aria-live="polite"
              className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-line/60 pt-5"
            >
              <p className="text-[0.8125rem] text-espresso/60">
                {visibleJobs.length} of {JOBS.length} example roles shown
                {activeFilters.length > 0 && " for your filters"}
              </p>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilters([])}
                  className="inline-flex min-h-11 items-center rounded-[4px] px-1 font-display text-[0.875rem] font-bold text-plum underline underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Results */}
            {visibleJobs.length > 0 ? (
              <ul className="mt-4 grid gap-4">
                {visibleJobs.map((job) => (
                  <li key={job.id}>
                    <JobCard
                      job={job}
                      saved={visibleSavedJobs.includes(job.id)}
                      saving={savingJobId === job.id}
                      onToggleSave={toggleSave}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-[10px] border-2 border-dashed border-line bg-stone px-4 py-8 text-center text-[0.9375rem] text-espresso/65">
                No example role matches every filter at once. Remove one to see
                the rest of the feed.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
