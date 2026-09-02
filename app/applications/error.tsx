"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { CONTAINER } from "@/components/landing/layout";

export default function ApplicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Message only — never the stack, which can carry query fragments.
    console.error("[applications] render failed:", error.message);
  }, [error]);

  return (
    <main className="flex-1 py-14">
      <div className={CONTAINER}>
        <div className="mx-auto max-w-[34rem] rounded-[10px] border-2 border-line bg-surface p-6 text-center shadow-pixel-sm">
          <span className="pixel-notch-sm mx-auto inline-flex size-12 items-center justify-center border-2 border-terracotta/45 bg-terracotta/10">
            <AlertTriangle size={22} strokeWidth={2} className="text-terracotta" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-[1.375rem] font-bold text-espresso">
            We could not load your applications
          </h1>
          <p className="mt-2 text-[0.9375rem] leading-[1.55] text-espresso/70">
            The dashboard failed to load. Your data is untouched — trying again
            usually fixes it.
          </p>
          {error.digest && (
            <p className="mt-2 text-[0.75rem] text-espresso/45">
              Reference: {error.digest}
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border-2 border-[#54293e] bg-plum px-5 font-display text-[0.9375rem] font-bold text-surface shadow-pixel-sm hover:bg-[#7d4260]"
            >
              <RotateCcw size={16} strokeWidth={2.3} aria-hidden="true" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-[6px] border-2 border-line bg-stone px-4 font-display text-[0.9375rem] font-bold text-espresso"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
