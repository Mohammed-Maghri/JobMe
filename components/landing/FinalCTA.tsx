import { ArrowRight } from "lucide-react";
import AuthTriggerButton from "@/components/auth/AuthTriggerButton";
import PixelSparkle from "./PixelSparkle";
import Reveal from "./Reveal";
import { CONTAINER } from "./layout";

export default function FinalCTA() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden border-y-2 border-[#54293e] bg-plum py-14 sm:py-16 lg:py-20"
    >
      {/* Sparse pixel punctuation — three marks, no field of noise. */}
      <PixelSparkle
        size={14}
        color="var(--color-mustard)"
        twinkle
        className="absolute top-10 left-[8%] hidden opacity-70 sm:block"
      />
      <PixelSparkle
        size={10}
        color="#f0dcc0"
        className="absolute right-[12%] bottom-12 hidden opacity-50 sm:block"
      />
      <PixelSparkle
        size={11}
        color="var(--color-mustard)"
        twinkle
        delay={1.6}
        className="absolute top-[38%] right-[6%] hidden opacity-60 lg:block"
      />

      <div className={CONTAINER}>
        <Reveal className="mx-auto max-w-[46rem] text-center">
          <h2
            id="final-cta-heading"
            className="text-section text-balance text-surface"
          >
            Your next opportunity should not get lost in another spreadsheet.
          </h2>
          <p className="mx-auto mt-5 max-w-[34rem] text-[1.0625rem] leading-[1.6] text-surface/80">
            Keep every application, interview and follow-up moving forward in
            one place.
          </p>
          <div className="mt-8 flex justify-center">
            <AuthTriggerButton
              mode="signup"
              variant="cream"
              size="lg"
              className="w-full sm:w-auto"
            >
              Start tracking
              <ArrowRight size={17} strokeWidth={2.4} aria-hidden="true" />
            </AuthTriggerButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
