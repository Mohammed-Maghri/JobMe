"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import PixelPlane from "./PixelPlane";
import PixelButton from "./PixelButton";
import { AUTHED_NAV_LINKS, NAV_LINKS, type NavId } from "./content";
import { useAuth } from "@/components/auth/AuthProvider";
import UserMenu from "@/components/auth/UserMenu";
import { EASE_OUT } from "./motion";
import { CONTAINER } from "./layout";

/**
 * `active` is supplied by the page rather than derived from the URL. Reading
 * `useSearchParams()` here would opt the statically rendered landing page into
 * dynamic rendering, which the marketing page cannot afford.
 */
export default function Navbar({ active }: { active?: NavId } = {}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { openAuth, user, isSessionPending } = useAuth();
  /**
   * Signed-in visitors get the tracker as a real route; signed-out visitors
   * get the matching in-page anchor on the landing page.
   */
  const links = user ? AUTHED_NAV_LINKS : NAV_LINKS;
  const isCurrent = (id: NavId | undefined) => Boolean(id) && id === active;

  const close = useCallback(() => setOpen(false), []);

  /**
   * Selecting an in-page link from the sheet has to close it first: the scroll
   * lock is still on at click time, so letting the browser jump would be
   * swallowed. The target is parked here and scrolled to once `open` is false.
   */
  const pendingScroll = useRef<string | null>(null);

  const selectMobileLink = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.startsWith("#")) {
        setOpen(false);
        return;
      }
      event.preventDefault();
      pendingScroll.current = href;
      setOpen(false);
    },
    [],
  );

  /* Lock page scrolling while the mobile sheet is open. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* Deferred anchor jump, once the sheet is closed and scrolling is free. */
  useEffect(() => {
    if (open) return;
    const href = pendingScroll.current;
    if (!href) return;
    pendingScroll.current = null;
    const target = document.querySelector(href);
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", href);
  }, [open, prefersReducedMotion]);

  /* Escape closes the sheet and returns focus to the trigger. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /* A resize past the compact breakpoint should not leave scroll locked. */
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-line bg-surface">
      <nav
        aria-label="Primary"
        className={`${CONTAINER} flex items-center gap-4 py-3 lg:py-4`}
      >
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5 rounded-[4px] font-display text-[1.375rem] font-bold tracking-[-0.03em] text-espresso sm:text-[1.5rem]"
        >
          <PixelPlane size={30} className="shrink-0" />
          ApplyPilot
        </Link>

        {/* Desktop navigation */}
        <ul className="ml-auto hidden items-center gap-1 lg:flex lg:gap-2">
          {links.map((link) => {
            const current = isCurrent(link.id);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-[4px] border-b-2 px-3 text-[0.9375rem] font-medium transition-colors lg:px-4 ${
                    current
                      ? "border-plum font-semibold text-plum"
                      : "border-transparent text-espresso/80 hover:text-plum"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto hidden items-center gap-2 lg:ml-6 lg:flex lg:gap-3">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth("signin")}
                disabled={isSessionPending}
                className="inline-flex min-h-11 items-center rounded-[4px] px-3 text-[0.9375rem] font-medium text-espresso/80 transition-colors hover:text-plum disabled:opacity-60"
              >
                Sign in
              </button>
              <PixelButton
                variant="plum"
                onClick={() => openAuth("signup")}
                disabled={isSessionPending}
              >
                Get started
              </PixelButton>
            </>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close main menu" : "Open main menu"}
          className="pixel-notch-sm ml-auto inline-flex size-11 items-center justify-center border-2 border-line bg-stone text-espresso transition-colors hover:border-plum/50 lg:hidden"
        >
          {open ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={menuId}
            key="mobile-menu"
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="overflow-hidden border-t-2 border-line bg-surface lg:hidden"
          >
            <ul className={`${CONTAINER} flex flex-col gap-1 py-4`}>
              {links.map((link) => {
                const current = isCurrent(link.id);
                return (
                  <li key={link.href}>
                    {link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        onClick={(event) => selectMobileLink(event, link.href)}
                        className="flex min-h-12 items-center rounded-[4px] border-b border-line/70 px-2 text-base font-medium text-espresso"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={close}
                        aria-current={current ? "page" : undefined}
                        className={`flex min-h-12 items-center rounded-[4px] border-b border-line/70 px-2 text-base font-medium ${
                          current ? "font-semibold text-plum" : "text-espresso"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
              {user ? (
                <li className="pt-3">
                  <UserMenu compact />
                </li>
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        openAuth("signin");
                      }}
                      className="flex min-h-12 w-full items-center rounded-[4px] px-2 text-left text-base font-medium text-espresso"
                    >
                      Sign in
                    </button>
                  </li>
                  <li className="pt-1">
                    <PixelButton
                      variant="plum"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        close();
                        openAuth("signup");
                      }}
                    >
                      Get started
                    </PixelButton>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
