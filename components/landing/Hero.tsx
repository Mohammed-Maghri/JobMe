"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import PixelButton from "./PixelButton";
import PixelSparkle from "./PixelSparkle";
import BenefitItem from "./BenefitItem";
import HeroStatusCards from "./HeroStatusCards";
import { BENEFITS } from "./content";
import { EASE_OUT } from "./motion";
import { CONTAINER } from "./layout";

/** Shared by the frame and its offset shadow layer so they stay congruent. */
const FRAME_RATIO = "aspect-[3/2] lg:aspect-[8/5]";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const rise = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.5,
            delay,
            ease: EASE_OUT,
          },
        };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pt-10 pb-12 sm:pt-14 lg:pt-16 lg:pb-16"
    >
      <div className={`${CONTAINER} grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] xl:gap-16`}>
        {/* ---------------------------------------------------------- */}
        {/* Copy                                                        */}
        {/* ---------------------------------------------------------- */}
        <div className="max-w-[36rem]">
          <motion.p
            {...rise(0)}
            className="flex items-center gap-2.5 font-display text-[0.8125rem] font-bold tracking-[0.16em] text-plum uppercase sm:text-sm"
          >
            <PixelSparkle size={14} color="var(--color-terracotta)" twinkle />
            Your application tracker
          </motion.p>

          <motion.h1
            {...rise(0.06)}
            id="hero-heading"
            className="mt-4 text-display text-balance text-espresso"
          >
            Find work that fits you.
          </motion.h1>

          <motion.p
            {...rise(0.12)}
            className="mt-5 max-w-[30rem] text-lead text-espresso/75"
          >
            Keep every application, interview and follow-up in one calm
            workspace, from saved through to offer.
          </motion.p>

          <motion.div
            {...rise(0.18)}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <PixelButton href="#applications" size="lg" className="w-full sm:w-auto">
              See how tracking works
            </PixelButton>
            <PixelButton
              href="#how-it-works"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Play
                size={15}
                fill="currentColor"
                strokeWidth={0}
                aria-hidden="true"
              />
              See how it works
            </PixelButton>
          </motion.div>

          <motion.ul
            {...rise(0.26)}
            className="mt-8 flex flex-col gap-4 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-x-7 sm:gap-y-4"
          >
            {BENEFITS.map((benefit) => (
              <BenefitItem key={benefit.id} benefit={benefit} />
            ))}
          </motion.ul>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Illustration                                                */}
        {/* ---------------------------------------------------------- */}
        <motion.div
          {...(prefersReducedMotion
            ? {}
            : {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: {
                  duration: 0.6,
                  delay: 0.1,
                  ease: EASE_OUT,
                },
              })}
          className="relative"
        >
          {/* The notched clip-path would swallow a box-shadow, so the hard
              offset is painted by its own identically-shaped layer. */}
          <div
            aria-hidden="true"
            className={`pixel-notch absolute top-[7px] left-[7px] w-full bg-espresso/20 ${FRAME_RATIO}`}
          />
          <div
            className={`pixel-notch relative w-full overflow-hidden border-[6px] border-[#e3d2ba] bg-stone ${FRAME_RATIO}`}
          >
            <Image
              src="/images/hero-job-search.png"
              alt="Pixel-art illustration of a woman working at her laptop in a Paris apartment, searching for jobs beside an open notebook and a cup of coffee, with the Eiffel Tower framed in the window behind her."
              fill
              priority
              sizes="(min-width: 1280px) 680px, (min-width: 1024px) 52vw, 100vw"
              className="object-cover object-[52%_46%]"
            />
          </div>
          <HeroStatusCards />
        </motion.div>
      </div>
    </section>
  );
}
