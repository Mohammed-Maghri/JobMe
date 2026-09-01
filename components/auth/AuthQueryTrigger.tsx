"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

/**
 * Opens the modal for `/?auth=signin|signup`.
 *
 * The old `/signin` and `/signup` routes redirect here, so bookmarks and the
 * "View job" call to action keep working now that there is no standalone auth
 * page. The parameter is stripped from the URL afterwards so a refresh does not
 * reopen the modal.
 */
export default function AuthQueryTrigger() {
  const searchParams = useSearchParams();
  const { openAuth, user } = useAuth();
  const handled = useRef(false);

  const requested = searchParams.get("auth");

  useEffect(() => {
    if (handled.current) return;
    if (requested !== "signin" && requested !== "signup") return;
    handled.current = true;

    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);

    if (!user) openAuth(requested);
  }, [requested, openAuth, user]);

  return null;
}
