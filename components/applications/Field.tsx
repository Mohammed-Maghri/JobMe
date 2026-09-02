"use client";

import type { ReactNode } from "react";

/**
 * One labelled control with its error wired up through `aria-describedby` and
 * `aria-invalid`, so the reason is announced with the field rather than being
 * left to a red border.
 */
export default function Field({
  id,
  label,
  error,
  hint,
  required,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
    className: string;
  }) => ReactNode;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block font-display text-[0.8125rem] font-bold tracking-[0.03em] text-espresso/75"
      >
        {label}
        {required && (
          <span className="ml-1 text-terracotta" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy.length > 0 ? describedBy : undefined,
        className: `mt-1.5 min-h-11 w-full rounded-[6px] border-2 bg-stone px-3 text-[0.9375rem] text-espresso outline-none transition-colors placeholder:text-espresso/35 focus-visible:border-plum disabled:opacity-60 ${
          error ? "border-terracotta" : "border-line"
        }`,
      })}

      {hint && !error && (
        <p id={hintId} className="mt-1 text-[0.75rem] text-espresso/55">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-[0.8125rem] font-medium text-terracotta"
        >
          {error}
        </p>
      )}
    </div>
  );
}
