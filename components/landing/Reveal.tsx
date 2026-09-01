"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "./motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical travel in pixels. Kept small on purpose. */
  distance?: number;
  as?: "div" | "li" | "section";
};

/**
 * One-shot scroll reveal. Short, small and never repeated — the page should
 * settle, not keep moving while you read it.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  distance = 14,
  as = "div",
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as];

  if (prefersReducedMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.42, ease: EASE_OUT, delay }}
    >
      {children}
    </Component>
  );
}
