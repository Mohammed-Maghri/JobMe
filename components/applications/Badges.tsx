import { Bell, Briefcase, CalendarDays, Rocket, SquarePen } from "lucide-react";
import {
  EMPLOYMENT_TYPE_SHORT,
  SOURCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type ApplicationSourceValue,
  type ApplicationStatusValue,
  type EmploymentTypeValue,
} from "@/lib/applications/constants";
import { relativeFuture } from "./format";

/**
 * The status, in its own colour and with a solid dot.
 *
 * The label is always present — colour is an accelerator for scanning, never
 * the only way to tell two stages apart.
 */
export function StatusBadge({
  status,
  size = "md",
}: {
  status: ApplicationStatusValue;
  size?: "sm" | "md";
}) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className={`pixel-notch-sm inline-flex items-center gap-1.5 border-2 font-display font-bold whitespace-nowrap ${color.border} ${color.tint} ${color.text} ${
        size === "sm" ? "px-1.5 py-0.5 text-[0.6875rem]" : "px-2 py-0.5 text-[0.75rem]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full ${color.fill}`}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Contract type. Compact because it sits next to the source on a card. */
export function EmploymentBadge({ type }: { type: EmploymentTypeValue }) {
  return (
    <span className="pixel-notch-sm inline-flex items-center gap-1.5 border border-line bg-stone px-2 py-1 text-[0.6875rem] font-semibold whitespace-nowrap text-espresso/75">
      <Briefcase size={12} strokeWidth={2.2} aria-hidden="true" />
      {EMPLOYMENT_TYPE_SHORT[type]}
    </span>
  );
}

const SOURCE_ICONS = {
  MANUAL: SquarePen,
  APPLYPILOT: Rocket,
} as const;

/** Source is shown with an icon *and* its name, never colour alone. */
export function SourceBadge({ source }: { source: ApplicationSourceValue }) {
  const Icon = SOURCE_ICONS[source];
  const tone = source === "APPLYPILOT" ? "text-sage" : "text-espresso/60";
  return (
    <span className="pixel-notch-sm inline-flex items-center gap-1.5 border border-line bg-stone px-2 py-1 text-[0.6875rem] font-semibold text-espresso/75">
      <Icon size={12} strokeWidth={2.2} className={tone} aria-hidden="true" />
      {SOURCE_LABELS[source]}
    </span>
  );
}

/**
 * Follow-up and interview reminders. Overdue items get a word ("overdue"), not
 * just a red tint, so the state survives without colour.
 */
export function ReminderBadge({
  followUpAt,
  interviewAt,
}: {
  followUpAt: string | null;
  interviewAt: string | null;
}) {
  const interview = relativeFuture(interviewAt);
  if (interview) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-espresso/70">
        <CalendarDays size={12} strokeWidth={2.2} aria-hidden="true" />
        Interview {interview.label}
      </span>
    );
  }

  const followUp = relativeFuture(followUpAt);
  if (!followUp) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold ${
        followUp.overdue ? "text-terracotta" : "text-espresso/70"
      }`}
    >
      <Bell size={12} strokeWidth={2.2} aria-hidden="true" />
      {followUp.overdue ? "Follow-up " : "Follow up "}
      {followUp.label}
    </span>
  );
}
