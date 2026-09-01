import { Suspense } from "react";
import AuthQueryTrigger from "@/components/auth/AuthQueryTrigger";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import ApplicationPipeline from "@/components/landing/ApplicationPipeline";
import HowItWorks from "@/components/landing/HowItWorks";
import JobFeedPreview from "@/components/landing/JobFeedPreview";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-[6px] focus:border-2 focus:border-plum focus:bg-surface focus:px-4 focus:py-2.5 focus:font-display focus:font-bold focus:text-plum"
      >
        Skip to content
      </a>
      <Suspense fallback={null}>
        <AuthQueryTrigger />
      </Suspense>
      <Navbar />
      <main id="main" className="flex-1">
        <Hero />
        <Features />
        <ApplicationPipeline />
        <HowItWorks />
        <JobFeedPreview />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
