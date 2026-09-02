"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGrid, List, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import {
  APPLICATION_SOURCES,
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  SORT_OPTIONS,
  SOURCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type ApplicationSourceValue,
  type ApplicationStatusValue,
  type EmploymentTypeValue,
  type SortValue,
  type ViewValue,
} from "@/lib/applications/constants";

export type ToolbarState = {
  view: ViewValue;
  q: string;
  status: ApplicationStatusValue[];
  source: ApplicationSourceValue[];
  employmentType: EmploymentTypeValue[];
  sort: SortValue;
};

type Props = {
  state: ToolbarState;
  pending: boolean;
  onChange: (next: Partial<ToolbarState>) => void;
};

/**
 * Search, filters and the view switcher.
 *
 * Everything here writes to the URL, so filters are shareable and the actual
 * filtering happens in PostgreSQL rather than over an already-fetched page.
 * The layout wraps rather than growing, so a long filter set can never push the
 * header off-screen.
 */
export default function Toolbar({ state, pending, onChange }: Props) {
  const [term, setTerm] = useState(state.q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const panelId = "applications-filters";
  const firstRender = useRef(true);

  /* Debounce typing so each keystroke is not its own query. */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      if (term !== state.q) onChange({ q: term });
    }, 300);
    return () => window.clearTimeout(id);
  }, [term, state.q, onChange]);

  const activeFilterCount =
    state.status.length + state.source.length + state.employmentType.length;

  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <div className="relative w-full sm:w-auto sm:min-w-0 sm:flex-1 sm:max-w-[22rem]">
          <Search
            size={16}
            strokeWidth={2.1}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-espresso/45"
          />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search company or role"
            aria-label="Search applications by company or role"
            className="min-h-11 w-full rounded-[8px] border-2 border-line bg-surface pr-9 pl-9 text-[0.9375rem] text-espresso outline-none transition-colors placeholder:text-espresso/40 focus-visible:border-plum"
          />
          {pending && (
            <Loader2
              size={15}
              aria-hidden="true"
              className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-espresso/45"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls={panelId}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[8px] border-2 border-line bg-surface px-3.5 font-display text-[0.9375rem] font-bold text-espresso transition-colors hover:border-plum/45"
        >
          <SlidersHorizontal size={16} strokeWidth={2.2} aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="pixel-notch-sm inline-flex min-w-5 items-center justify-center bg-plum px-1 py-0.5 text-[0.6875rem] font-bold text-surface tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* View switcher */}
        <div
          role="group"
          aria-label="Switch view"
          className="ml-auto inline-flex shrink-0 overflow-hidden rounded-[8px] border-2 border-line bg-surface"
        >
          {([
            { value: "board", label: "Board", icon: LayoutGrid },
            { value: "list", label: "List", icon: List },
          ] as const).map((option) => {
            const active = state.view === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ view: option.value })}
                aria-pressed={active}
                className={`inline-flex min-h-11 items-center gap-2 px-3.5 font-display text-[0.9375rem] font-bold transition-colors ${
                  active
                    ? "bg-plum text-surface"
                    : "text-espresso/70 hover:text-plum"
                }`}
              >
                <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtersOpen && (
        <div
          id={panelId}
          className="mt-3 rounded-[10px] border-2 border-line bg-surface p-4 shadow-pixel-xs"
        >
          <fieldset>
            <legend className="font-display text-[0.75rem] font-bold tracking-[0.12em] text-espresso/55 uppercase">
              Status
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {APPLICATION_STATUSES.map((status) => {
                const active = state.status.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ status: toggle(state.status, status) })}
                    className={`pixel-notch-sm inline-flex min-h-11 items-center gap-1.5 border-2 px-3 text-[0.875rem] font-semibold transition-colors ${
                      active
                        ? `${STATUS_COLORS[status].border} ${STATUS_COLORS[status].tint} ${STATUS_COLORS[status].text}`
                        : "border-line bg-stone text-espresso/75 hover:border-plum/45"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`size-2 shrink-0 rounded-full ${
                        active ? STATUS_COLORS[status].fill : "bg-espresso/25"
                      }`}
                    />
                    {STATUS_LABELS[status]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="font-display text-[0.75rem] font-bold tracking-[0.12em] text-espresso/55 uppercase">
              Source
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {APPLICATION_SOURCES.map((source) => {
                const active = state.source.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ source: toggle(state.source, source) })}
                    className={`pixel-notch-sm inline-flex min-h-11 items-center border-2 px-3 text-[0.875rem] font-semibold transition-colors ${
                      active
                        ? "border-plum bg-plum text-surface"
                        : "border-line bg-stone text-espresso/75 hover:border-plum/45"
                    }`}
                  >
                    {SOURCE_LABELS[source]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="font-display text-[0.75rem] font-bold tracking-[0.12em] text-espresso/55 uppercase">
              Contract type
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {EMPLOYMENT_TYPES.map((type) => {
                const active = state.employmentType.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      onChange({ employmentType: toggle(state.employmentType, type) })
                    }
                    className={`pixel-notch-sm inline-flex min-h-11 items-center border-2 px-3 text-[0.875rem] font-semibold transition-colors ${
                      active
                        ? "border-plum bg-plum text-surface"
                        : "border-line bg-stone text-espresso/75 hover:border-plum/45"
                    }`}
                  >
                    {EMPLOYMENT_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <label
                htmlFor="applications-sort"
                className="block font-display text-[0.75rem] font-bold tracking-[0.12em] text-espresso/55 uppercase"
              >
                Sort by
              </label>
              <select
                id="applications-sort"
                value={state.sort}
                onChange={(event) => onChange({ sort: event.target.value as SortValue })}
                className="mt-2 min-h-11 rounded-[6px] border-2 border-line bg-stone px-3 text-[0.875rem] font-semibold text-espresso outline-none focus-visible:border-plum"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  onChange({ status: [], source: [], employmentType: [] })
                }
                className="inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-2 font-display text-[0.875rem] font-bold text-plum underline underline-offset-4"
              >
                <X size={14} strokeWidth={2.4} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
