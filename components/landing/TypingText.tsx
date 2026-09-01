"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type TypingTextProps = {
  text: string;
  className?: string;
  /** Milliseconds per character. */
  speed?: number;
};

/**
 * Types a single search query out once, the first time the feed scrolls into
 * view, then stops. The full string is always exposed to assistive tech, and
 * reduced-motion readers get it rendered whole with no caret.
 */
export default function TypingText({
  text,
  className = "",
  speed = 55,
}: TypingTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setTyped(index);
      if (index >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [inView, prefersReducedMotion, speed, text]);

  const visible = prefersReducedMotion ? text : text.slice(0, typed);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{visible}</span>
      {!prefersReducedMotion && (
        <span
          aria-hidden="true"
          className="ml-[2px] inline-block h-[0.95em] w-[2px] translate-y-[2px] bg-espresso/70 animate-caret"
        />
      )}
    </span>
  );
}
