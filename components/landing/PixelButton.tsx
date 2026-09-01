"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const MotionLink = motion.create(Link);

export type PixelButtonVariant = "primary" | "plum" | "outline" | "cream";
export type PixelButtonSize = "md" | "lg";

const VARIANTS: Record<PixelButtonVariant, string> = {
  primary:
    "bg-terracotta text-surface border-[#a44f31] hover:bg-[#bf5c3b] shadow-pixel-md",
  plum: "bg-plum text-surface border-[#54293e] hover:bg-[#7d4260] shadow-pixel-sm",
  outline:
    "bg-surface text-espresso border-plum/45 hover:border-plum hover:bg-[#fdf2e0] shadow-pixel-sm",
  cream: "bg-surface text-plum border-[#e7d4bd] hover:bg-white shadow-pixel-md",
};

const SIZES: Record<PixelButtonSize, string> = {
  md: "min-h-11 px-4 text-[0.9375rem]",
  lg: "min-h-12 px-6 text-base sm:min-h-[3.25rem] sm:px-7 sm:text-[1.0625rem]",
};

type PixelButtonProps = {
  /** Renders an anchor / `next/link`. Omit it to render a real `<button>`. */
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  children: ReactNode;
  variant?: PixelButtonVariant;
  size?: PixelButtonSize;
  className?: string;
  /** Applied to the underlying control for screen-reader clarity. */
  ariaLabel?: string;
};

/**
 * The single CTA primitive. Hover lifts the whole button 2px off its hard
 * offset shadow and the press state settles it back down — driven by Framer
 * Motion so it stays in step with the rest of the page and honours
 * reduced-motion.
 */
export default function PixelButton({
  href,
  onClick,
  type = "button",
  disabled = false,
  children,
  variant = "primary",
  size = "md",
  className = "",
  ariaLabel,
}: PixelButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const classes = [
    "inline-flex select-none items-center justify-center gap-2 rounded-[6px] border-2 font-display font-bold whitespace-nowrap",
    "transition-[background-color,border-color] duration-150",
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(" ");

  const motionProps =
    prefersReducedMotion || disabled
      ? {}
      : {
          whileHover: { x: -2, y: -2 },
          whileTap: { x: 1, y: 1 },
          transition: { type: "spring" as const, stiffness: 520, damping: 32 },
        };

  if (href === undefined) {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`${classes} disabled:cursor-not-allowed disabled:opacity-60`}
        {...motionProps}
      >
        {children}
      </motion.button>
    );
  }

  if (href.startsWith("/")) {
    return (
      <MotionLink
        href={href}
        aria-label={ariaLabel}
        className={classes}
        {...motionProps}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.a
      href={href}
      aria-label={ariaLabel}
      className={classes}
      {...motionProps}
    >
      {children}
    </motion.a>
  );
}
