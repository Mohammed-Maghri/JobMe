"use client";

import { MapPin } from "lucide-react";
import type { DragEvent } from "react";
import {
  BOARD_STATUSES,
  CLOSED_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  WORK_MODE_LABELS,
  type ApplicationStatusValue,
} from "@/lib/applications/constants";
import type { ApplicationRecord } from "@/lib/applications/queries";
import CompanyAvatar from "./CompanyAvatar";
import { EmploymentBadge, ReminderBadge, SourceBadge } from "./Badges";
import { relativePast } from "./format";

type Props = {
  application: ApplicationRecord;
  onOpen: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatusValue) => void;
  onDragStart?: (event: DragEvent<HTMLDivElement>, id: string) => void;
  pending?: boolean;
};

const ALL_STATUSES = [...BOARD_STATUSES, ...CLOSED_STATUSES];

export default function ApplicationCard({
  application,
  onOpen,
  onStatusChange,
  onDragStart,
  pending = false,
}: Props) {
  const dateLabel =
    application.status === "SAVED"
      ? `Saved ${relativePast(application.createdAt)}`
      : application.appliedAt
        ? `Applied ${relativePast(application.appliedAt)}`
        : `Added ${relativePast(application.createdAt)}`;

  const place = [
    application.location,
    application.workMode ? WORK_MODE_LABELS[application.workMode] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      draggable={Boolean(onDragStart)}
      onDragStart={(event) => onDragStart?.(event, application.id)}
      /* The left edge carries the stage colour, so a column reads at a glance
         even before the labels are read. */
      className={`group rounded-[10px] border-2 border-l-[6px] border-line bg-surface p-3 shadow-pixel-xs transition-[transform,box-shadow,opacity] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-pixel ${
        STATUS_COLORS[application.status].accent
      } ${pending ? "opacity-55" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        <CompanyAvatar
          companyName={application.companyName}
          logoUrl={application.companyLogoUrl}
          size={36}
        />
        <div className="min-w-0 flex-1">
          {/* The whole title is the affordance for opening details. */}
          <button
            type="button"
            onClick={() => onOpen(application.id)}
            aria-label={`Open ${application.jobTitle} at ${application.companyName}`}
            className="flex min-h-11 w-full flex-col justify-center gap-0.5 text-left"
          >
            {/* Wraps to two lines before ellipsising — at flexed column widths
                a single truncated line cut most real job titles in half. */}
            <span className="line-clamp-2 font-display text-[0.9375rem] leading-tight font-bold break-words text-espresso">
              {application.jobTitle}
            </span>
            <span className="mt-0.5 block truncate text-[0.8125rem] text-espresso/60">
              {application.companyName}
            </span>
          </button>
        </div>

      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.75rem] text-espresso/60">
        {place && (
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin size={11} strokeWidth={2.2} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{place}</span>
          </span>
        )}
        <span className="shrink-0">{dateLabel}</span>
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {application.employmentType && (
          <EmploymentBadge type={application.employmentType} />
        )}
        <SourceBadge source={application.source} />
      </div>

      <div className="mt-2 empty:mt-0">
        <ReminderBadge
          followUpAt={application.followUpAt}
          interviewAt={application.interviewAt}
        />
      </div>

      {/*
        Drag-and-drop is a mouse convenience. This select is the real control:
        it works with a keyboard, with a screen reader and on touch, and it is
        what the board is tested against.
      */}
      <label className="mt-2.5 flex items-center gap-2 border-t-2 border-line/60 pt-2.5">
        <span className="sr-only">
          Status for {application.jobTitle} at {application.companyName}
        </span>
        <select
          value={application.status}
          disabled={pending}
          onChange={(event) =>
            onStatusChange(
              application.id,
              event.target.value as ApplicationStatusValue,
            )
          }
          className={`min-h-11 w-full rounded-[4px] border-2 px-2 text-[0.8125rem] font-semibold outline-none transition-colors focus-visible:border-plum disabled:opacity-60 ${STATUS_COLORS[application.status].border} ${STATUS_COLORS[application.status].tint} ${STATUS_COLORS[application.status].text}`}
        >
          {ALL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
