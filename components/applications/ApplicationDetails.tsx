"use client";

import { useState } from "react";
import {
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
  WORK_MODE_LABELS,
  type ApplicationStatusValue,
} from "@/lib/applications/constants";
import type {
  ApplicationEventRecord,
  ApplicationRecord,
} from "@/lib/applications/queries";
import CompanyAvatar from "./CompanyAvatar";
import { SourceBadge, StatusBadge } from "./Badges";
import { formatDate } from "./format";

type Props = {
  application: ApplicationRecord;
  events: ApplicationEventRecord[];
  eventsLoading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<{ ok: boolean; message?: string }>;
};

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Building2;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon
        size={15}
        strokeWidth={2.1}
        className="mt-0.5 shrink-0 text-espresso/45"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <dt className="text-[0.75rem] text-espresso/50">{label}</dt>
        <dd className="mt-0.5 text-[0.875rem] break-words text-espresso/85">
          {children}
        </dd>
      </div>
    </div>
  );
}

/**
 * Details drawer. Opens over the dashboard so the board stays where it was —
 * closing returns you to exactly the same scroll position, with no navigation.
 */
export default function ApplicationDetails({
  application,
  events,
  eventsLoading,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const place = [
    application.location,
    application.workMode ? WORK_MODE_LABELS[application.workMode] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await onDelete();
    if (!result.ok) {
      setError(result.message ?? "Could not delete this application.");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <Modal
      variant="drawer"
      title={application.jobTitle}
      description={application.companyName}
      onClose={onClose}
      busy={deleting}
      footer={
        confirming ? (
          <div>
            <p className="text-[0.875rem] leading-[1.5] text-espresso">
              Delete this application? Its status history goes with it. This
              cannot be undone.
            </p>
            <div className="mt-3 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="inline-flex min-h-11 items-center justify-center rounded-[6px] border-2 border-line bg-stone px-4 font-display text-[0.9375rem] font-bold text-espresso disabled:opacity-60"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border-2 border-[#a44f31] bg-terracotta px-5 font-display text-[0.9375rem] font-bold text-surface disabled:opacity-70"
              >
                {deleting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {deleting ? "Deleting…" : "Delete application"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border-2 border-terracotta/45 bg-stone px-4 font-display text-[0.9375rem] font-bold text-terracotta"
            >
              <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
              Delete
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border-2 border-[#54293e] bg-plum px-5 font-display text-[0.9375rem] font-bold text-surface shadow-pixel-sm hover:bg-[#7d4260]"
            >
              <Pencil size={16} strokeWidth={2.2} aria-hidden="true" />
              Edit
            </button>
          </div>
        )
      }
    >
      <div className="flex items-center gap-3">
        <CompanyAvatar
          companyName={application.companyName}
          logoUrl={application.companyLogoUrl}
          size={44}
        />
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <StatusBadge status={application.status} />
          <SourceBadge source={application.source} />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-[6px] border-2 border-terracotta/45 bg-terracotta/10 px-3 py-2.5 text-[0.875rem] text-espresso"
        >
          {error}
        </p>
      )}

      <dl className="mt-4 divide-y divide-line/60 border-y-2 border-line/60">
        <Row icon={Building2} label="Company">
          {application.companyName}
        </Row>
        {place && (
          <Row icon={MapPin} label="Location">
            {place}
          </Row>
        )}
        {application.employmentType && (
          <Row icon={Briefcase} label="Contract type">
            {EMPLOYMENT_TYPE_LABELS[application.employmentType]}
          </Row>
        )}
        {application.jobUrl && (
          <Row icon={ExternalLink} label="Job posting">
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1.5 font-semibold break-all text-plum underline underline-offset-4"
            >
              {application.jobUrl}
            </a>
          </Row>
        )}
        {(application.contactName || application.contactEmail) && (
          <Row icon={User} label="Contact">
            {application.contactName}
            {application.contactName && application.contactEmail && " · "}
            {application.contactEmail && (
              <a
                href={`mailto:${application.contactEmail}`}
                className="font-semibold break-all text-plum underline underline-offset-4"
              >
                {application.contactEmail}
              </a>
            )}
          </Row>
        )}
      </dl>

      <section className="mt-5">
        <h3 className="font-display text-[0.75rem] font-bold tracking-[0.14em] text-espresso/55 uppercase">
          Timeline
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            { label: "Added", value: application.createdAt },
            { label: "Applied", value: application.appliedAt },
            { label: "Interview", value: application.interviewAt },
            { label: "Follow-up", value: application.followUpAt },
          ].map((entry) => (
            <div key={entry.label} className="min-w-0">
              <dt className="flex items-center gap-1.5 text-[0.75rem] text-espresso/50">
                <CalendarDays size={12} strokeWidth={2.2} aria-hidden="true" />
                {entry.label}
              </dt>
              <dd className="mt-0.5 text-[0.875rem] text-espresso/85">
                {formatDate(entry.value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-5">
        <h3 className="font-display text-[0.75rem] font-bold tracking-[0.14em] text-espresso/55 uppercase">
          Status history
        </h3>
        {eventsLoading ? (
          <p className="mt-2 flex items-center gap-2 text-[0.8125rem] text-espresso/55">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Loading history…
          </p>
        ) : events.length === 0 ? (
          <p className="mt-2 text-[0.8125rem] text-espresso/55">
            No status changes recorded yet.
          </p>
        ) : (
          <ol className="mt-2 flex flex-col gap-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-[6px] border-2 border-line bg-stone px-3 py-2 text-[0.8125rem]"
              >
                <span className="font-semibold text-espresso">
                  {event.fromStatus
                    ? `${STATUS_LABELS[event.fromStatus as ApplicationStatusValue]} → ${STATUS_LABELS[event.toStatus]}`
                    : `Created as ${STATUS_LABELS[event.toStatus]}`}
                </span>
                <span className="mt-0.5 block text-espresso/55">
                  {formatDate(event.createdAt)}
                  {event.actor !== "user" && ` · ${event.actor}`}
                  {event.note && ` · ${event.note}`}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {application.notes && (
        <section className="mt-5">
          <h3 className="font-display text-[0.75rem] font-bold tracking-[0.14em] text-espresso/55 uppercase">
            Notes
          </h3>
          <p className="mt-2 rounded-[6px] border-2 border-line bg-stone px-3 py-2.5 text-[0.875rem] leading-[1.55] whitespace-pre-wrap text-espresso/85">
            {application.notes}
          </p>
        </section>
      )}

    </Modal>
  );
}
