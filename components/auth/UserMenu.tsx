"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, LogOut, Loader2 } from "lucide-react";
import { EASE_OUT } from "@/components/landing/motion";
import { signOut } from "@/lib/auth-client";
import { useAuth } from "./AuthProvider";

/** Initial shown in the avatar tile when the user has no picture. */
function initialFor(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email;
  return source.charAt(0).toUpperCase();
}

export default function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  if (!user) return null;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      setOpen(false);
      /**
       * Better Auth clears the session cookie; `refresh()` re-runs the server
       * components so anything rendered from the session disappears, and the
       * client session store re-reads on the next render.
       */
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${compact ? "w-full" : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={`inline-flex min-h-11 items-center gap-2 rounded-[6px] border-2 border-line bg-stone px-2.5 text-left transition-colors hover:border-plum/45 ${
          compact ? "w-full" : "max-w-[15rem]"
        }`}
      >
        <span
          aria-hidden="true"
          className="pixel-notch-sm inline-flex size-7 shrink-0 items-center justify-center border-2 border-plum/35 bg-plum font-display text-[0.8125rem] font-bold text-surface"
        >
          {initialFor(user.name, user.email)}
        </span>
        <span className="min-w-0 flex-1 truncate text-[0.875rem] font-medium text-espresso">
          {user.email}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={2.3}
          aria-hidden="true"
          className={`shrink-0 text-espresso/55 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Account"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className={`z-50 rounded-[8px] border-2 border-line bg-surface p-1.5 shadow-pixel-md ${
              compact
                ? "relative mt-2 w-full"
                : "absolute top-[calc(100%+0.5rem)] right-0 w-[15rem]"
            }`}
          >
            <p className="px-2.5 pt-1.5 pb-2 text-[0.75rem] text-espresso/55">
              Signed in as
              <span className="mt-0.5 block truncate font-medium text-espresso/80">
                {user.email}
              </span>
            </p>
            <div aria-hidden="true" className="mx-1 h-[2px] bg-line/70" />
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="mt-1.5 inline-flex min-h-11 w-full items-center gap-2 rounded-[4px] px-2.5 text-left font-display text-[0.9375rem] font-bold text-plum transition-colors hover:bg-plum/8 disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <LogOut size={16} strokeWidth={2.2} aria-hidden="true" />
              )}
              {signingOut ? "Logging out…" : "Log out"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
