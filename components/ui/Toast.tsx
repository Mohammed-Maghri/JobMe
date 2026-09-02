"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { EASE_OUT } from "@/components/landing/motion";

export type ToastMessage = { id: number; text: string; tone: "success" | "error" };

/**
 * Feedback for actions that finish away from the user's attention (a card moved
 * between columns, a delete). Announced politely so it does not interrupt.
 */
export default function Toast({
  message,
  onDismiss,
}: {
  message: ToastMessage | null;
  onDismiss: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isError = message?.tone === "error";

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[110] flex justify-center px-4"
    >
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className={`pointer-events-auto flex max-w-[min(32rem,100%)] items-start gap-2.5 rounded-[8px] border-2 px-4 py-3 shadow-pixel-md ${
              isError
                ? "border-terracotta/55 bg-terracotta/12"
                : "border-sage/55 bg-surface"
            }`}
          >
            {isError ? (
              <AlertCircle size={17} strokeWidth={2.2} className="mt-[1px] shrink-0 text-terracotta" aria-hidden="true" />
            ) : (
              <CheckCircle2 size={17} strokeWidth={2.2} className="mt-[1px] shrink-0 text-sage" aria-hidden="true" />
            )}
            <p className="min-w-0 flex-1 text-[0.875rem] leading-[1.45] text-espresso">
              {message.text}
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="-my-1 shrink-0 rounded-[4px] px-1.5 py-1 font-display text-[0.8125rem] font-bold text-plum"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
