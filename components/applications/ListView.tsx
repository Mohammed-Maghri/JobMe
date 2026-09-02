"use client";

import { ExternalLink, MapPin } from "lucide-react";
import {
  BOARD_STATUSES,
  CLOSED_STATUSES,
  EMPLOYMENT_TYPE_SHORT,
  STATUS_COLORS,
  STATUS_LABELS,
  WORK_MODE_LABELS,
  type ApplicationStatusValue,
} from "@/lib/applications/constants";
import type { ApplicationRecord } from "@/lib/applications/queries";
import CompanyAvatar from "./CompanyAvatar";
import { EmploymentBadge, ReminderBadge, SourceBadge, StatusBadge } from "./Badges";
import { formatDate } from "./format";

type Props = {
  applications: ApplicationRecord[];
  pendingIds: ReadonlySet<string>;
  onOpen: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatusValue) => void;
};

const ALL_STATUSES = [...BOARD_STATUSES, ...CLOSED_STATUSES];

/**
 * A real table from `md` up; the same rows as stacked cards below it. Both are
 * rendered from one list — the table is simply hidden on narrow screens, so
 * there is no second source of truth to drift.
 */
export default function ListView({
  applications,
  pendingIds,
  onOpen,
  onStatusChange,
}: Props) {
  return (
    <>
      {/*
        Desktop table. It starts at `lg`, not `md`: seven columns need ~940px,
        and at 768px the wrapper clipped the last three with no way to reach
        them. Tablets get the same stacked cards as phones.
      */}
      <div className="hidden overflow-hidden rounded-[10px] border-2 border-line bg-surface shadow-pixel-xs lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Your applications, with status, dates, location, source and
            follow-up.
          </caption>
          <thead>
            <tr className="border-b-2 border-line bg-stone/60">
              {["Company and role", "Status", "Contract", "Applied", "Location", "Follow-up", "Actions"].map(
                (heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-2.5 py-2.5 font-display text-[0.75rem] font-bold tracking-[0.08em] text-espresso/60 uppercase"
                  >
                    {heading === "Actions" ? <span className="sr-only">Actions</span> : heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr
                key={application.id}
                className={`border-b border-l-[6px] border-line/60 last:border-b-0 ${
                  STATUS_COLORS[application.status].accent
                } ${pendingIds.has(application.id) ? "opacity-55" : ""}`}
              >
                <td className="max-w-[18rem] px-2.5 py-3">
                  <div className="flex items-center gap-2.5">
                    <CompanyAvatar
                      companyName={application.companyName}
                      logoUrl={application.companyLogoUrl}
                      size={32}
                    />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onOpen(application.id)}
                        className="flex min-h-11 max-w-full items-center text-left font-display text-[0.9375rem] font-bold text-espresso hover:text-plum"
                      >
                        <span className="truncate">{application.jobTitle}</span>
                      </button>
                      <span className="block max-w-full truncate text-[0.8125rem] text-espresso/60">
                        {application.companyName}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-2.5 py-3">
                  <label>
                    <span className="sr-only">
                      Status for {application.jobTitle} at {application.companyName}
                    </span>
                    <select
                      value={application.status}
                      disabled={pendingIds.has(application.id)}
                      onChange={(event) =>
                        onStatusChange(
                          application.id,
                          event.target.value as ApplicationStatusValue,
                        )
                      }
                      className={`min-h-11 rounded-[4px] border-2 px-2 text-[0.8125rem] font-semibold outline-none focus-visible:border-plum disabled:opacity-60 ${STATUS_COLORS[application.status].border} ${STATUS_COLORS[application.status].tint} ${STATUS_COLORS[application.status].text}`}
                    >
                      {ALL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                </td>
                <td className="px-2.5 py-3 text-[0.8125rem] whitespace-nowrap text-espresso/75">
                  {application.employmentType
                    ? EMPLOYMENT_TYPE_SHORT[application.employmentType]
                    : "—"}
                </td>
                <td className="px-2.5 py-3 text-[0.8125rem] whitespace-nowrap text-espresso/70">
                  {formatDate(application.appliedAt)}
                </td>
                <td className="max-w-[9rem] px-2.5 py-3 text-[0.8125rem] text-espresso/70">
                  <span className="block truncate">
                    {[
                      application.location,
                      application.workMode ? WORK_MODE_LABELS[application.workMode] : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                </td>

                <td className="px-2.5 py-3 text-[0.8125rem]">
                  <ReminderBadge
                    followUpAt={application.followUpAt}
                    interviewAt={application.interviewAt}
                  />
                </td>
                <td className="px-2.5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(application.id)}
                    className="inline-flex min-h-11 items-center rounded-[4px] px-2 font-display text-[0.8125rem] font-bold text-plum hover:underline"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone and tablet cards */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {applications.map((application) => (
          <li
            key={application.id}
            className={`rounded-[10px] border-2 border-l-[6px] border-line bg-surface p-3.5 shadow-pixel-xs ${
              STATUS_COLORS[application.status].accent
            } ${pendingIds.has(application.id) ? "opacity-55" : ""}`}
          >
            <div className="flex items-start gap-2.5">
              <CompanyAvatar
                companyName={application.companyName}
                logoUrl={application.companyLogoUrl}
                size={36}
              />
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onOpen(application.id)}
                  className="flex min-h-11 w-full flex-col justify-center text-left"
                >
                  <span className="block truncate font-display text-[0.9375rem] font-bold text-espresso">
                    {application.jobTitle}
                  </span>
                  <span className="block truncate text-[0.8125rem] text-espresso/60">
                    {application.companyName}
                  </span>
                </button>
              </div>
              <StatusBadge status={application.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[0.75rem]">
              <div className="min-w-0">
                <dt className="text-espresso/50">Applied</dt>
                <dd className="truncate text-espresso/80">
                  {formatDate(application.appliedAt)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-espresso/50">Location</dt>
                <dd className="flex min-w-0 items-center gap-1 truncate text-espresso/80">
                  {application.location && (
                    <MapPin size={11} strokeWidth={2.2} aria-hidden="true" className="shrink-0" />
                  )}
                  <span className="truncate">
                    {[
                      application.location,
                      application.workMode ? WORK_MODE_LABELS[application.workMode] : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
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

            <div className="mt-3 flex items-center gap-2 border-t-2 border-line/60 pt-3">
              <label className="min-w-0 flex-1">
                <span className="sr-only">
                  Status for {application.jobTitle} at {application.companyName}
                </span>
                <select
                  value={application.status}
                  disabled={pendingIds.has(application.id)}
                  onChange={(event) =>
                    onStatusChange(
                      application.id,
                      event.target.value as ApplicationStatusValue,
                    )
                  }
                  className="min-h-11 w-full rounded-[4px] border-2 border-line bg-stone px-2 text-[0.8125rem] font-semibold text-espresso outline-none focus-visible:border-plum disabled:opacity-60"
                >
                  {ALL_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => onOpen(application.id)}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[6px] border-2 border-line bg-stone px-3 font-display text-[0.8125rem] font-bold text-plum"
              >
                Details
                <ExternalLink size={13} strokeWidth={2.3} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
