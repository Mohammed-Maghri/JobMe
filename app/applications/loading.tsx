import Navbar from "@/components/landing/Navbar";
import { CONTAINER } from "@/components/landing/layout";

/** Matches the real layout's rhythm so the swap does not shift anything. */
function Block({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-[10px] border-2 border-line bg-surface ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-8 sm:py-10 lg:py-12" aria-busy="true">
        <div className={CONTAINER}>
          <p className="sr-only" role="status">
            Loading your applications…
          </p>
          <div className="h-4 w-40 animate-pulse rounded bg-line/60" />
          <div className="mt-4 h-12 w-64 animate-pulse rounded bg-line/50" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Block key={index} className="h-[5.25rem]" />
            ))}
          </div>
          <Block className="mt-6 h-12" />
          <div className="mt-6 flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }, (_, index) => (
              <Block key={index} className="h-[22rem] w-[17.5rem] shrink-0" />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
