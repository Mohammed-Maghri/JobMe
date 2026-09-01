"use client";

import { motion, useReducedMotion } from "framer-motion";

type PixelSparkleProps = {
  /** Rendered size in pixels. Keep these small — they are punctuation, not decoration. */
  size?: number;
  className?: string;
  /** Any CSS colour; defaults to the mustard accent. */
  color?: string;
  /** Opt in to a slow twinkle. Used on two or three sparkles per page at most. */
  twinkle?: boolean;
  delay?: number;
};

/**
 * A four-point sparkle drawn on an integer grid with `crispEdges`, so it keeps
 * hard pixel corners at any size instead of blurring into a soft star.
 */
export default function PixelSparkle({
  size = 12,
  className,
  color = "var(--color-mustard)",
  twinkle = false,
  delay = 0,
}: PixelSparkleProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldTwinkle = twinkle && !prefersReducedMotion;

  const glyph = (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      fill={color}
      aria-hidden="true"
      focusable="false"
      className={shouldTwinkle ? undefined : className}
    >
      <rect x="5" y="0" width="2" height="12" />
      <rect x="0" y="5" width="12" height="2" />
      <rect x="4" y="4" width="4" height="4" />
      <rect x="3" y="3" width="1" height="1" />
      <rect x="8" y="3" width="1" height="1" />
      <rect x="3" y="8" width="1" height="1" />
      <rect x="8" y="8" width="1" height="1" />
    </svg>
  );

  if (!shouldTwinkle) return glyph;

  return (
    <motion.span
      className={className}
      style={{ display: "inline-flex" }}
      initial={{ opacity: 0.6, scale: 0.9 }}
      animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1, 0.9] }}
      transition={{
        duration: 4.2,
        ease: "easeInOut",
        repeat: Infinity,
        delay,
      }}
    >
      {glyph}
    </motion.span>
  );
}
