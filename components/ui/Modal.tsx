"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { EASE_OUT } from "@/components/landing/motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  /** Blocks Escape and backdrop dismissal while a request is in flight. */
  busy?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  /** `drawer` slides in from the right on desktop and up from the bottom on mobile. */
  variant?: "dialog" | "drawer";
  labelledBy?: string;
};

/**
 * Shared modal shell: portal, focus trap, Escape, backdrop dismissal and scroll
 * lock, with the scrollbar width added back as padding so the page behind does
 * not shift sideways.
 *
 * Mount it conditionally — it assumes a fresh mount per open, which is what
 * keeps its callers free of reset effects.
 */
export default function Modal({
  title,
  description,
  onClose,
  busy = false,
  children,
  footer,
  variant = "dialog",
  labelledBy,
}: ModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const generatedId = useId();
  const titleId = labelledBy ?? generatedId;
  const descriptionId = `${generatedId}-description`;

  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, []);

  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => {
      const dialog = dialogRef.current;
      const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? dialog)?.focus();
    }, 40);
    return () => {
      window.clearTimeout(id);
      restoreFocusTo.current?.focus?.();
      restoreFocusTo.current = null;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (busy) return;
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [busy, onClose]);

  const isDrawer = variant === "drawer";

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex overflow-y-auto overscroll-contain ${
        isDrawer
          ? "items-end justify-center sm:items-stretch sm:justify-end"
          : "items-start justify-center p-4 sm:items-center sm:p-6"
      }`}
      role="presentation"
    >
      <motion.div
        aria-hidden="true"
        onClick={() => {
          if (!busy) onClose();
        }}
        className="fixed inset-0 bg-espresso/55"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
        transition={{ duration: 0.18 }}
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={
          isDrawer
            ? "relative flex max-h-[92dvh] w-full flex-col rounded-t-[14px] border-2 border-line bg-surface shadow-pixel-lg outline-none sm:max-h-none sm:min-h-full sm:w-[30rem] sm:rounded-none sm:rounded-l-[14px] sm:border-r-0"
            : // `max-h` + a scrolling body keeps tall forms inside short
              // viewports; without it a laptop at 640px tall could not reach
              // the footer buttons.
              "relative my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[38rem] flex-col rounded-[12px] border-2 border-line bg-surface shadow-pixel-lg outline-none sm:max-h-[calc(100dvh-3rem)]"
        }
        initial={
          prefersReducedMotion
            ? false
            : isDrawer
              ? { opacity: 0, y: 24 }
              : { opacity: 0, y: 14, scale: 0.985 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          prefersReducedMotion
            ? undefined
            : isDrawer
              ? { opacity: 0, y: 24 }
              : { opacity: 0, y: 8, scale: 0.99 }
        }
        transition={{ duration: 0.22, ease: EASE_OUT }}
      >
        <header className="flex items-start gap-3 border-b-2 border-line px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="font-display text-[1.25rem] leading-tight font-bold tracking-[-0.025em] text-espresso"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="mt-1 text-[0.875rem] leading-[1.5] text-espresso/65"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={`Close ${title.toLowerCase()}`}
            className="pixel-notch-sm inline-flex size-11 shrink-0 items-center justify-center border-2 border-line bg-stone text-espresso transition-colors hover:border-plum/50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <X size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer && (
          <footer className="border-t-2 border-line px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}
