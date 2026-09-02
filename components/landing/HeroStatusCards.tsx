"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookmarkCheck, CalendarDays } from "lucide-react";
import PixelSparkle from "./PixelSparkle";
import { EASE_OUT } from "./motion";

const CARD_BASE =
  "pointer-events-auto relative rounded-[10px] border-2 border-line bg-surface shadow-pixel-md";

/**
 * Two small status cards borrowed from the product surface. They sit beside the
 * illustration on tablet and up, and drop below it on phones so the artwork is
 * never covered.
 */
export default function HeroStatusCards() {
  const prefersReducedMotion = useReducedMotion();

  const float = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          animate: { y: [0, -4, 0] },
          transition: {
            duration: 6,
            ease: "easeInOut" as const,
            repeat: Infinity,
            delay,
          },
        };

  const entrance = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.45, delay, ease: EASE_OUT },
        };

  return (
    <div className="mt-4 grid gap-3 sm:pointer-events-none sm:absolute sm:inset-0 sm:mt-0 sm:block">
      {/* Saved-role card */}
      <motion.div
        {...entrance(0.45)}
        className="sm:absolute sm:top-4 sm:-right-2 sm:w-[202px] xl:top-6 xl:-right-3 xl:w-[248px]"
      >
        <motion.div {...float(0)} className={CARD_BASE}>
          <div className="flex items-center gap-2.5 p-3">
            <span className="pixel-notch-sm inline-flex size-11 shrink-0 items-center justify-center border-2 border-plum/40 bg-plum/10">
              <BookmarkCheck
                size={20}
                strokeWidth={2}
                className="text-plum"
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[0.9375rem] leading-tight font-bold text-espresso">
                Product Engineer
              </p>
              <p className="mt-1 truncate text-[0.8125rem] text-espresso/60">
                Saved &middot; Qonto
              </p>
            </div>
          </div>
          <PixelSparkle
            size={9}
            twinkle
            delay={0.8}
            className="absolute right-2 bottom-2"
          />
        </motion.div>
      </motion.div>

      {/* Interview card */}
      <motion.div
        {...entrance(0.6)}
        className="sm:absolute sm:bottom-4 sm:-right-7 sm:w-[192px] xl:bottom-auto xl:top-[10.5rem] xl:-right-8 xl:w-[228px]"
      >
        <motion.div {...float(1.4)} className={CARD_BASE}>
          <div className="flex items-center gap-2.5 p-3">
            <span className="relative">
              <span className="pixel-notch-sm inline-flex size-11 items-center justify-center border-2 border-terracotta/45 bg-terracotta/10">
                <CalendarDays
                  size={20}
                  strokeWidth={1.9}
                  className="text-terracotta"
                  aria-hidden="true"
                />
              </span>
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 size-2 bg-mustard animate-pixel-pulse"
              />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[0.9375rem] leading-tight font-bold text-espresso">
                Interview tomorrow
              </p>
              <p className="mt-1 text-[0.8125rem] text-espresso/60">10:00 AM</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
