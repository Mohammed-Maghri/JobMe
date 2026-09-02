import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ApplicationsDashboard from "@/components/applications/ApplicationsDashboard";
import { CONTAINER } from "@/components/landing/layout";
import { getCurrentUser } from "@/lib/session";
import { applicationFiltersSchema } from "@/lib/applications/schemas";
import {
  getApplicationSummary,
  listApplications,
} from "@/lib/applications/queries";
import type { SortValue } from "@/lib/applications/constants";

export const metadata: Metadata = {
  title: "Applications",
  description: "Track every opportunity in one place.",
};

/** Sessions are per-request, so this page can never be cached. */
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) {
    // Bounce through the landing page's auth modal and come straight back.
    redirect(`/?auth=signin&next=${encodeURIComponent("/applications")}`);
  }

  const raw = await searchParams;
  const filters = applicationFiltersSchema.parse({
    view: raw.view,
    q: raw.q,
    status: raw.status,
    source: raw.source,
    employmentType: raw.employmentType,
    sort: raw.sort,
  });

  const [applications, summary] = await Promise.all([
    listApplications(user.id, filters),
    getApplicationSummary(user.id),
  ]);

  return (
    <>
      <Navbar active="applications" />
      <main className="flex-1 py-8 sm:py-10 lg:py-12">
        <div className={CONTAINER}>
          <ApplicationsDashboard
            applications={applications}
            summary={summary}
            filters={{
              view: filters.view,
              q: filters.q,
              status: filters.status,
              source: filters.source,
              employmentType: filters.employmentType,
              sort: filters.sort as SortValue,
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
