"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { describeProviderError } from "./errors";

/** Only same-origin paths are followed, so `next` cannot become an open redirect. */
function safeNext(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

/**
 * Opens the modal for `/?auth=signin|signup`, optionally carrying `next=/path`
 * so a protected page can bounce here and get the user back afterwards.
 *
 * The old `/signin` and `/signup` routes redirect here, so bookmarks keep
 * working now that there is no standalone auth page. The parameters are
 * stripped from the URL afterwards so a refresh does not reopen the modal.
 */
export default function AuthQueryTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openAuth, user, readyIntent, consumeIntent } = useAuth();
  const handled = useRef(false);

  const requested = searchParams.get("auth");
  const next = safeNext(searchParams.get("next"));
  const providerError = searchParams.get("auth_error");

  useEffect(() => {
    if (handled.current) return;

    const wantsModal = requested === "signin" || requested === "signup";
    if (!wantsModal && !providerError) return;
    handled.current = true;

    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    url.searchParams.delete("next");
    url.searchParams.delete("auth_error");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );

    if (user) {
      // Already signed in — honour the destination without showing the modal.
      if (next) router.replace(next);
      return;
    }

    /*
      A provider hand-off that came back without a session used to drop the
      visitor here silently, which reads as "sign-in did nothing". Reopen the
      modal and say what happened.
    */
    openAuth(requested === "signup" ? "signup" : "signin", {
      ...(next ? { intent: { type: "navigate", href: next } } : {}),
      ...(providerError ? { error: describeProviderError(providerError) } : {}),
    });
  }, [requested, next, providerError, openAuth, user, router]);

  /* Deliver the user to the page they originally asked for. */
  useEffect(() => {
    if (readyIntent?.type !== "navigate") return;
    const { href } = readyIntent;
    consumeIntent();
    router.replace(href);
  }, [readyIntent, consumeIntent, router]);

  return null;
}
