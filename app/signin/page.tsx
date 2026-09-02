import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/**
 * Authentication happens in an in-page modal, so this route only exists to keep
 * old links alive: it bounces to the landing page and asks it to open the
 * modal. Signed-in visitors go straight to the tracker.
 */
export default async function SignInRedirect() {
  const session = await getSession();
  redirect(session ? "/applications" : "/?auth=signin");
}
