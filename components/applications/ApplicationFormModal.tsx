"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Field from "./Field";
import {
  BOARD_STATUSES,
  CLOSED_STATUSES,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
  WORK_MODES,
  WORK_MODE_LABELS,
  type ApplicationStatusValue,
} from "@/lib/applications/constants";
import {
  applicationInputSchema,
  collectFieldErrors,
  type FieldErrors,
} from "@/lib/applications/schemas";
import type { ApplicationRecord } from "@/lib/applications/queries";
import { toDateInput } from "./format";

const ALL_STATUSES = [...BOARD_STATUSES, ...CLOSED_STATUSES];

export type ApplicationFormValues = {
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  location: string;
  workMode: string;
  employmentType: string;
  status: ApplicationStatusValue;
  appliedAt: string;
  interviewAt: string;
  followUpAt: string;
  contactName: string;
  contactEmail: string;
  notes: string;
};

function initialValues(
  application: ApplicationRecord | null,
  defaultStatus: ApplicationStatusValue,
): ApplicationFormValues {
  return {
    companyName: application?.companyName ?? "",
    jobTitle: application?.jobTitle ?? "",
    jobUrl: application?.jobUrl ?? "",
    location: application?.location ?? "",
    workMode: application?.workMode ?? "",
    employmentType: application?.employmentType ?? "",
    status: application?.status ?? defaultStatus,
    appliedAt: toDateInput(application?.appliedAt ?? null),
    interviewAt: toDateInput(application?.interviewAt ?? null),
    followUpAt: toDateInput(application?.followUpAt ?? null),
    contactName: application?.contactName ?? "",
    contactEmail: application?.contactEmail ?? "",
    notes: application?.notes ?? "",
  };
}

type Props = {
  /** Present when editing; `null` when creating. */
  application: ApplicationRecord | null;
  defaultStatus?: ApplicationStatusValue;
  onClose: () => void;
  onSubmit: (
    values: ApplicationFormValues,
  ) => Promise<{ ok: true } | { ok: false; fieldErrors?: FieldErrors; message?: string }>;
};

/**
 * Add / edit form. The same Zod schema that guards the server action runs here
 * first, so the user gets inline errors without a round trip — but the server
 * copy is still the one that decides.
 */
export default function ApplicationFormModal({
  application,
  defaultStatus = "SAVED",
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ApplicationFormValues>(() =>
    initialValues(application, defaultStatus),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ApplicationFormValues>(
    key: K,
    value: ApplicationFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setFieldErrors({});
    setFormError(null);

    const parsed = applicationInputSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error));
      return;
    }

    setSaving(true);
    try {
      const result = await onSubmit(values);
      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setFormError(result.message ?? "Could not save this application.");
        setSaving(false);
        return;
      }
      // Success unmounts the modal; leave the button disabled until it goes.
    } catch {
      setFormError("Could not reach the server. Check your connection.");
      setSaving(false);
    }
  }

  const selectClass =
    "mt-1.5 min-h-11 w-full rounded-[6px] border-2 border-line bg-stone px-3 text-[0.9375rem] text-espresso outline-none focus-visible:border-plum disabled:opacity-60";

  return (
    <Modal
      title={application ? "Edit application" : "Add application"}
      description={
        application
          ? "Update the details you are tracking for this role."
          : "Track a role you have saved or already applied to."
      }
      onClose={onClose}
      busy={saving}
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center rounded-[6px] border-2 border-line bg-stone px-4 font-display text-[0.9375rem] font-bold text-espresso disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="application-form"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border-2 border-[#54293e] bg-plum px-5 font-display text-[0.9375rem] font-bold text-surface shadow-pixel-sm transition-colors hover:bg-[#7d4260] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {saving
              ? "Saving…"
              : application
                ? "Save changes"
                : "Add application"}
          </button>
        </div>
      }
    >
      <form id="application-form" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="companyName" label="Company name" required error={fieldErrors.companyName}>
            {(props) => (
              <input
                {...props}
                type="text"
                value={values.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder="Qonto"
                autoComplete="organization"
              />
            )}
          </Field>

          <Field id="jobTitle" label="Job title" required error={fieldErrors.jobTitle}>
            {(props) => (
              <input
                {...props}
                type="text"
                value={values.jobTitle}
                onChange={(e) => set("jobTitle", e.target.value)}
                placeholder="Product Engineer"
              />
            )}
          </Field>

          <Field
            id="jobUrl"
            label="Job URL"
            error={fieldErrors.jobUrl}
            className="sm:col-span-2"
          >
            {(props) => (
              <input
                {...props}
                type="url"
                inputMode="url"
                value={values.jobUrl}
                onChange={(e) => set("jobUrl", e.target.value)}
                placeholder="https://…"
              />
            )}
          </Field>

          <Field id="location" label="Location" error={fieldErrors.location}>
            {(props) => (
              <input
                {...props}
                type="text"
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Paris, France"
              />
            )}
          </Field>

          <div>
            <label
              htmlFor="workMode"
              className="block font-display text-[0.8125rem] font-bold tracking-[0.03em] text-espresso/75"
            >
              Work mode
            </label>
            <select
              id="workMode"
              value={values.workMode}
              onChange={(e) => set("workMode", e.target.value)}
              className={selectClass}
            >
              <option value="">Not specified</option>
              {WORK_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {WORK_MODE_LABELS[mode]}
                </option>
              ))}
            </select>
          </div>

          {/* A closed list, not free text — the board filters on this value. */}
          <div>
            <label
              htmlFor="employmentType"
              className="block font-display text-[0.8125rem] font-bold tracking-[0.03em] text-espresso/75"
            >
              Contract type
            </label>
            <select
              id="employmentType"
              value={values.employmentType}
              onChange={(e) => set("employmentType", e.target.value)}
              className={selectClass}
            >
              <option value="">Not specified</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {EMPLOYMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block font-display text-[0.8125rem] font-bold tracking-[0.03em] text-espresso/75"
            >
              Status
            </label>
            <select
              id="status"
              value={values.status}
              onChange={(e) => set("status", e.target.value as ApplicationStatusValue)}
              className={selectClass}
            >
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <Field
            id="appliedAt"
            label="Date applied"
            error={fieldErrors.appliedAt}
            hint="Left empty, this is set automatically when you leave Saved."
          >
            {(props) => (
              <input
                {...props}
                type="date"
                value={values.appliedAt}
                onChange={(e) => set("appliedAt", e.target.value)}
              />
            )}
          </Field>

          <Field id="followUpAt" label="Follow-up date" error={fieldErrors.followUpAt}>
            {(props) => (
              <input
                {...props}
                type="date"
                value={values.followUpAt}
                onChange={(e) => set("followUpAt", e.target.value)}
              />
            )}
          </Field>

          <Field id="interviewAt" label="Interview date" error={fieldErrors.interviewAt}>
            {(props) => (
              <input
                {...props}
                type="date"
                value={values.interviewAt}
                onChange={(e) => set("interviewAt", e.target.value)}
              />
            )}
          </Field>

          <Field id="contactName" label="Contact name" error={fieldErrors.contactName}>
            {(props) => (
              <input
                {...props}
                type="text"
                value={values.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder="Recruiter or hiring manager"
              />
            )}
          </Field>

          <Field id="contactEmail" label="Contact email" error={fieldErrors.contactEmail}>
            {(props) => (
              <input
                {...props}
                type="email"
                value={values.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                placeholder="name@company.com"
              />
            )}
          </Field>

          <Field id="notes" label="Notes" error={fieldErrors.notes} className="sm:col-span-2">
            {(props) => (
              <textarea
                {...props}
                rows={4}
                value={values.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Anything worth remembering before the next conversation."
                className={`${props.className} min-h-[6rem] resize-y py-2 leading-[1.5]`}
              />
            )}
          </Field>
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-[6px] border-2 border-terracotta/45 bg-terracotta/10 px-3 py-2.5 text-[0.875rem] leading-[1.45] text-espresso"
          >
            <AlertCircle
              size={16}
              strokeWidth={2.2}
              className="mt-[1px] shrink-0 text-terracotta"
              aria-hidden="true"
            />
            {formError}
          </p>
        )}
      </form>
    </Modal>
  );
}
