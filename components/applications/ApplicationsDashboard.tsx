"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ClipboardList, Plus } from "lucide-react";
import PixelSparkle from "@/components/landing/PixelSparkle";
import Toast, { type ToastMessage } from "@/components/ui/Toast";
import {
  changeApplicationStatus,
  createApplication,
  deleteApplication,
  updateApplication,
} from "@/lib/actions/applications";
import { getApplicationTimeline } from "@/lib/actions/application-timeline";
import type {
  ApplicationEventRecord,
  ApplicationRecord,
  ApplicationSummary,
} from "@/lib/applications/queries";
import type { ApplicationStatusValue } from "@/lib/applications/constants";
import SummaryCards from "./SummaryCards";
import Toolbar, { type ToolbarState } from "./Toolbar";
import BoardView from "./BoardView";
import ListView from "./ListView";
import ApplicationFormModal, {
  type ApplicationFormValues,
} from "./ApplicationFormModal";
import ApplicationDetails from "./ApplicationDetails";

type Props = {
  applications: ApplicationRecord[];
  summary: ApplicationSummary;
  filters: ToolbarState;
};

type FormState =
  | { mode: "closed" }
  | { mode: "create"; status: ApplicationStatusValue }
  | { mode: "edit"; application: ApplicationRecord };

/**
 * Client shell for the dashboard.
 *
 * Filters live in the URL and the filtering itself happens in PostgreSQL, so
 * this component never re-implements a query — it pushes new search params and
 * lets the server component re-render. `useTransition` gives the pending state
 * that drives the toolbar spinner.
 */
export default function ApplicationsDashboard({
  applications,
  summary,
  filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [events, setEvents] = useState<ApplicationEventRecord[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastId = useRef(0);

  /**
   * Optimistic status overrides. They are dropped as soon as the server
   * responds — on failure the card snaps back and the error is surfaced, so the
   * board never shows a move that did not happen.
   */
  const [optimistic, setOptimistic] = useState<Record<string, ApplicationStatusValue>>({});

  const notify = useCallback((text: string, tone: "success" | "error" = "success") => {
    toastId.current += 1;
    setToast({ id: toastId.current, text, tone });
  }, []);

  const visible = useMemo(
    () =>
      applications.map((application) =>
        optimistic[application.id]
          ? { ...application, status: optimistic[application.id] }
          : application,
      ),
    [applications, optimistic],
  );

  const detailsApplication = detailsId
    ? (visible.find((application) => application.id === detailsId) ?? null)
    : null;

  /* ---------------------------------------------------------------- */
  /* URL-backed filters                                                */
  /* ---------------------------------------------------------------- */

  const applyFilters = useCallback(
    (next: Partial<ToolbarState>) => {
      const params = new URLSearchParams(searchParams.toString());
      const merged: ToolbarState = { ...filters, ...next };

      const setOrDelete = (key: string, value: string) => {
        if (value) params.set(key, value);
        else params.delete(key);
      };

      setOrDelete("view", merged.view === "board" ? "" : merged.view);
      setOrDelete("q", merged.q);
      setOrDelete("status", merged.status.join(","));
      setOrDelete("source", merged.source.join(","));
      setOrDelete("employmentType", merged.employmentType.join(","));
      setOrDelete("sort", merged.sort === "newest" ? "" : merged.sort);

      startTransition(() => {
        router.replace(`/applications${params.size > 0 ? `?${params}` : ""}`, {
          scroll: false,
        });
      });
    },
    [filters, router, searchParams],
  );

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  /* ---------------------------------------------------------------- */
  /* Mutations                                                         */
  /* ---------------------------------------------------------------- */

  const markPending = (id: string, pending: boolean) =>
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });

  const handleStatusChange = useCallback(
    async (id: string, status: ApplicationStatusValue) => {
      const previous = applications.find((application) => application.id === id)?.status;
      if (!previous || previous === status) return;

      setOptimistic((current) => ({ ...current, [id]: status }));
      markPending(id, true);

      const result = await changeApplicationStatus({ id, status });

      markPending(id, false);
      setOptimistic((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });

      if (result.ok) {
        refresh();
      } else if (result.reason === "unauthenticated") {
        notify("Your session expired. Sign in again to make changes.", "error");
      } else {
        notify("Could not move that application. It has been put back.", "error");
      }
    },
    [applications, notify, refresh],
  );

  const openDetails = useCallback(async (id: string) => {
    setDetailsId(id);
    setEvents([]);
    setEventsLoading(true);
    const result = await getApplicationTimeline({ id });
    setEvents(result.ok ? result.data : []);
    setEventsLoading(false);
  }, []);

  async function submitForm(values: ApplicationFormValues) {
    const isEdit = form.mode === "edit";
    const result = isEdit
      ? await updateApplication({ id: form.application.id, data: values })
      : await createApplication(values);

    if (result.ok) {
      setForm({ mode: "closed" });
      notify(isEdit ? "Application updated." : "Application added.");
      refresh();
      return { ok: true as const };
    }
    if (result.reason === "invalid") {
      return { ok: false as const, fieldErrors: result.fieldErrors };
    }
    if (result.reason === "unauthenticated") {
      return { ok: false as const, message: "Your session expired. Sign in again." };
    }
    return { ok: false as const, message: "Could not save this application." };
  }

  async function handleDelete() {
    if (!detailsApplication) return { ok: false, message: "Nothing to delete." };
    const result = await deleteApplication({ id: detailsApplication.id });
    if (result.ok) {
      setDetailsId(null);
      notify("Application deleted.");
      refresh();
      return { ok: true };
    }
    return { ok: false, message: "Could not delete this application." };
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-7">
      {/* Header */}
      <header>
        <p className="flex items-center gap-2.5 font-display text-[0.75rem] font-bold tracking-[0.16em] text-plum uppercase sm:text-[0.8125rem]">
          <PixelSparkle size={12} color="var(--color-terracotta)" />
          Your job search
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-section text-balance text-espresso">Applications</h1>
            <p className="mt-2 text-[1.0625rem] leading-[1.55] text-espresso/70">
              Track every opportunity in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ mode: "create", status: "SAVED" })}
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-[6px] border-2 border-[#54293e] bg-plum px-5 font-display text-[0.9375rem] font-bold whitespace-nowrap text-surface shadow-pixel-sm transition-colors hover:bg-[#7d4260] lg:shrink-0"
          >
            <Plus size={17} strokeWidth={2.6} aria-hidden="true" />
            Add application
          </button>
        </div>
      </header>

      <SummaryCards summary={summary} />

      <Toolbar state={filters} pending={isPending} onChange={applyFilters} />

      {/* Results */}
      {visible.length === 0 ? (
        <EmptyState
          filtered={
            filters.q.length > 0 ||
            filters.status.length > 0 ||
            filters.source.length > 0 ||
            filters.employmentType.length > 0
          }
          onAdd={() => setForm({ mode: "create", status: "SAVED" })}
          onClear={() =>
            applyFilters({ q: "", status: [], source: [], employmentType: [] })
          }
        />
      ) : filters.view === "board" ? (
        <BoardView
          applications={visible}
          pendingIds={pendingIds}
          onOpen={openDetails}
          onStatusChange={handleStatusChange}
          onAdd={(status) => setForm({ mode: "create", status })}
        />
      ) : (
        <ListView
          applications={visible}
          pendingIds={pendingIds}
          onOpen={openDetails}
          onStatusChange={handleStatusChange}
        />
      )}

      <AnimatePresence>
        {form.mode !== "closed" && (
          <ApplicationFormModal
            key={form.mode === "edit" ? form.application.id : "create"}
            application={form.mode === "edit" ? form.application : null}
            defaultStatus={form.mode === "create" ? form.status : undefined}
            onClose={() => setForm({ mode: "closed" })}
            onSubmit={submitForm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailsApplication && (
          <ApplicationDetails
            key={detailsApplication.id}
            application={detailsApplication}
            events={events}
            eventsLoading={eventsLoading}
            onClose={() => setDetailsId(null)}
            onEdit={() => {
              setForm({ mode: "edit", application: detailsApplication });
              setDetailsId(null);
            }}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function EmptyState({
  filtered,
  onAdd,
  onClear,
}: {
  filtered: boolean;
  onAdd: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-[10px] border-2 border-dashed border-line bg-surface px-5 py-12 text-center">
      <span className="pixel-notch-sm mx-auto inline-flex size-12 items-center justify-center border-2 border-plum/35 bg-plum/10">
        <ClipboardList size={22} strokeWidth={2} className="text-plum" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-[1.125rem] font-bold text-espresso">
        {filtered ? "Nothing matches those filters" : "No applications yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-[28rem] text-[0.9375rem] leading-[1.55] text-espresso/65">
        {filtered
          ? "Try a different search, or clear the filters to see everything you are tracking."
          : "Add the first role you are chasing and it will appear on the board straight away."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        {filtered && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center rounded-[6px] border-2 border-line bg-stone px-4 font-display text-[0.9375rem] font-bold text-espresso"
          >
            Clear filters
          </button>
        )}
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border-2 border-[#54293e] bg-plum px-5 font-display text-[0.9375rem] font-bold text-surface shadow-pixel-sm hover:bg-[#7d4260]"
        >
          <Plus size={16} strokeWidth={2.6} aria-hidden="true" />
          Add application
        </button>
      </div>
    </div>
  );
}
