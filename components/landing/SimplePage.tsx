import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PixelSparkle from "./PixelSparkle";
import type { ReactNode } from "react";

type SimplePageProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

/**
 * Shared shell for the small routes the landing page links to, so no navigation
 * item or call to action ends on a dead URL.
 */
export default function SimplePage({
  eyebrow,
  title,
  children,
}: SimplePageProps) {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[46rem] px-5 sm:px-8">
          <div className="rounded-[10px] border-2 border-line bg-surface p-6 shadow-pixel-sm sm:p-9">
            <p className="flex items-center gap-2.5 font-display text-[0.75rem] font-bold tracking-[0.16em] text-plum uppercase">
              <PixelSparkle size={12} color="var(--color-terracotta)" />
              {eyebrow}
            </p>
            <h1 className="mt-3 text-section text-balance text-espresso">
              {title}
            </h1>
            <div className="mt-5 flex flex-col gap-4 text-[1.0625rem] leading-[1.65] text-espresso/75">
              {children}
            </div>
            <Link
              href="/"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-[6px] border-2 border-plum/45 bg-stone px-4 font-display font-bold text-plum shadow-pixel-xs transition-colors hover:border-plum"
            >
              <ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" />
              Back to ApplyPilot
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
